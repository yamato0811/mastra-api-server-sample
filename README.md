# Mastra API Server サンプル

このプロジェクトは、[Mastra](https://mastra.ai/)フレームワークを使用してAIエージェントAPIサーバーを構築するサンプル実装です。動的ロール設定機能を持つチャットエージェントとヘルスチェックAPIを提供します。

## 🚀 機能

- **動的AIエージェント**: ランタイムでロールを変更可能なAIエージェント
- **RESTful API**: チャットとヘルスチェック用のAPIエンドポイント
- **会話履歴管理**: LibSQL（Turso）データベースを使用した永続的な会話履歴
- **CORS対応**: クロスオリジンリクエストのサポート
- **Cloudflare Workers対応**: 自動ビルド・デプロイ機能

## 📋 前提条件

- Node.js >= 20.9.0
- npm または yarn

## 🛠️ セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

#### 開発環境用の設定

`.env.local`ファイルを作成して、以下の環境変数を設定してください：

```bash
# .env.local
NODE_ENV=development
OPENAI_API_KEY=your-openai-api-key
# LIBSQL_URL は設定しない（ローカルDBを使用）
# LIBSQL_AUTH_TOKEN は設定しない
```

#### LibSQL データベース設定

AIエージェントのメモリ機能にはLibSQL（Turso）データベースを使用します。

**ローカル開発時**:
- `LIBSQL_URL`と`LIBSQL_AUTH_TOKEN`を設定しない場合、自動的にローカルのSQLiteファイル（`file:../mastra.db`）が使用されます

**本番環境用の設定**:

`.env.production`ファイルを作成して、以下の環境変数を設定してください：

```bash
# .env.production
# 必須の環境変数
NODE_ENV=production
OPENAI_API_KEY=your-openai-api-key
LIBSQL_URL=libsql://your-database-name.aws-region.turso.io
LIBSQL_AUTH_TOKEN=your_libsql_auth_token
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
CLOUDFLARE_EMAIL=your-cloudflare-email
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_PROJECT_NAME=your-project-name
```

**注意**: 
- Tursoデータベースの作成方法については、[Turso公式ドキュメント](https://docs.turso.tech/)を参照してください

#### Cloudflare Workersへのデプロイ用（オプション）

Cloudflare Workersにデプロイする場合は、`.env.production`ファイルに以下の環境変数も追加してください：

```bash
# .env.production に追加
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
CLOUDFLARE_EMAIL=your-cloudflare-email
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_PROJECT_NAME=your-project-name
```

### 3. 開発サーバーの起動

```bash
# ローカル開発環境（.env.localを使用）
npm run dev
```

サーバーは `http://localhost:3000` で起動します。

## 📚 API エンドポイント

### チャットAPI

動的ロール設定機能を持つAIエージェントとの対話（会話履歴対応）

**エンドポイント**: `POST /api/agent/chat`

**基本的なリクエスト例**:
```json
{
  "message": "こんにちは！今日の天気はどうですか？",
  "role": "気象予報士"
}
```

**会話履歴を継続するリクエスト例**:
```json
{
  "message": "明日はどうでしょうか？",
  "role": "気象予報士",
  "threadId": "thread_1234567890_abc123def"
}
```

**レスポンス例**:
```json
{
  "response": "こんにちは！気象予報士として申し上げますと...",
  "threadId": "thread_1234567890_abc123def",
  "config": {
    "role": "気象予報士"
  }
}
```

**会話履歴の仕組み**:
- `threadId`を指定しない場合、新しい会話スレッドが自動生成されます
- 同じ`threadId`を使用することで、過去の会話履歴を考慮したレスポンスが得られます
- 会話履歴はLibSQL（Turso）データベースに永続化されます

### ヘルスチェックAPI

サーバーの稼働状況を確認

**エンドポイント**: `GET /api/health`

**レスポンス例**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "mastra-agent"
}
```

## 🏗️ プロジェクト構造

```
src/
├── mastra/
│   ├── index.ts          # Mastraサーバー設定とAPIルート定義
│   ├── agents/
│   │   └── my-agent.ts   # 動的AIエージェントの実装
│   └── tools/            # カスタムツール（将来の拡張用）
├── docs/
│   └── cloudflare-deploy.md  # Cloudflareデプロイガイド
├── .env.local            # ローカル開発用環境変数
├── .env.production       # 本番環境用環境変数
├── package.json          # プロジェクト設定と依存関係
├── tsconfig.json         # TypeScript設定
└── README.md             # このファイル
```

## 🔧 設定

### サーバー設定

`src/mastra/index.ts`でサーバー設定をカスタマイズできます：

- **ポート**: デフォルト3000
- **タイムアウト**: デフォルト10秒
- **CORS**: オリジン、メソッド、ヘッダーの設定

### エージェント設定

`src/mastra/agents/my-agent.ts`でエージェントの動作をカスタマイズできます：

- **モデル**: OpenAI GPT-4.1-mini
- **動的指示**: ランタイムコンテキストに基づく指示生成
- **メモリ機能**: LibSQL（Turso）データベースを使用した会話履歴の永続化

## 🧪 使用例

### cURLでのテスト

```bash
# 新しい会話を開始
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "プログラミングについて教えて",
    "role": "プログラミング講師"
  }'

# 会話を継続（threadIdを使用）
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "TypeScriptの特徴は？",
    "role": "プログラミング講師",
    "threadId": "thread_1234567890_abc123def"
  }'

# ヘルスチェック
curl http://localhost:3000/api/health
```

### JavaScriptでの使用例

```javascript
// 新しい会話を開始
const response1 = await fetch('http://localhost:3000/api/agent/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'TypeScriptの基本を教えて',
    role: 'TypeScript専門家'
  })
});

const data1 = await response1.json();
console.log(data1.response);
console.log('Thread ID:', data1.threadId);

// 同じスレッドで会話を継続
const response2 = await fetch('http://localhost:3000/api/agent/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'インターフェースについて詳しく教えて',
    role: 'TypeScript専門家',
    threadId: data1.threadId // 前回のthreadIdを使用
  })
});

const data2 = await response2.json();
console.log(data2.response);
```

## 🔄 開発ワークフロー

### 開発モード

```bash
# ローカル開発環境（.env.localを使用）
npm run dev

# 本番環境設定でのテスト（.env.productionを使用）
npm run dev:prod
```

ファイル変更時に自動的にサーバーが再起動されます。

### ビルド

```bash
# 通常のビルド
npm run build

# 本番環境設定でのビルド
npm run build:prod
```

### リント

```bash
npx mastra lint
```

## 📦 主要な依存関係

- **@mastra/core**: Mastraフレームワークのコア機能
- **@ai-sdk/openai**: OpenAI APIとの統合
- **@mastra/memory**: AIエージェントのメモリ機能
- **@mastra/libsql**: LibSQL（Turso）データベースとの統合
- **dotenv-cli**: 環境別の設定ファイル管理

## 🚀 本番環境への展開

### Cloudflare Workersへのデプロイ

このプロジェクトは、MastraのCloudflareDeployerを使用してCloudflare Workersへの自動デプロイに対応しています。

#### 前提条件

1. [Cloudflareアカウント](https://cloudflare.com/)の作成
2. [Cloudflare API トークン](https://dash.cloudflare.com/profile/api-tokens)の取得
3. Cloudflare Account IDの確認

#### 環境変数の設定

```bash
# 必須の環境変数
export OPENAI_API_KEY="your-openai-api-key"
export CLOUDFLARE_API_TOKEN="your-cloudflare-api-token"
export CLOUDFLARE_EMAIL="your-cloudflare-email"
export CLOUDFLARE_ACCOUNT_ID="your-cloudflare-account-id"

# オプション（デフォルト値あり）
export CLOUDFLARE_PROJECT_NAME="your-project-name"  # デフォルト: mastra-api-server
```

#### デプロイ手順

1. **プロジェクトのリント**
   ```bash
   npx mastra lint
   ```

2. **ビルドとデプロイの実行**
   ```bash
   # 本番環境設定でビルド
   npm run build:prod
   ```

3. **デプロイの確認**
   ビルドが成功すると、`.mastra/output`ディレクトリに以下が生成されます：
   ```
   .mastra/output/
   ├── index.mjs          # メインワーカーのエントリーポイント
   ├── wrangler.json      # Cloudflare Workerの設定ファイル
   └── assets/            # 静的アセットおよび依存ファイル
   ```

4. **Wrangler CLIでのデプロイ（オプション）**
   ```bash
   cd .mastra/output
   wrangler deploy
   ```

#### 注意事項

- **会話履歴**: `threadId`を使用して会話履歴を管理します
- **永続化**: 会話履歴はLibSQL（Turso）データベースに永続化されます
- **データベース設定**: デプロイ前にLibSQL（Turso）データベースの作成と環境変数の設定が必要です

詳細な手順については、[Cloudflareデプロイガイド](./docs/cloudflare-deploy.md)を参照してください。


## 🔗 関連リンク

- [Mastra公式ドキュメント](https://mastra.ai/)
- [OpenAI API](https://openai.com/api/)
- [LangSmith](https://smith.langchain.com/)