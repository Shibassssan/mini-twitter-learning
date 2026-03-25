# mini-twitter 技術スタック選定メモ

## 確定事項

### バックエンド言語: Ruby（Rails）

| 項目 | 内容 |
|------|------|
| **確定した選択** | Ruby on Rails |
| **他の候補** | TypeScript（Hono + Pothos + Prisma） |
| **選定理由** | ユーザーはTSに慣れているが、目的は「GraphQL + SNS設計の経験を積む」こと。ツール学習より本質に集中するため、業務で少し慣れているRailsを選択。 |
| **トレードオフ** | TS構成は型安全性（DB → GraphQL → フロント三重チェック）で優位だったが、Pothos/Prisma/Yoga/Honoの各ツール学習コストがSNS設計の学びを遅らせるリスクがあった。 |

---

### Rails バージョン: 8.0

| 項目 | 内容 |
|------|------|
| **確定した選択** | Rails 8.0 |
| **他の候補** | Rails 7.2 |
| **選定理由** | 7.2の機能は8.0で後方互換あり。7.2の書き方がそのまま動く。Solid Cable等の新機能も使いたければ使える。サポート期間も長い。 |
| **トレードオフ** | 7.2の方が情報量は多いが、graphql-ruby含め主要gemが8.0対応済みで互換性リスクは低い。 |

---

### API方式: GraphQL

| 項目 | 内容 |
|------|------|
| **確定した選択** | GraphQL |
| **他の候補** | REST |
| **選定理由** | SNSはエンティティ間のリレーションが複雑（ユーザー → ツイート → いいね → フォロー）。画面ごとに必要なデータが異なるため、GraphQLの「必要なフィールドだけ取得」が活きる。Subscriptionでリアルタイムも仕様内で統一可能。Relay Connectionでカーソルページネーションが標準化。 |
| **トレードオフ** | RESTの方が実装シンプル、curlでデバッグしやすい。GraphQLはResolver設計やN+1対策（DataLoader）など追加概念がある。 |

---

### ORM: ActiveRecord

| 項目 | 内容 |
|------|------|
| **確定した選択** | ActiveRecord |
| **他の候補** | Sequel |
| **選定理由** | Rails標準。マイグレーション成熟、GraphQLとの連携実績豊富。あえてSequelを選ぶ理由がない。 |

---

### 認証: jwt_sessions

| 項目 | 内容 |
|------|------|
| **確定した選択** | jwt_sessions |
| **他の候補** | devise + devise-jwt / Rails 8 auth generator + jwt gem / rodauth / Sorcery |
| **選定理由** | API/JWT特化のライブラリでSPA + GraphQL構成に最もフィット。Access + Refreshトークン管理が標準搭載。deviseほど重くなく、Rails 8 authのように全て自前実装する必要もない。 |

**候補ごとのトレードオフ比較:**

| 候補 | メリット | デメリット |
|------|----------|------------|
| devise + devise-jwt | デファクトスタンダード、情報量圧倒的 | Cookie/Session前提の設計でAPI化に工夫が必要。多機能すぎて依存が重い（10+ gem） |
| **jwt_sessions** | API-first設計、リフレッシュトークン・無効化（Redis）が標準搭載 | ドキュメントは少ないがgem自体がシンプル |
| Rails 8 auth + jwt | 依存最小 | リフレッシュトークン・GraphQL対応は全て自前 |
| rodauth | 最高セキュリティ | 学習コスト高、チュートリアル少ない |
| Sorcery | 軽量 | コミュニティ小、GraphQL統合例なし |

---

### GraphQL関連: graphql-ruby + 組み込みDataloader + Relay Connection

| 項目 | 内容 |
|------|------|
| **N+1対策** | graphql-ruby 1.12+ の組み込みDataloader（fiber使用、追加gem不要） |
| **ページネーション** | Relay Connection（graphql-ruby標準搭載） |
| **シリアライザ** | 不要（GraphQLではリゾルバが直接フィールドを返す） |

---

### テスト: rspec + factory_bot

| 項目 | 内容 |
|------|------|
| **確定した選択** | rspec + factory_bot + shoulda-matchers |
| **他の候補** | minitest |
| **選定理由** | Rails + GraphQL のテスト事例はほぼrspecで書かれている。factory_botでテストデータ管理。 |
| **トレードオフ** | minitestの方が速いがエコシステムが小さい。 |

---

### 画像ストレージ: Active Storage（ローカル）

| 項目 | 内容 |
|------|------|
| **確定した選択** | Active Storage（ローカル保存） |
| **他の候補** | Active Storage（S3） / CarrierWave |
| **選定理由** | Rails標準、`rails active_storage:install`で完了。MVP段階ではローカル保存で十分。本番化時にconfig変更のみでS3に切り替え可能。 |
| **トレードオフ** | S3はMVPには過剰。CarrierWaveは設定が多くActive Storageに劣る。 |

---

### データベース: PostgreSQL 17

| 項目 | 内容 |
|------|------|
| **確定した選択** | PostgreSQL 17 |
| **他の候補** | PostgreSQL 16 / MySQL |
| **選定理由（vs MySQL）** | ツイート本文のキーワード検索にpg_trgm + tsvectorが標準搭載。MySQLは日本語部分一致が弱くElasticsearch等が必要になる可能性。SNS系で検索機能があるならPostgreSQLが明確に有利。 |
| **選定理由（vs 16）** | サポート期間が17の方が長い（2027-11まで）。機能差は小さい。 |
| **管理方法** | Docker公式イメージで管理。 |

---

### 開発環境: Docker（PostgreSQL + Redis のみコンテナ）

PostgreSQLとRedis（jwt_sessionsのトークン管理）をdocker-composeで管理。Rails・Viteはローカル直接実行（rbenv + Node.js）。詳細は「ローカル開発環境構成」セクションを参照。

---

## フロントエンド（確定済み）

- React 19 + TypeScript 5.9 + Vite 8 + Tailwind CSS v4 + TanStack Router
- running-course-appと同じ構成でmonorepo共有

---

### スタイリング: Tailwind CSS v4

| 項目 | 内容 |
|------|------|
| **確定した選択** | Tailwind CSS v4 |
| **他の候補** | CSS-in-JS（emotion, tss-react） / Panda CSS / vanilla-extract / CSS Modules |
| **選定理由** | ユーザーはCSS-in-JS（emotion等）に慣れているが、ランタイムCSS-in-JSのパフォーマンス問題を解消したかった。Tailwindはゼロランタイム（ビルド時生成）でReact 19との相性も最良。UIライブラリ（HeroUI）との統合、running-course-appとの統一、今後のキャリア価値を考慮。 |

**候補ごとのトレードオフ比較:**

| 候補 | メリット | デメリット |
|------|----------|------------|
| **Tailwind CSS** | ゼロランタイム、React 19最良相性、UIライブラリ豊富（shadcn/ui, HeroUI等）、業界主流 | 学習が必要だが1-2日で慣れる |
| Panda CSS | CSS-in-JS風の書き方でゼロランタイム。emotion経験者に最も移行しやすい | UIライブラリが少ない |
| vanilla-extract | 型安全CSS、ゼロランタイム | UIライブラリがほぼない |
| emotion/tss-react | 慣れているがランタイムCSS-in-JS | パフォーマンスが遅い、React 19 RSCと相性問題。2025年のエコシステムでは逆風 |
| CSS Modules | 普通のCSS記法、ビルド時生成 | UIライブラリとの統合が弱い |

---

### UIライブラリ: HeroUI v2

| 項目 | 内容 |
|------|------|
| **確定した選択** | HeroUI v2 |
| **他の候補** | shadcn/ui (109k⭐) / DaisyUI (40k⭐) / Headless UI (28k⭐) / Ark UI (4.9k⭐) / Radix UI (18k⭐) |
| **選定理由** | デフォルトが美しく学習コスト最低。75+コンポーネントで最も豊富。SNS開発に集中するため実装速度を優先。v2安定版を選択（v3はbeta）。 |

**候補ごとのトレードオフ比較:**

| | shadcn/ui | HeroUI | DaisyUI |
|---|---|---|---|
| Stars | 109k | 27k | 40k |
| コンポーネント数 | 40+ | 75+ | 40+ |
| 方式 | コピペ（自分のコード） | npmパッケージ | Tailwindプラグイン（CSS） |
| カスタマイズ性 | 最高 | 高い | 中 |
| デフォルトの見た目 | シンプル | 美しい | テーマ豊富 |
| 学習コスト | 中 | 低 | 最低 |
| 安定性 | 安定版 | v2安定/v3beta | 安定版 |

Headless UI・Radix UIはコンポーネント数が限定的（Toast, Avatar, Form等がない）でSNS系には自前実装が多く必要になるため除外。

---

### フォームライブラリ: React Hook Form + Zod

| 項目 | 内容 |
|------|------|
| **確定した選択** | React Hook Form + Zod |
| **他の候補** | TanStack Form / 自前（useState） |
| **選定理由** | DX最高。Zodでバリデーションスキーマを宣言的に定義。非同期検証（ユーザー名重複）が簡潔。uncontrolledで再レンダリング最小限。 |

---

### 日付表示: dayjs

| 項目 | 内容 |
|------|------|
| **確定した選択** | dayjs |
| **他の候補** | date-fns / Intl API |
| **選定理由** | 軽量（~2KB）、Moment.js互換API。 |

---

### codegen: graphql-codegen

GraphQLスキーマからTypeScript型を自動生成。Apollo Client + React用プラグイン対応。

---

### CORS: rack-cors（バックエンド）

---

### レート制限: rack-attack（バックエンド）

---

### 画像アップロードUI: React Hook Form + input type="file"

MVPはシンプルに。

---

### JSランタイム: Node.js

| 項目 | 内容 |
|------|------|
| **確定した選択** | Node.js |
| **他の候補** | Bun |
| **選定理由** | 全ツール（Vite, Apollo, codegen, pnpm）との互換性に問題なし。running-course-appと統一。Bunはgraphql-codegen等で互換性リスクがあり、SNS開発に集中したいのにツールトラブルシュートに時間を取られる可能性。 |

---

### GraphQLクライアント: Apollo Client

| 項目 | 内容 |
|------|------|
| **確定した選択** | Apollo Client |
| **他の候補** | urql / graphql-request |
| **選定理由** | SNSでの正規化キャッシュが威力を発揮（いいね数変更が全画面に即反映）。Subscription標準対応。DevToolsが優秀。graphql-codegen対応。エコシステム最大。 |

**候補ごとのトレードオフ比較:**

| 候補 | バンドルサイズ | キャッシュ | 主な特徴 | 学習コスト |
|------|--------------|----------|----------|-----------|
| **Apollo Client** | ~50KB | 正規化キャッシュ（強力） | 楽観的更新・無限スクロール・Subscription標準対応、DevTools優秀、情報最多 | 高（キャッシュ設計の理解必要） |
| urql | ~15KB | Documentキャッシュ（シンプル） | 楽観的更新・Subscription対応、正規化キャッシュは@urql/exchange-graphcacheで追加可能 | 低 |
| graphql-request | ~5KB | なし | Subscription非対応、要件に合わない | 最低 |

---

### クライアント状態管理: Zustand

| 項目 | 内容 |
|------|------|
| **確定した選択** | Zustand |
| **他の候補** | React Context / Apollo Reactive Variables |
| **選定理由** | 将来の拡張性を考慮。MVPではContextで足りるが、通知・DM・下書き等の拡張時にProvider増殖が課題になる。ZustandはSelectorで必要なコンポーネントだけ再レンダリング、SSE等の外部からの状態更新もどこからでも呼べる。追加コスト~2KBで実質ゼロ。 |

**React Context vs Zustand 詳細比較:**

| 判断軸 | React Context | Zustand |
|---|---|---|
| MVPで十分か | はい | はい |
| 再レンダリング | Context値変更で購読全コンポーネント再レンダリング | selectorで必要なコンポーネントだけ |
| Provider | 必要（AuthProvider > UIProvider > ... ネスト増殖） | 不要（グローバルstore） |
| コード量 | ~50行/store（Context + Provider + useReducer） | ~20行/store（create()） |
| テスト | Providerでラップが必要 | store直接テスト可能 |
| DevTools | React DevToolsのみ | Redux DevTools対応（状態変遷追跡） |
| 将来の拡張（通知、DM等） | 新Context + Provider追加 | storeにスライス追加するだけ |
| 下書き保存 | localStorage手動同期 | persist middlewareで自動永続化 |
| SSEからの状態更新 | dispatch配線が面倒 | useStore.getState().update()でどこからでも |
| 追加依存 | なし | ~2KB（実質コストなし） |

サーバー状態はApollo Clientが管理するため、Zustandは認証状態（user, token, isAuthenticated）とUI状態（モーダル開閉、タブ切替等）のみを管理する。

---

### ローカル開発環境構成: A（DB/Redisだけコンテナ）

| 項目 | 内容 |
|------|------|
| **確定した選択** | A: DB/Redisだけコンテナ（Rails・Viteはローカル直接実行） |
| **他の候補** | B: バックエンド全部コンテナ / C: 全部コンテナ |
| **選定理由** | 個人MVPではホットリロード速度とデバッグの手軽さを優先。チーム開発でないため環境統一の恩恵が薄い。 |

**候補ごとのトレードオフ比較:**

| 構成 | 内容 | メリット | デメリット |
|------|------|----------|------------|
| **A: DBだけコンテナ** | Rails・Viteはローカル、PG+Redisはdocker-compose | ホットリロード高速、デバッグ楽、Railsチュートリアル標準構成 | rbenv/nvm等のバージョン管理が必要、初回セットアップ手順が多い |
| B: バックエンド全部 | Rails+PG+Redisをコンテナ、Viteだけローカル | バックエンド環境統一 | volume mountで遅い、docker attach必要 |
| C: 全部コンテナ | 全サービスdocker-compose | `docker compose up`だけで完結 | 両方volume mountで遅い、Docker知識が多く必要 |

---

### 型安全性: 型なし（GraphQL + バリデーション + テストで担保）

| 項目 | 内容 |
|------|------|
| **確定した選択** | Sorbet/RBS導入なし |
| **他の候補** | Sorbet（Stripe製） / RBS + Steep（Ruby公式） |
| **選定理由** | Sorbet は ActiveRecord との相性が微妙（カラム認識に.rbi再生成が必要、whereチェーンの型追跡が不完全でT.unsafeだらけになる）。RBSはエコシステム未成熟。GraphQL層が入力型を保証し、ActiveRecordバリデーション + RSpecで実行時安全性を担保する3層アプローチで十分。 |

---

## まだ決めていないこと

- ~~データモデル詳細（テーブル定義、インデックス設計、リレーション）~~ → 確定済み。[data-model.md](./data-model.md) を参照
- ~~API仕様（GraphQLスキーマ設計）~~ → 確定済み。[api-spec.md](./api-spec.md) を参照
- 画面仕様（ワイヤーフレーム、コンポーネント分割、ルーティング）
- 実装計画（フェーズ分け、ディレクトリ構成、開発環境セットアップ）
