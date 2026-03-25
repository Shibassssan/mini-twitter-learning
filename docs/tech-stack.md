# mini-twitter 技術スタック

## バックエンド

### Ruby on Rails 8.0（APIモード）

- **バージョン**: Ruby + Rails 8.0
- **用途**: APIサーバー（GraphQLエンドポイント提供）
- **主要gem**: `rails` (API mode), `rack-cors`, `rack-attack`

### GraphQL: graphql-ruby

- **バージョン**: graphql-ruby 1.12+
- **用途**: APIレイヤー（Query / Mutation / Subscription）
- **主要機能**:
  - 組み込みDataloader（fiber使用、N+1対策。追加gem不要）
  - Relay Connection（カーソルベースページネーション）

### ORM: ActiveRecord

- **用途**: データベースアクセス、マイグレーション管理
- **備考**: Rails標準。GraphQLとの連携実績が豊富

### 認証: jwt_sessions

- **用途**: JWT認証（Access Token + Refresh Token）
- **トークン管理**: Redis
- **主要gem**: `jwt_sessions`

### データベース: PostgreSQL 17

- **バージョン**: 17
- **用途**: メインデータストア
- **管理方法**: Docker公式イメージ
- **備考**: pg_trgm + tsvectorによる日本語全文検索対応

### 画像ストレージ: Active Storage

- **用途**: ユーザーアバター、ツイート画像等
- **保存先**: ローカル（MVP段階）。config変更のみでS3に切替可能
- **主要gem**: `activestorage`（Rails標準）

### テスト: RSpec + FactoryBot

- **主要gem**: `rspec-rails`, `factory_bot_rails`, `shoulda-matchers`
- **用途**: ユニットテスト、リクエストテスト

### CORS: rack-cors

- **主要gem**: `rack-cors`
- **用途**: フロントエンド（別オリジン）からのAPI呼び出し許可

### レート制限: rack-attack

- **主要gem**: `rack-attack`
- **用途**: APIエンドポイントへのリクエスト制限

---

## フロントエンド

### React 19 + TypeScript 5.9 + Vite 8

- **用途**: SPA構築基盤
- **ビルドツール**: Vite 8

### ルーティング: TanStack Router

- **用途**: クライアントサイドルーティング（型安全）

### GraphQLクライアント: Apollo Client

- **バンドルサイズ**: ~50KB
- **用途**: GraphQLデータ取得、正規化キャッシュ、楽観的更新、Subscription
- **備考**: サーバー状態の一元管理を担当

### クライアント状態管理: Zustand

- **バンドルサイズ**: ~2KB
- **用途**: 認証状態（user / token / isAuthenticated）、UI状態（モーダル開閉、タブ切替等）
- **備考**: サーバー状態はApollo Clientが管理。Zustandはクライアント固有の状態のみ

### スタイリング: Tailwind CSS v4

- **用途**: ユーティリティファーストCSS（ゼロランタイム、ビルド時生成）

### UIライブラリ: HeroUI v2

- **バージョン**: v2（安定版）
- **用途**: UIコンポーネント（75+コンポーネント）
- **ベース**: React Aria

### フォーム: React Hook Form + Zod

- **用途**: フォーム状態管理 + バリデーション
- **主要パッケージ**: `react-hook-form`, `zod`, `@hookform/resolvers`

### 日付: dayjs

- **バンドルサイズ**: ~2KB
- **用途**: 日付のフォーマット・相対表示

### codegen: graphql-codegen

- **用途**: GraphQLスキーマからTypeScript型を自動生成
- **主要パッケージ**: `@graphql-codegen/cli`, Apollo Client + React用プラグイン

---

## インフラ・開発環境

| 項目 | 技術 | 備考 |
|------|------|------|
| ローカル環境構成 | A（DBだけコンテナ） | Rails・Viteはローカル直接実行、PostgreSQL + Redis は Docker（docker-compose） |
| Ruby バージョン管理 | rbenv | ローカルRuby実行のため |
| JSランタイム | Node.js | 全ツール（Vite, Apollo, codegen, pnpm）との互換性確保 |
| パッケージマネージャ | pnpm | フロントエンド依存管理 |
| リンター/フォーマッター | Biome | lint + format を一括処理 |
| 起動方法 | ターミナル3つ or Procfile.dev | `docker compose up` / `bin/rails s` / `pnpm dev`、またはProcfile.devで一括起動 |

---

## 状態管理の責務分担

| 責務 | 管理ツール | 対象データ |
|------|-----------|-----------|
| サーバー状態 | Apollo Client | GraphQLデータ、正規化キャッシュ、楽観的更新、Subscription |
| クライアント状態 | Zustand | 認証（user / token / isAuthenticated）、UI（モーダル開閉、タブ切替等） |

---

## 主要な技術的決定の背景

- **Ruby on Rails**: TSフルスタック構成も検討したが、ツール学習より「GraphQL + SNS設計」の本質に集中するため、業務経験のあるRailsを選択
- **GraphQL**: SNSはエンティティ間のリレーションが複雑で、画面ごとに必要データが異なるためGraphQLの柔軟な取得が有効
- **jwt_sessions**: API/JWT特化でSPA + GraphQL構成に最もフィット。Access + Refreshトークン管理が標準搭載
- **PostgreSQL**: pg_trgm + tsvectorで日本語全文検索が標準対応。MySQLでは別途Elasticsearch等が必要になる可能性
- **Apollo Client**: SNSでの正規化キャッシュが威力を発揮（いいね数変更が全画面に即反映）。Subscription標準対応
- **Zustand**: MVPではContextで足りるが、通知・DM等の拡張時にProvider増殖を回避。~2KBで実質コストなし
- **HeroUI v2**: デフォルトが美しく75+コンポーネントで最も豊富。SNS開発への集中を優先し実装速度を重視
- **Tailwind CSS v4**: ゼロランタイムでReact 19との相性最良。HeroUIとの統合、running-course-appとの構成統一
- **React Hook Form + Zod**: 宣言的バリデーション、非同期検証（ユーザー名重複等）が簡潔。uncontrolledで再レンダリング最小限
- **ローカル環境**: DB/Redisだけコンテナ化。Rails・Viteはローカル直接実行。個人MVPではホットリロード速度とデバッグの手軽さを優先
- **型安全性**: Sorbet/RBS は導入しない。GraphQL層の型保証 + ActiveRecordバリデーション + RSpecテストの3層で安全性を担保

> 各技術の詳細な比較・トレードオフ・選定プロセスについては [tech-stack-decisions.md](./tech-stack-decisions.md) を参照。
