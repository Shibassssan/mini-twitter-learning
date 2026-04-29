# CLAUDE.md — mini-twitter

> 詳細な規約・禁止事項は [`AGENTS.md`](./AGENTS.md) を参照。
> 仕様書類は [`docs/`](./docs/) を参照（`requirements.md` / `data-model.md` / `api-spec.md` / `screen-spec.md` / `tech-stack.md`）。

---

## プロジェクト概要

Twitter ライクな SNS の**学習用フルスタック実装**。

| 層         | 技術                                         | ポート |
| ---------- | -------------------------------------------- | ------ |
| Backend    | Rails 8.1 + graphql-ruby 2.4                 | 3000   |
| Frontend   | React 19 + TanStack Router + Apollo Client 4 | 5173   |
| DB         | PostgreSQL 17（Docker）                      | 5432   |
| キャッシュ | Redis 7（Docker）                            | 6379   |

通信は **GraphQL のみ**（REST エンドポイントなし）。認証は JWT（Access Token: Authorization ヘッダ、Refresh Token: HttpOnly Cookie）。

---

## よく使うコマンド

```bash
# インフラ起動
docker compose up -d db redis

# Backend
cd backend
bundle exec rspec          # テスト
bundle exec rubocop        # Lint

# Frontend
cd frontend
pnpm dev                   # 開発サーバー
pnpm test                  # Vitest（run モード）
pnpm lint                  # Biome lint
pnpm format                # Biome format（書き込み）
pnpm codegen               # GraphQL 型生成（スキーマ変更後は必須）
```

---

## ディレクトリ構成（要点）

```
apps/mini-twitter/
├── backend/
│   ├── app/graphql/        # スキーマ・Mutation・Query・Subscription・Types
│   ├── app/models/         # バリデーション必須（DB 制約と二重化）
│   └── spec/requests/      # GraphQL 統合テスト（新規 Query/Mutation に必須）
└── frontend/src/
    ├── components/         # 再利用 UI（screen 固有ロジックなし）
    ├── routes/             # TanStack Router ページ
    ├── lib/
    │   ├── apollo/         # Apollo Client セットアップ
    │   ├── graphql/        # .graphql 定義ファイル
    │   │   └── generated/  # codegen 生成物 ← 手動編集禁止
    │   ├── hooks/          # カスタムフック（*.test.tsx 併設）
    │   ├── stores/         # Zustand（UI 状態のみ）
    │   ├── utils/          # ユーティリティ（*.test.ts 併設）
    │   └── validations/    # Zod スキーマ
    └── routeTree.gen.ts    # 自動生成 ← 手動編集禁止
```

---

## 作業前チェックリスト

- [ ] 関連する `docs/` の仕様書を読んだか
- [ ] GraphQL スキーマを変更する場合、`pnpm codegen` を実行する計画があるか
- [ ] 新規 Mutation / Query に対応する RSpec（`spec/requests/`）を書く計画があるか
- [ ] `frontend/src/lib/graphql/generated/` と `routeTree.gen.ts` を直接編集していないか

---

## 技術スタック別の主要規約

### Backend

- バリデーションは Model 層に実装（Zod / GraphQL 層だけに置かない）
- ツイート本文は最大 **300 文字**（フロントの Zod と同期）
- N+1 対策: `GraphQL::Dataloader` Sources（`app/graphql/sources/`）または `includes` を使う
- テスト: `spec/models/`（単体）+ `spec/requests/graphql/`（統合）

### Frontend

- TypeScript strict モード・`any` 禁止
- Linter/Formatter: **Biome**（ESLint / Prettier は使わない）
- GraphQL 操作は `.graphql` ファイルに定義 → `pnpm codegen` → 型付きで使う
- いいね・フォロー等トグル系は `optimisticResponse` 必須
- サーバ状態は **Apollo Cache**、UI 状態のみ Zustand
- フォーム: React Hook Form + Zod
- UI コンポーネント: **HeroUI v3**（`@heroui/react`）+ Tailwind CSS v4
- テスト: Vitest + Testing Library、コンポーネント隣接の `*.test.tsx`

---

## 絶対 NG

| NG                                              | 理由                              |
| ----------------------------------------------- | --------------------------------- |
| Refresh Token を localStorage に保存            | XSS で窃取される                  |
| `JWT_SECRET` / `SECRET_KEY_BASE` をコミット     | 機密情報漏洩                      |
| `generated/**` や `routeTree.gen.ts` を手動編集 | 次回生成で消える                  |
| サーバ状態を Zustand に置く                     | Apollo Cache と二重管理・更新ズレ |
| 新規 GraphQL を追加してテストなし               | デグレ検出不能                    |
