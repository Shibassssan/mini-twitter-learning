# mini-twitter データモデル定義

## 設計方針

- **ID**: 全テーブルに `bigint`(PK, 内部用) + `uuid`(UNIQUE, API/外部公開用) を持つ
- **検索**: ユーザー名・表示名・ツイート本文の部分一致検索に `pg_trgm` を使用（2文字以下の検索は非対応）
- **認証分離**: 認証情報（email, password_digest）は `credentials` テーブルに分離。将来のOAuth拡張に対応可能
- **UUID公開**: GraphQL APIでは内部bigint IDを公開せず、uuidをIDとして返す

## 共通カラム

全テーブルに以下を含む:
- `id` (bigint, PK, 自動連番)
- `uuid` (uuid, UNIQUE, API公開用)
- `created_at` (datetime)
- `updated_at` (datetime)

UUID生成は `HasUuid` concern で共通化:

```ruby
module HasUuid
  extend ActiveSupport::Concern

  included do
    before_create :generate_uuid
    validates :uuid, uniqueness: true
  end

  private

  def generate_uuid
    self.uuid ||= SecureRandom.uuid
  end
end
```

## テーブル定義

### users（プロフィール）

| カラム | 型 | 制約 | 説明 |
|--------|------|------|------|
| id | bigint | PK | 内部ID |
| uuid | uuid | UNIQUE, NOT NULL | API公開用ID |
| username | string | UNIQUE, NOT NULL | ログインID、英数字+_, 3~15文字 (BR-1) |
| display_name | string | NOT NULL | 表示名、最大50文字 (BR-6) |
| bio | text | | 自己紹介、最大200文字 (BR-5) |
| created_at | datetime | NOT NULL | |
| updated_at | datetime | NOT NULL | |

**インデックス:**
- `uuid` (UNIQUE)
- `username` (UNIQUE)
- `username` (GIN, pg_trgm — ユーザー検索用)
- `display_name` (GIN, pg_trgm — ユーザー検索用)

**リレーション:**
- `has_one :credential`
- `has_many :tweets`
- `has_many :likes`
- `has_many :active_follows, class_name: "Follow", foreign_key: :follower_id`（フォロー中）
- `has_many :passive_follows, class_name: "Follow", foreign_key: :followed_id`（フォロワー）

### credentials（認証）

| カラム | 型 | 制約 | 説明 |
|--------|------|------|------|
| id | bigint | PK | 内部ID |
| uuid | uuid | UNIQUE, NOT NULL | API公開用ID |
| user_id | bigint | FK → users, UNIQUE, NOT NULL | 1ユーザーにつき1認証 |
| email | string | UNIQUE, NOT NULL | メールアドレス (BR-2) |
| password_digest | string | NOT NULL | bcryptハッシュ (BR-3: 8文字以上) |
| created_at | datetime | NOT NULL | |
| updated_at | datetime | NOT NULL | |

**インデックス:**
- `uuid` (UNIQUE)
- `user_id` (UNIQUE)
- `email` (UNIQUE)

**リレーション:**
- `belongs_to :user`

**備考:** 将来OAuth追加時は `oauth_providers` テーブルを追加。`credentials`を持たないユーザーでもOAuthのみでログイン可能にする設計。

### tweets

| カラム | 型 | 制約 | 説明 |
|--------|------|------|------|
| id | bigint | PK | 内部ID |
| uuid | uuid | UNIQUE, NOT NULL | API公開用ID |
| user_id | bigint | FK → users, NOT NULL | 投稿者 |
| content | string(300) | NOT NULL | ツイート本文、1~300文字 (BR-4) |
| created_at | datetime | NOT NULL | |
| updated_at | datetime | NOT NULL | |

**インデックス:**
- `uuid` (UNIQUE)
- `[user_id, created_at DESC]`（ユーザーのツイート一覧、タイムライン用）
- `content` (GIN, pg_trgm — ツイート検索用)

**リレーション:**
- `belongs_to :user` (foreign_key: :user_id)
- `has_many :likes`

**備考:** 編集機能なし（Twitter準拠）。updated_atはRails標準のため付与。

### likes

| カラム | 型 | 制約 | 説明 |
|--------|------|------|------|
| id | bigint | PK | 内部ID |
| uuid | uuid | UNIQUE, NOT NULL | API公開用ID |
| user_id | bigint | FK → users, NOT NULL | いいねしたユーザー |
| tweet_id | bigint | FK → tweets, NOT NULL | いいねされたツイート |
| created_at | datetime | NOT NULL | |
| updated_at | datetime | NOT NULL | |

**インデックス:**
- `uuid` (UNIQUE)
- `[user_id, tweet_id]` (UNIQUE — 重複いいね防止 BR-8)

**リレーション:**
- `belongs_to :user`
- `belongs_to :tweet`

### follows

| カラム | 型 | 制約 | 説明 |
|--------|------|------|------|
| id | bigint | PK | 内部ID |
| uuid | uuid | UNIQUE, NOT NULL | API公開用ID |
| follower_id | bigint | FK → users, NOT NULL | フォローする側 |
| followed_id | bigint | FK → users, NOT NULL | フォローされる側 |
| created_at | datetime | NOT NULL | |
| updated_at | datetime | NOT NULL | |

**インデックス:**
- `uuid` (UNIQUE)
- `[follower_id, followed_id]` (UNIQUE — 重複フォロー防止)
- `followed_id`（フォロワー一覧取得用）

**リレーション:**
- `belongs_to :follower, class_name: "User"`
- `belongs_to :followed, class_name: "User"`

**備考:** 自分自身のフォローはアプリケーション層で防止 (BR-7)

### active_storage_blobs / active_storage_attachments

Rails Active Storage 標準テーブル（`rails active_storage:install` で自動生成）。ユーザーアイコン画像の保存に使用。

- 保存先: ローカル（MVP段階）
- 制約: 最大2MB、JPEG/PNG/WebP (BR-11)
- 本番化時に config 変更のみで S3 に切替可能

## ER図（テキスト）

```
users 1──1 credentials
  │
  ├──* tweets ──* likes
  │                 │
  └─────────────────┘ (user_id)
  │
  ├──* follows (as follower)
  └──* follows (as followed)
  │
  └── active_storage_attachments (アイコン画像)
```

## 将来の拡張テーブル（MVP後）

| テーブル | 対応機能 |
|---------|---------|
| oauth_providers | OAuth連携（Google/GitHub） |
| replies | リプライ（tweets に parent_id 追加も検討） |
| retweets | リツイート |
| notifications | いいね・フォロー通知 |
| direct_messages | DM |
| hashtags / tweet_hashtags | ハッシュタグ |
| bookmarks | ブックマーク |
