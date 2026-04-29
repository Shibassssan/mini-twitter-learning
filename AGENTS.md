# AGENTS.md — mini-twitter

このファイルは AI コーディングエージェント（Cursor / Claude Code / Codex など）と人間の開発者の双方が参照する、本プロジェクトの作業規約です。
ユーザー向けの紹介・セットアップ手順は [`README.md`](./README.md) を参照してください。本ファイルは **「どう書くか」「何をしてはいけないか」** に焦点を当てます。

---

## 1. プロジェクト概要（要約）

- Twitter ライクな SNS の **学習用フルスタック実装**。
- 構成: Rails 8.1 (GraphQL API) + React 19 (SPA) の **完全分離**。通信は GraphQL のみ。
- リアルタイム機能: GraphQL Subscription（Action Cable transport）。
- 認証: JWT（Access Token + Refresh Token）。Refresh Token は **HttpOnly Cookie**。
- 詳細仕様は [`docs/`](./docs/) を **必ず参照**（`requirements.md` / `data-model.md` / `api-spec.md` / `screen-spec.md` など）。

---

## 2. ディレクトリ構成と責務境界

```
apps/mini-twitter/
├── backend/    # Rails 8.1 API（責務: GraphQL スキーマ・DB・認証・WebSocket）
├── frontend/   # React 19 SPA（責務: UI・状態管理・GraphQL クライアント）
├── docs/       # 設計ドキュメント（仕様変更時は必ず更新）
└── docker-compose.yml  # PostgreSQL 17 / Redis 7
```

**境界ルール:**

- フロントエンドはバックエンドのコードを直接 import しない。通信は **GraphQL のみ**。
- バックエンドはフロントの存在を仮定したコードを書かない（CORS・Cookie 設定を除く）。
- 仕様変更は先に `docs/` を更新し、その後コードを変更する（ドキュメントファースト）。

---

## 3. 開発コマンド早見表

### 初回セットアップ

```bash
# DB / Redis のみコンテナで起動
docker compose up -d db redis

# Backend
cd backend && bundle install && bin/rails db:create db:migrate db:seed

# Frontend
cd frontend && pnpm install && pnpm codegen
```

### 日常コマンド

| 目的 | バックエンド (`backend/`) | フロントエンド (`frontend/`) |
|---|---|---|
| 開発サーバー起動 | `bin/rails server` (3000) | `pnpm dev` (5173) |
| テスト実行 | `bundle exec rspec` | `pnpm test` |
| Lint | `bundle exec rubocop`（導入時） | `pnpm lint` |
| Format | — | `pnpm format` |
| 型/コード生成 | — | `pnpm codegen` |
| マイグレーション | `bin/rails db:migrate` | — |

> **エージェントへの指示:** 変更後は対応する **テスト・Lint・型チェック** を必ず走らせ、結果を報告すること。失敗を放置して完了扱いにしない。

---

## 4. バックエンド規約（Rails / GraphQL）

### 4.1 GraphQL

- スキーマは `app/graphql/` 配下に集約。**Query / Mutation / Subscription / Types** を分離。
- フィールドは **camelCase**（graphql-ruby のデフォルト）。Ruby コードは snake_case で書き、自動変換に任せる。
- 認可は **Resolver / Mutation 単位** で実装し、Model 層には書かない（責務の混在防止）。
- N+1 を避けるため、関連を引く際は必ず `GraphQL::Dataloader` Sources（`app/graphql/sources/` 配下の `RecordLoader` / `AssociationExistsLoader` など）または `includes` を検討。
- スキーマ変更時は **必ず** フロント側の `pnpm codegen` を再実行し、生成ファイルの差分も同じ PR に含める。

### 4.2 認証

- Access Token は **Authorization ヘッダ**、Refresh Token は **HttpOnly Cookie** で保持する。
- Refresh Token を localStorage / sessionStorage に置く実装は **絶対に書かない**（XSS リスク）。
- レート制限は `rack-attack`（認証 5 req/min、投稿 30 req/min）。設定変更時は `config/initializers/rack_attack.rb` を更新し、テストも追加。

### 4.3 モデル

- バリデーションは **Model に必ず実装**（DB 制約と二重化）。GraphQL 層のバリデーションだけに依存しない。
- ツイート本文は **最大 300 文字**。
- 削除可能性などのビジネスルールは **Policy オブジェクト** または `can_*?` メソッドとしてモデルに切り出す。

### 4.4 テスト（RSpec）

- 配置:
  - `spec/models/` — Model 単体テスト
  - `spec/requests/graphql/` — GraphQL Query/Mutation/Subscription の統合テスト
- **新規 Mutation / Query を追加した場合は、対応する request spec を必ず追加**。
- FactoryBot のファクトリは `spec/factories/` に集約し、重複定義を避ける。
- カバレッジ目標 **80%**。下回る変更を入れる場合はその理由を PR に明記。

---

## 5. フロントエンド規約（React / TypeScript）

### 5.1 言語・スタイル

- TypeScript は **strict モード前提**。`any` 禁止（やむを得ない場合は `// biome-ignore` で理由を明記）。
- フォーマッタ・Linter は **Biome**。インデント 2 スペース、シングルクォート、セミコロン必要時のみ、行幅 100。
- `pnpm lint` / `pnpm format` を **コミット前に必ず実行**。

### 5.2 ディレクトリ責務

```
frontend/src/
├── components/              # 再利用可能な UI（screen 固有のロジックは持たない）
├── routes/                  # TanStack Router のページコンポーネント
├── lib/
│   ├── apollo/              # Apollo Client セットアップ
│   ├── graphql/generated/   # graphql-codegen 生成物（手動編集禁止）
│   └── ...                  # フック・ユーティリティ
└── routeTree.gen.ts         # 自動生成ファイル（手動編集禁止）
```

- `lib/graphql/generated/` と `routeTree.gen.ts` は **絶対に手動編集しない**。Biome の Lint も無効化済み。
- ルーティング追加時は TanStack Router の規約に従い、`routes/` に追加 → 自動生成を待つ。

### 5.3 GraphQL クライアント（Apollo）

- クエリ・ミューテーションは **`.graphql` ファイル** に定義し、`pnpm codegen` で型を生成して使う。インラインの `gql` テンプレートは原則使わない。
- いいね・フォローなどのトグル系は **`optimisticResponse`** を必ず実装してレスポンス前に UI を更新する。
- 一覧の追加取得は **カーソルベースのページネーション**（`fetchMore` + `cache.modify` または `keyArgs`）。

### 5.4 状態管理

- サーバ状態は **Apollo Cache** に集約。Zustand に重複させない。
- Zustand は **クライアント固有の UI 状態**（モーダル開閉、認証ステータスのヒントなど）に限定。

### 5.5 フォーム

- React Hook Form + Zod。**バリデーションは Zod スキーマに一元化** し、サーバ側のルール（300 文字など）と整合させる。

### 5.6 UI / アクセシビリティ

- HeroUI v3 + Tailwind CSS v4。プリミティブな `button` / `input` を直書きせず、HeroUI コンポーネントを優先。
- キーボード操作・aria 属性は HeroUI の標準実装に乗る。独自実装する場合は WAI-ARIA Authoring Practices に準拠。

### 5.7 テスト（Vitest + Testing Library）

- 配置: コンポーネントと **隣接** して `*.test.tsx`。
- ユーザー操作は `@testing-library/user-event` を使う（`fireEvent` は最終手段）。
- Apollo はモックリンク or `MockedProvider` でモック。本番エンドポイントを叩かない。

---

## 6. Git / PR ワークフロー

- **コミットメッセージ:** Conventional Commits を推奨（`feat:` / `fix:` / `refactor:` / `test:` / `docs:` / `chore:`）。日本語可。
- **1 コミット 1 関心事**。バックエンドとフロントの大きな変更は分割。
- PR には以下を含める:
  - 変更概要（Why / What）
  - 仕様への影響（`docs/` の該当箇所）
  - 動作確認手順
  - スクリーンショット（UI 変更時）
- **生成ファイル**（`graphql/generated/**`, `routeTree.gen.ts`）は同一 PR に含める。差分が出たら `pnpm codegen` を実行する。

---

## 7. 禁止事項・注意点

| カテゴリ | やってはいけないこと | 理由 |
|---|---|---|
| 認証 | Refresh Token を localStorage に保存 | XSS で窃取される |
| 認証 | JWT_SECRET / SECRET_KEY_BASE をコミット | 機密情報漏洩 |
| GraphQL | スキーマ変更後に codegen を実行しない | フロントで型不整合 |
| 生成ファイル | `generated/**` や `routeTree.gen.ts` を手動編集 | 次回生成で消える |
| Model | バリデーションを GraphQL 層だけに置く | DB 整合性が崩れる |
| 状態管理 | サーバ状態を Zustand に置く | キャッシュ二重化・更新ズレ |
| 仕様変更 | `docs/` を更新せずに大きく変更 | 仕様と実装の乖離 |
| テスト | 新規 GraphQL を追加して spec なし | デグレ検出不能 |

---

## 8. シークレット・環境変数

- `.env` は **コミット禁止**（`.gitignore` 済み）。雛形は `backend/.env.example`。
- 必要な変数: `DATABASE_URL`, `REDIS_URL`, `SECRET_KEY_BASE`, `JWT_SECRET`。
- 本番想定の値や API キーをコード中にハードコードしない。

---

## 9. AI エージェントへの追加指示

1. **タスク開始前に必ず `docs/` の関連ファイルを読む**（特に新機能・仕様変更時）。
2. **複雑なタスクは小さな単位に分解**して並列で処理してよい（読み取り・調査系のみ）。書き込みは責務境界を尊重して直列で。
3. **応答は日本語**。コードコメントは英語可だが、PR 説明・コミットメッセージは日本語推奨。
4. **不明点があれば推測せず質問**する。特にビジネスルール・UI の挙動・命名は仕様書を優先。
5. 変更後の **テスト・Lint・型チェックの実行結果** を必ず報告する。

---

## 10. 参考リンク

- 設計ドキュメント: [`docs/`](./docs/)
- README（外向け）: [`README.md`](./README.md)
- AGENTS.md 仕様: <https://agents.md/>
