# mini-twitter API仕様（GraphQLスキーマ設計）

## 設計方針

- GraphQL単一エンドポイント: `POST /graphql`
- 認証: jwt_sessions（Access Token + Refresh Token）
  - Access Token: メモリ（Zustand）に保持、短命（15-30分）
  - Refresh Token: HttpOnly Cookieに保持、長命（2週間）
  - トークン無効化: ログアウト時にRedisから削除 + Cookie破棄
  - セキュリティ: CSP（Content-Security-Policy）でXSS防止、dangerouslySetInnerHTML禁止
- ページネーション: Relay Connection（カーソルベース、20件/ページ）
- ID: 全てuuidを外部公開用IDとして使用（内部bigintは非公開）
- ファイルアップロード: graphql-multipart-request-spec準拠、テキスト更新とは別mutation

## 型定義

```graphql
type User {
  id: ID!                    # uuid
  username: String!
  displayName: String!
  bio: String
  avatarUrl: String
  tweetsCount: Int!
  followingCount: Int!
  followersCount: Int!
  isFollowedByMe: Boolean!  # ログインユーザーがフォロー中か
  createdAt: DateTime!
}

type Tweet {
  id: ID!                    # uuid
  content: String!
  author: User!
  likesCount: Int!
  isLikedByMe: Boolean!     # ログインユーザーがいいね済みか
  createdAt: DateTime!
}

type AuthPayload {
  accessToken: String!
  user: User!
}
# refreshToken は HttpOnly Cookie でクライアントに送信される（レスポンスボディには含まない）

# Relay Connection（カーソルページネーション）
type TweetConnection {
  edges: [TweetEdge!]!
  pageInfo: PageInfo!
}

type TweetEdge {
  node: Tweet!
  cursor: String!
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
}

type UserEdge {
  node: User!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  endCursor: String
}

enum TimelineScope {
  FOLLOWING  # フォロー中ユーザーのツイートのみ
  GLOBAL     # 全ユーザーのツイート
}
```

## Query（データ取得）

| Query | 引数 | 戻り値 | 認証 | 対応要件 |
|-------|------|--------|------|----------|
| `me` | なし | User | 必須 | ログイン中ユーザーの情報 |
| `userByUsername` | username: String! | User | 必須 | URL `/:username` からのプロフィール表示 (US-19) |
| `timeline` | first: Int, after: String | TweetConnection | 必須 | フォロータイムライン (US-8) |
| `publicTimeline` | first: Int, after: String | TweetConnection | 必須 | 全体タイムライン (US-9) |
| `userTweets` | uuid: ID!, first: Int, after: String | TweetConnection | 必須 | ユーザーのツイート一覧 (US-21) |
| `likedTweets` | first: Int, after: String | TweetConnection | 必須 | 自分のいいね一覧 (US-14) |
| `followers` | uuid: ID!, first: Int, after: String | UserConnection | 必須 | フォロワー一覧 (US-17) |
| `following` | uuid: ID!, first: Int, after: String | UserConnection | 必須 | フォロー中一覧 (US-17) |
| `searchUsers` | query: String!, first: Int, after: String | UserConnection | 必須 | ユーザー検索 (US-22) |
| `searchTweets` | query: String!, first: Int, after: String | TweetConnection | 必須 | ツイート検索 (US-23) |

## Mutation（操作）

| Mutation | 引数 | 戻り値 | 認証 | 対応要件 |
|----------|------|--------|------|----------|
| `signUp` | username: String!, email: String!, password: String!, displayName: String! | AuthPayload | 不要 | アカウント作成 (US-1) |
| `signIn` | email: String!, password: String! | AuthPayload | 不要 | ログイン (US-2) |
| `signOut` | なし | Boolean | 必須 | ログアウト (US-3) |
| `refreshToken` | なし（HttpOnly Cookieで自動送信） | AuthPayload | 不要 | トークン更新 (US-4) |
| `createTweet` | content: String! | Tweet | 必須 | ツイート投稿 (US-5) |
| `deleteTweet` | uuid: ID! | Boolean | 必須 | ツイート削除 (US-6) |
| `likeTweet` | tweetUuid: ID! | Tweet | 必須 | いいね (US-11) |
| `unlikeTweet` | tweetUuid: ID! | Tweet | 必須 | いいね取消 (US-12) |
| `follow` | userUuid: ID! | User | 必須 | フォロー (US-15) |
| `unfollow` | userUuid: ID! | User | 必須 | フォロー解除 (US-16) |
| `updateProfile` | displayName: String, bio: String | User | 必須 | プロフィール編集 (US-20) |
| `updateAvatar` | avatar: Upload! | User | 必須 | アイコン更新 (US-20) |

### Mutation戻り値の設計意図

- **likeTweet/unlikeTweet → Tweet**: 更新後のTweetを返すことで、Apollo Clientの正規化キャッシュがlikesCount/isLikedByMeを全画面で自動更新
- **follow/unfollow → User**: 同様にfollowingCount/followersCount/isFollowedByMeが自動更新
- **updateProfile/updateAvatar → User**: 更新後のユーザー情報がキャッシュに反映
- **deleteTweet → Boolean**: 削除後はキャッシュからevictする（Apollo cache.evict）
- **updateAvatar分離の理由**: ファイルアップロード（multipart request）とテキスト更新（JSON）は処理パスが異なるため

## Subscription（リアルタイム / SSE）

| Subscription | 引数 | 戻り値 | 対応要件 |
|-------------|------|--------|----------|
| `tweetAdded` | scope: TimelineScope! | Tweet | 新着ツイート通知 (US-25)。`FOLLOWING`: フォロー中ユーザーのみ、`GLOBAL`: 全ユーザー |
| `tweetLikeUpdated` | tweetUuid: ID! | Tweet | いいね数の更新 (US-26) |

## 認証フロー

```
1. サインアップ/サインイン
   Client → signUp/signIn mutation → Rails
   Rails → jwt_sessions でトークン生成 → Redis に保存
   Rails → AuthPayload { accessToken, user } をレスポンスボディで返す
        → refreshToken は Set-Cookie (HttpOnly, Secure, SameSite=Lax) でクライアントに送信
   Client → accessToken をメモリ（Zustand）に保持

2. 認証付きリクエスト
   Client → Authorization: Bearer <accessToken> → Rails
   Rails → jwt_sessions が Redis と照合 → 有効なら処理続行

3. トークン期限切れ
   Client → 401 を受信
   Client → refreshToken mutation（引数なし、Cookie が自動送信される）で新しい accessToken 取得
   Client → 元のリクエストをリトライ

4. ログアウト
   Client → signOut mutation → Rails
   Rails → jwt_sessions が Redis からトークン削除（無効化）
        → Set-Cookie で refreshToken Cookie を破棄（Max-Age=0）
   Client → メモリをクリア

5. ページリロード
   Client → refreshToken mutation（Cookie が自動送信される）
        → 新しい accessToken 取得
```

> **CORS設定**: フロントエンドからCookieを送信するために、クライアント側で `credentials: 'include'`、サーバー側で `Access-Control-Allow-Credentials: true` の設定が必要。

## セキュリティ

- **CSP（Content-Security-Policy）**: インラインスクリプトと外部スクリプトを制限し、XSS自体を防止
- **トークン無効化**: jwt_sessions がRedisでトークンを管理。ログアウト時に即座に無効化可能
- **CORS**: フロントエンドオリジンのみ許可（rack-cors）。`Access-Control-Allow-Credentials: true` でCookie送信を許可
- **レート制限**: rack-attack で認証エンドポイント 5回/分、投稿 30回/分

## エラーハンドリング

- **戦略**: すべてのエラーはGraphQL標準のトップレベルエラー形式で返す
  ```json
  {
    "data": null,
    "errors": [
      {
        "message": "エラーメッセージ",
        "extensions": {
          "code": "AUTHENTICATION_ERROR"
        }
      }
    ]
  }
  ```
- **MVPではUnion型エラー（Result型パターン）は採用しない** — シンプルさを優先し、`errors` 配列でエラーを表現する
- 主なエラーコード:
  - `AUTHENTICATION_ERROR` — 未認証・トークン無効
  - `AUTHORIZATION_ERROR` — 権限不足（他人のツイート削除など）
  - `VALIDATION_ERROR` — バリデーションエラー（入力値不正）
  - `NOT_FOUND` — リソースが見つからない

## ページネーション仕様

- Relay Connection準拠のカーソルベース
- デフォルト: 20件/ページ
- カーソル: created_atベースのBase64エンコード値
- `first` + `after` で次ページ取得（前方ページネーション）

```graphql
# 初回取得
query { timeline(first: 20) { edges { node { id content } cursor } pageInfo { hasNextPage endCursor } } }

# 次ページ
query { timeline(first: 20, after: "cursorValue") { ... } }
```
