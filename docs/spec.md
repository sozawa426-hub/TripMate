# TripMate 仕様書

## 1. プロジェクト概要

TripMate は、旅行の計画から実行、振り返りまでを一貫してサポートするモバイル/Web アプリケーションです。

### 目的

- 旅行計画の手間を大幅に削減し、ユーザーが楽しい部分に集中できるようにする
- AI を活用したパーソナライズされた提案により、より良い旅行体験を提供する
- 旅行の記録を簡単に残し、振り返りや次回の旅行の参考にできるようにする

### ターゲットユーザー

- 旅行好きの個人ユーザー（10〜50代）
- 旅行計画を立てるのが面倒だと感じる層
- 一人旅・友人旅行・家族旅行など、様々な旅行形態に対応

---

## 2. 技術スタック

| レイヤー | 技術 | 選定理由 |
|---|---|---|
| フロントエンド | **React Native + Expo** | 1 コードベースで iOS/Android/Web に展開。React 知見のある小規模チームに最適 |
| 言語 | **TypeScript** | 型安全性、保守性向上 |
| BaaS | **Supabase** | PostgreSQL ベースでリレーショナルデータに強い。リアルタイム機能、Storage、Edge Functions を網羅 |
| 認証 | **Supabase Auth** | メール/パスワード + OAuth（Google, Apple）を両方サポート |
| DB | **PostgreSQL (Supabase)** | 複雑なリレーションや集計クエリに強い |
| ストレージ | **Supabase Storage** | 画像ファイルの保存 |
| AI/レコメンド | **Supabase Edge Functions + 外部 LLM API** | 好み学習・旅行先提案のバックエンド処理 |
| i18n | **react-i18next** | React Native で一般的な多言語対応ソリューション |
| ステート管理 | **Zustand** | 軽量で扱いやすい状態管理。小規模チームに最適 |
| UI ライブラリ | **React Native Paper または NativeBase** | マテリアルデザイン準拠のクロスプラットフォーム UI |

---

## 3. 機能一覧

### 3.1 認証・ユーザー管理

| 項目 | 詳細 |
|---|---|
| 新規登録 | メール/パスワード、Google、Apple の 3 方法 |
| ログイン | 上記 3 方法 + メールリンク認証 |
| プロフィール | アイコン、表示名、言語設定、旅行偏好設定 |
| 退会 | アカウント削除機能（データも削除） |

### 3.2 ホーム画面

ログイン後のトップ画面。以下のセクションを含む：

- **ヘッダー**: ユーザーアイコン、通知（将来拡張用）
- **おすすめ旅行先**: AI が提案する旅行先カード（スワイプ可能）
- **直近の旅程**: 次回の旅行カード（出発日カウントダウン付き）
- **旅の記録（最新）**: 最近投稿した記録を数件表示（無限スクロールは専用画面で対応）

### 3.3 旅程自動生成

#### 入力情報

| 項目 | 必須 | 説明 |
|---|---|---|
| 旅行先 | ○ | 都道府県名・都市名・国名 |
| 日数 | ○ | 旅行の日数（泊数） |
| 好み | ○ | ジャンル選択（グルメ、観光、アクティビティ、リラックス、ショッピング 等） |
| 移動手段 | × | 車、電車、飛行機、徒歩 等（未指定なら最適な提案） |
| 予算感 | × | バジェットレンジ（ Narrow / Standard / Flexible） |
| 同行者 | × | 一人旅、カップル、家族、友人 等 |

#### 出力

- 日別の推奨スケジュール（時間割形式）
- 各スポットの説明・地図リンク・所要時間
- 交通手段の推奨と所要時間概算
- スケジュールの drag & drop による手動調整機能
- 生成結果の保存・編集機能

### 3.4 持ち物チェックリスト自動生成

#### 入力情報

| 項目 | 必須 | 説明 |
|---|---|---|
| 旅行先 | ○ | 出発地と目的地 |
| 旅行期間 | ○ | 日数 |
| 旅行のジャンル | ○ | アウトドア、都市観光、ビーチ、温泉 等 |
| 季節・天気 | × | 指定がない場合は自動取得 |

#### 出力

- カテゴリ別持ち物リスト（衣類、日用品、電子機器、医薬品、書類 等）
- 各アイテムのチェックボックス（ON/OFF）
- 前回の旅行のリストを引き継ぐ機能
- カスタムアイテムの追加・削除
- テンプレートとして保存機能

### 3.5 予算シミュレーション

日別予算管理をベースとした予算シミュレーション機能。

#### 機能詳細

| 機能 | 説明 |
|---|---|
| 旅行全体予算の設定 | 総予算額の入力 |
| 日別予算の自動配分 | 日数に基づき均等配分（手動調整可能） |
| カテゴリ別内訳 | 交通費、宿泊費、食費、観光・アクティビティ、買い物、その他 |
| 実績入力 | 実際にかかった費用を日別・カテゴリ別に記録 |
| 予算 vs 実績の可視化 | グラフで予算消化率を表示 |
| 残予算のリアルタイム表示 | 今あといくら使えるかを常に表示 |
| 通貨切替 | 現地通貨 / 自国通貨の切り替え表示 |

### 3.6 旅の記録投稿機能

旅行の思い出を投稿・管理する機能。

#### 投稿内容

| 項目 | 必須 | 説明 |
|---|---|---|
| アイコン | ○ | ユーザーのプロフィールアイコン（自動設定） |
| タイトル | ○ | 記録のタイトル（例: 「京都の3日間」） |
| 本文 | ○ | 旅の詳細な記述（マークダウン対応） |
| 日付 | ○ | 旅行日（日付範囲で入力） |
| 画像 | × | 最大 10 枚まで（複数選択可） |
| 公開範囲 | ○ | 公開 / 非公開 を選択 |
| 場所タグ | × | 訪れた場所のタグ |

#### 一覧表示

- 無限スクロール対応（バーチャライズドリスト）
- 公開記録は全ユーザーが閲覧可能
- フィルター: 自分の記録 / 公開記録 / 特定の場所
- ソート: 新しい順 / 古い順
- 検索: タイトル・本文・タグで全文検索

#### 専用画面 vs ホーム画面内包

- ホーム画面に最新の記録を数件表示
- 専用の「旅の記録」画面で全件表示（無限スクロール）
- 両方の画面から個別記録の詳細画面に遷移可能

### 3.7 AI 旅行先提案（好み学習）

ユーザーの旅行履歴や喜好を学習し、次回の旅行先を提案する機能。

#### 学習データ

- 過去の旅行履歴（場所、日数、ジャンル）
- 記録投稿の内容・タグ
- 旅程生成時の好み設定
- お気に入り登録したスポット
- 予算の傾向

#### 提案ロジック（段階的実装）

**Phase 1: ルールベース**
- 過去の旅行ジャンルの集計 → 同ジャンルの未訪問地を提案
- 季節 × 地域の組み合わせで提案
- 予算レンジに合った旅行先をフィルタリング

**Phase 2: LLM 活用（将来拡張）**
- Supabase Edge Functions から外部 LLM API（OpenAI 等）を呼び出し
- ユーザーのプロフィール + 履歴をプロンプトに含め、パーソナライズされた提案を生成
- 対話形式での旅行相談機能

---

## 4. 画面構成

```
App
├── 認証フロー
│   ├── ログイン画面
│   ├── 新規登録画面
│   └── パスワードリセット画面
│
├── メインフロー
│   ├── ホーム画面
│   │   ├── AI おすすめ旅行先
│   │   ├── 直近の旅程
│   │   └── 最新の旅の記録
│   │
│   ├── 旅程画面
│   │   ├── 旅程一覧
│   │   ├── 旅程自動生成（入力フォーム）
│   │   └── 旅程詳細（日別スケジュール）
│   │
│   ├── 持ち物チェックリスト画面
│   │   ├── チェックリスト一覧
│   │   ├── 自動生成（入力フォーム）
│   │   └── チェックリスト詳細
│   │
│   ├── 予算シミュレーション画面
│   │   ├── 旅行選択
│   │   ├── 日別予算設定
│   │   ├── 実績入力
│   │   └── グラフ表示
│   │
│   ├── 旅の記録画面
│   │   ├── 記録一覧（無限スクロール）
│   │   ├── 記録投稿/編集
│   │   └── 記録詳細
│   │
│   └── プロフィール画面
│       ├── ユーザー情報編集
│       ├── 言語設定
│       └── 旅行偏好設定
```

---

## 5. データモデル

### users

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK | ユーザー ID（Supabase Auth と連携） |
| display_name | TEXT | NOT NULL | 表示名 |
| avatar_url | TEXT | | プロフィール画像 URL |
| preferred_language | TEXT | DEFAULT 'ja' | 言語設定 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |

### trips（旅行）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | 旅行 ID |
| user_id | UUID | FK → users.id, NOT NULL | ユーザー ID |
| title | TEXT | NOT NULL | 旅行タイトル |
| destination | TEXT | NOT NULL | 旅行先 |
| start_date | DATE | NOT NULL | 開始日 |
| end_date | DATE | NOT NULL | 終了日 |
| budget_total | INTEGER | | 総予算（円） |
| status | TEXT | DEFAULT 'planned' | planned / ongoing / completed |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

### itineraries（旅程）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK | 旅程 ID |
| trip_id | UUID | FK → trips.id, NOT NULL | 旅行 ID |
| day_number | INTEGER | NOT NULL | 何日目か |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

### itinerary_items（旅程アイテム）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK | アイテム ID |
| itinerary_id | UUID | FK → itineraries.id, NOT NULL | 旅程 ID |
| time_start | TIME | | 開始時間 |
| time_end | TIME | | 終了時間 |
| title | TEXT | NOT NULL | タイトル |
| description | TEXT | | 説明 |
| location_name | TEXT | | 場所名 |
| location_lat | DOUBLE PRECISION | | 緯度 |
| location_lng | DOUBLE PRECISION | | 経度 |
| transport_method | TEXT | | 移動手段 |
| sort_order | INTEGER | DEFAULT 0 | 表示順 |

### checklists（持ち物チェックリスト）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK | チェックリスト ID |
| trip_id | UUID | FK → trips.id, NOT NULL | 旅行 ID |
| name | TEXT | NOT NULL | リスト名 |
| is_template | BOOLEAN | DEFAULT false | テンプレートとして保存するか |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

### checklist_items（チェックリストアイテム）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK | アイテム ID |
| checklist_id | UUID | FK → checklists.id, NOT NULL | チェックリスト ID |
| category | TEXT | NOT NULL | カテゴリ（衣類、日用品 等） |
| name | TEXT | NOT NULL | アイテム名 |
| is_checked | BOOLEAN | DEFAULT false | チェック済みか |
| sort_order | INTEGER | DEFAULT 0 | 表示順 |

### budget_entries（予算エントリ）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK | エントリ ID |
| trip_id | UUID | FK → trips.id, NOT NULL | 旅行 ID |
| day_number | INTEGER | NOT NULL | 何日目か |
| category | TEXT | NOT NULL | カテゴリ（交通費、宿泊費 等） |
| amount | INTEGER | NOT NULL | 金額 |
| currency | TEXT | DEFAULT 'JPY' | 通貨 |
| memo | TEXT | | メモ |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

### budget_daily_limits（日別予算上限）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK | |
| trip_id | UUID | FK → trips.id, NOT NULL | 旅行 ID |
| day_number | INTEGER | NOT NULL | 何日目か |
| limit_amount | INTEGER | NOT NULL | 予算上限額 |
| UNIQUE(trip_id, day_number) | | | |

### records（旅の記録）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK | 記録 ID |
| user_id | UUID | FK → users.id, NOT NULL | ユーザー ID |
| trip_id | UUID | FK → trips.id | 紐づく旅行（任意） |
| title | TEXT | NOT NULL | タイトル |
| body | TEXT | NOT NULL | 本文（マークダウン） |
| date_from | DATE | NOT NULL | 旅行開始日 |
| date_to | DATE | NOT NULL | 旅行終了日 |
| visibility | TEXT | DEFAULT 'private' | public / private |
| location_tags | TEXT[] | | 場所タグ配列 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

### record_images（記録画像）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK | 画像 ID |
| record_id | UUID | FK → records.id, NOT NULL | 記録 ID |
| storage_path | TEXT | NOT NULL | Supabase Storage 上のパス |
| sort_order | INTEGER | DEFAULT 0 | 表示順 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

### user_preferences（ユーザー偏好データ）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, UNIQUE, NOT NULL | ユーザー ID |
| preferred_genres | TEXT[] | | 好みのジャンル配列 |
| preferred_seasons | TEXT[] | | 好みの季節 |
| preferred_budget_range | TEXT | | low / medium / high |
| visited_places | TEXT[] | | 訪問済み場所 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

## 6. ロール・アクセス制御

| 操作 | 未ログイン | ログイン済み |
|---|---|---|
| 認証（登録/ログイン） | ○ | × |
| ホーム画面閲覧 | × | ○ |
| 旅程の作成/編集/削除 | × | ○（自分のみ） |
| 持ち物チェックリスト | × | ○（自分のみ） |
| 予算シミュレーション | × | ○（自分のみ） |
| 旅の記録投稿 | × | ○ |
| 公開記録の閲覧 | ○ | ○ |
| 非公開記録の閲覧 | × | ○（自分のみ） |
| AI 旅行先提案 | × | ○ |

RLS（Row Level Security）ポリシー:
- 全テーブルで RLS を有効化
- users: 自分のレコードのみ参照・更新可
- trips, itineraries, checklists, budget_*: 自分の user_id に紐づくもののみ
- records: visibility = 'public' なら全員参照可、'private' なら自分のみ
- record_images: 紐づく record のアクセス権に準拠

---

## 7. 開発方針

### 7.1 開発フェーズ

| Phase | 内容 | 目安 |
|---|---|---|
| Phase 1 | 認証 + ホーム画面 + 旅の記録投稿 | 2〜3 週間 |
| Phase 2 | 旅程自動生成 + 持ち物チェックリスト | 2〜3 週間 |
| Phase 3 | 予算シミュレーション | 1〜2 週間 |
| Phase 4 | AI 旅行先提案（Phase 1: ルールベース） | 1〜2 週間 |
| Phase 5 | 多言語対応 + テスト + リファクタリング | 2 週間 |
| Phase 6 | AI 旅行先提案（Phase 2: LLM 活用） | 2〜3 週間 |

### 7.2 コーディング規約

- TypeScript strict mode を有効化
- ESLint + Prettier で統一
- コンポーネントは Functional Component + Hooks のみ
- ファイル構成: 機能ごとのモジュール構成（features/ 配下に各機能を配置）

### 7.3 ディレクトリ構成

```
src/
├── app/                    # Expo Router のルーティング
├── features/               # 機能モジュール
│   ├── auth/
│   ├── home/
│   ├── itinerary/
│   ├── checklist/
│   ├── budget/
│   ├── record/
│   └── recommendation/
├── shared/                 # 共通コンポーネント・ユーティリティ
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── types/
├── i18n/                   # 多言語対応
│   ├── ja.json
│   └── en.json
└── config/                 # 設定ファイル
```

### 7.4 テスト方針

- 単体テスト: Jest + React Native Testing Library
- 統合テスト: 各機能の主要フロー
- E2Eテスト: Phase 5 で Detox を導入検討

### 7.5 CI/CD

- GitHub Actions でリント + テストを自動実行
- Expo Application Services (EAS) でビルド配信

---

## 8. セキュリティ

- Supabase RLS でデータアクセス制御
- 認証情報の安全管理（Supabase Auth に委譜）
- 画像アップロード時のファイルサイズ制限（最大 10MB/枚）
- API キーは環境変数で管理（コードに埋めない）
- HTTPS 強制

---

## 9. 将来拡張候補

- オフライン対応（旅程・チェックリストのオフライン閲覧）
- プッシュ通知（旅行当日のリマインド）
- 共同旅程編集（グループ旅行で複数人で編集）
- 旅行記録の SNS 共有（Twitter/Instagram 共有ボタン）
- スポットの評価・レビュー機能
- 旅行先のリアルタイム天気表示
- AR 機能（観光スポットの情報表示）

---

## 10. 用語集

| 用語 | 定義 |
|---|---|
| 旅程 | 1 回の旅行の日別スケジュール |
| 持ち物チェックリスト | 旅行に持っていくアイテムのリスト |
| 予算シミュレーション | 旅行の予算計画と実績管理 |
| 旅の記録 | 旅行の思い出としての投稿 |
| 好み学習 | ユーザーの旅行傾向を分析し提案に活用すること |
