# mini-twitter

Twitter ライクな SNS の学習用フルスタック実装。
Ruby on Rails（GraphQL API）と React 19（SPA）を分離構成で組み合わせ、認証・タイムライン・いいね・フォロー・リアルタイム更新といった SNS の基本機能を一通り実装している。

> **学習目的のプロジェクトです。** DB 設計・GraphQL API 設計・JWT 認証・リアルタイム通信（GraphQL Subscription）・楽観的更新などの実践を目的としています。

> **バイブコーディングで開発しています。** 設計・実装ともに AI（Claude）との対話を主軸に進めており、要件定義・技術選定・スキーマ設計・コード生成のすべてにおいて AI を活用しています。コードの意図を理解した上で AI に指示を出すスタイルを意識しています。

---

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────┐
│  ブラウザ                                           │
│  React 19 SPA（Vite 8 / TypeScript 6.0）            │
│  ├─ Apollo Client  ──────────────────── GraphQL     │
│  └─ Zustand        （認証・UI 状態）                │
└────────────────────┬────────────────────────────────┘
                     │ HTTP / WebSocket
                     ▼
┌─────────────────────────────────────────────────────┐
│  Rails 8.1 API サーバー（ポート 3000）              │
│  └─ graphql-ruby（単一エンドポイント POST /graphql）│
│       ├─ Query / Mutation                           │
│       └─ Subscription（Action Cable transport）     │
└──────────┬──────────────────┬───────────────────────┘
           │                  │
    ┌──────▼──────┐    ┌──────▼──────┐
    │ PostgreSQL  │    │    Redis    │
    │     17      │    │      7      │
    │（メイン DB）│    │（JWT トークン│
    └─────────────┘    │  管理）     │
                       └─────────────┘
```

- **フロントエンドとバックエンドは完全に分離**しており、両者は GraphQL API のみで通信します。
- **リアルタイム機能**（新着ツイート通知・いいね数の即時反映）は GraphQL Subscription + Action Cable（WebSocket）で実現しています。
- **認証**は JWT（Access Token + Refresh Token）を使い、Refresh Token は HttpOnly Cookie に保存することで XSS から保護しています。
- **楽観的更新**（いいね・フォロー操作のレスポンス前に UI を即更新）により、操作感を向上させています。

---

## 機能一覧

| カテゴリ     | 機能                                                                                  |
| ------------ | ------------------------------------------------------------------------------------- |
| 認証         | サインアップ / ログイン / ログアウト / セッション維持（HttpOnly Cookie）              |
| ツイート     | テキスト投稿（最大 300 文字）/ 削除（本人のみ・確認ダイアログあり）                   |
| タイムライン | フォロータイムライン / 全体タイムライン（タブ切替）/ 無限スクロール（カーソルベース） |
| いいね       | トグル式（1 ユーザー 1 いいね）/ いいね数表示 / 自分のいいね一覧                      |
| フォロー     | フォロー / 解除 / フォロー中・フォロワー一覧 / カウント表示                           |
| プロフィール | 表示名・自己紹介・アイコン画像の表示・編集（本人のみ）                                |
| 検索         | ユーザー名・ツイート本文のキーワード部分一致検索                                      |
| リアルタイム | 新着ツイート通知バナー / いいね数のリアルタイム反映（GraphQL Subscription）           |

---

## 技術スタック

### バックエンド

| 技術               | バージョン        | 用途                                            |
| ------------------ | ----------------- | ----------------------------------------------- |
| Ruby on Rails      | 8.1（API モード） | API サーバー                                    |
| graphql-ruby       | 1.12+             | GraphQL Query / Mutation / Subscription         |
| PostgreSQL         | 17                | メインデータストア（pg_trgm で全文検索）        |
| Redis              | 7                 | JWT Refresh Token の管理                        |
| jwt_sessions       | —                 | Access Token + Refresh Token 認証               |
| Active Storage     | Rails 標準        | アイコン画像のローカル保存（S3 切替可）         |
| RSpec + FactoryBot | —                 | テスト（カバレッジ目標 80%）                    |
| rack-cors          | —                 | CORS 設定（フロントエンド別オリジン対応）       |
| rack-attack        | —                 | レート制限（認証: 5 req/min、投稿: 30 req/min） |

### フロントエンド

| 技術                  | バージョン | 用途                                                                |
| --------------------- | ---------- | ------------------------------------------------------------------- |
| React                 | 19         | SPA                                                                 |
| TypeScript            | 6.0        | 型安全な実装                                                        |
| Vite                  | 8          | ビルドツール・開発サーバー                                          |
| TanStack Router       | —          | 型安全なクライアントサイドルーティング                              |
| Apollo Client         | —          | GraphQL クライアント / 正規化キャッシュ / 楽観的更新 / Subscription |
| Zustand               | —          | クライアント状態管理（認証状態・モーダル開閉など）                  |
| HeroUI                | v3         | UI コンポーネントライブラリ                                         |
| Tailwind CSS          | v4         | ユーティリティファースト CSS                                        |
| React Hook Form + Zod | —          | フォーム管理 / スキーマバリデーション                               |
| graphql-codegen       | —          | GraphQL スキーマから TypeScript 型を自動生成                        |
| dayjs                 | —          | 日付の相対表示（「3 分前」など）                                    |
| Biome                 | —          | Linter / Formatter                                                  |
| pnpm                  | —          | パッケージマネージャ                                                |

### 開発環境の方針

PostgreSQL と Redis は Docker コンテナで管理し、Rails サーバーと Vite はローカルで直接実行します。これにより、コンテナ内でのデバッグの煩雑さを避けつつ、DB・キャッシュのみをコンテナで隔離しています。

---

## 画面一覧

| パス                     | 画面                                                       | 要ログイン                         |
| ------------------------ | ---------------------------------------------------------- | ---------------------------------- |
| `/signup`                | サインアップ                                               | 不要（ログイン済みはリダイレクト） |
| `/login`                 | ログイン                                                   | 不要（ログイン済みはリダイレクト） |
| `/`                      | ホーム / タイムライン（フォロー中・全体のタブ切替）        | 必須                               |
| `/compose`               | ツイート投稿（モバイル専用。デスクトップはインライン入力） | 必須                               |
| `/:username`             | プロフィール（投稿・いいねのタブ切替）                     | 必須                               |
| `/:username/connections` | フォロー / フォロワー一覧（`?tab=followers\|following`）   | 必須                               |
| `/search`                | 検索（ユーザー・ツイートのタブ切替）                       | 必須                               |

---

## ディレクトリ構成

```
mini-twitter/
├── backend/              # Rails 8.1 API サーバー
│   ├── app/
│   │   ├── graphql/      # GraphQL スキーマ定義・リゾルバ・型
│   │   ├── models/       # ActiveRecord モデル
│   │   └── ...
│   ├── spec/             # RSpec テスト
│   ├── db/               # マイグレーション・シードデータ
│   └── config/           # 環境設定・ルーティング
├── frontend/             # React 19 SPA
│   └── src/
│       ├── components/   # 再利用可能な UI コンポーネント
│       ├── routes/       # ページコンポーネント（TanStack Router）
│       ├── lib/          # Apollo クライアント・フック・ユーティリティ
│       └── lib/graphql/generated/  # graphql-codegen 生成ファイル
├── docs/                 # 設計ドキュメント
└── docker-compose.yml    # PostgreSQL・Redis のコンテナ定義
```

---

## セットアップ

### 前提条件

以下がインストールされていること。

| ツール                  | 推奨バージョン | インストール方法                                                  |
| ----------------------- | -------------- | ----------------------------------------------------------------- |
| Ruby                    | 3.3 以上       | [rbenv](https://github.com/rbenv/rbenv) 推奨                      |
| Node.js                 | 20 以上        | [nvm](https://github.com/nvm-sh/nvm) 推奨                         |
| pnpm                    | 9 以上         | `npm install -g pnpm`                                             |
| Docker + Docker Compose | —              | [Docker Desktop](https://www.docker.com/products/docker-desktop/) |

### 手順

#### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd mini-twitter
```

#### 2. 環境変数を設定

```bash
cp backend/.env.example backend/.env
```

`.env` を開き、必要に応じて値を編集してください。開発環境では `docker-compose.yml` のデフォルト値と合わせておく必要があります。

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/mini_twitter_development
REDIS_URL=redis://localhost:6379/0
SECRET_KEY_BASE=（bin/rails secret で生成した値）
JWT_SECRET=（任意のランダム文字列）
```

#### 3. PostgreSQL・Redis を起動

```bash
docker compose up -d db redis
```

バックグラウンドで PostgreSQL（5432 ポート）と Redis（6379 ポート）が起動します。

#### 4. バックエンドをセットアップ

```bash
cd backend
bundle install          # Gem をインストール
bin/rails db:create     # データベースを作成
bin/rails db:migrate    # テーブルを作成
bin/rails db:seed       # 初期データを投入（デモユーザー等）
bin/rails server        # サーバーを起動（ポート 3000）
```

#### 5. フロントエンドをセットアップ

別のターミナルで実行してください。

```bash
cd frontend
pnpm install    # 依存パッケージをインストール
pnpm codegen    # GraphQL スキーマから TypeScript 型を生成
pnpm dev        # 開発サーバーを起動（ポート 5173）
```

#### 6. ブラウザでアクセス

| URL                             | 内容                          |
| ------------------------------- | ----------------------------- |
| `http://localhost:5173`         | アプリ（フロントエンド）      |
| `http://localhost:3000/graphql` | GraphQL エンドポイント（API） |

> **まとめて起動したい場合:** `foreman` をインストールすると `bin/dev` で全プロセスを一括起動できます（`gem install foreman`）。

---

## 開発コマンド

### バックエンド（`backend/` ディレクトリで実行）

```bash
bin/rails server                  # サーバー起動
bin/rails db:migrate              # マイグレーション実行
bin/rails db:rollback             # 直前のマイグレーションを戻す
bin/rails db:seed                 # シードデータを投入
bundle exec rspec                 # テストを全件実行
bundle exec rspec spec/requests/  # リクエストテストのみ実行
```

### フロントエンド（`frontend/` ディレクトリで実行）

```bash
pnpm dev        # 開発サーバー起動（ホットリロードあり）
pnpm build      # プロダクション向けビルド
pnpm lint       # Biome で lint チェック
pnpm format     # Biome でコードフォーマット
pnpm codegen    # GraphQL スキーマから TypeScript 型を再生成
```

---

## 設計ドキュメント

詳細な仕様は `docs/` ディレクトリを参照してください。

| ドキュメント                                              | 内容                                                    |
| --------------------------------------------------------- | ------------------------------------------------------- |
| [requirements.md](./docs/requirements.md)                 | 要件定義・ユーザーストーリー・ビジネスルール            |
| [tech-stack.md](./docs/tech-stack.md)                     | 技術スタック詳細                                        |
| [tech-stack-decisions.md](./docs/tech-stack-decisions.md) | 技術選定の背景・比較・トレードオフ                      |
| [data-model.md](./docs/data-model.md)                     | DB スキーマ・ER 図                                      |
| [api-spec.md](./docs/api-spec.md)                         | GraphQL スキーマ仕様（Query / Mutation / Subscription） |
| [screen-spec.md](./docs/screen-spec.md)                   | 画面仕様・コンポーネント設計                            |
| [implementation-plan.md](./docs/implementation-plan.md)   | 実装フェーズ・タスク一覧                                |

---

## このバージョンに含まれないもの

MVP として次の機能は実装対象外です。将来の拡張候補として `docs/requirements.md` に記載しています。

- 画像付きツイート（プロフィールアイコンのアップロードは対象内）
- リプライ / リツイート / 引用ツイート
- DM（ダイレクトメッセージ）
- 通知機能
- パスワードリセット（メール送信）
- 管理者機能
- 多言語対応（日本語のみ）
