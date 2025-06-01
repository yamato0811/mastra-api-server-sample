# Mastra API Server サンプル

このプロジェクトは、[Mastra](https://mastra.ai/)フレームワークを使用してAIエージェントAPIサーバーを構築するサンプル実装です。動的ロール設定機能を持つチャットエージェントとヘルスチェックAPIを提供します。

## 🚀 機能

- **動的AIエージェント**: ランタイムでロールを変更可能なAIエージェント
- **RESTful API**: チャットとヘルスチェック用のAPIエンドポイント
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

#### 開発環境

OpenAI APIキーを設定してください：

```bash
export OPENAI_API_KEY="your-openai-api-key"
```

#### Cloudflare Workersへのデプロイ用（オプション）

Cloudflare Workersにデプロイする場合は、`.env`ファイルに以下の環境変数を設定してください。

```bash
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
CLOUDFLARE_EMAIL=your-cloudflare-email
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_PROJECT_NAME=your-project-name
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

サーバーは `http://localhost:3000` で起動します。

## 📚 API エンドポイント

### チャットAPI

動的ロール設定機能を持つAIエージェントとの対話

**エンドポイント**: `POST /api/agent/chat`

**リクエスト例**:
```json
{
  "message": "こんにちは！今日の天気はどうですか？",
  "role": "気象予報士"
}
```

**レスポンス例**:
```json
{
  "response": "こんにちは！気象予報士として申し上げますと...",
  "config": {
    "role": "気象予報士"
  }
}
```

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
├── package.json          # プロジェクト設定と依存関係
├── tsconfig.json         # TypeScript設定
└── env.example           # 環境変数のサンプル
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

## 🧪 使用例

### cURLでのテスト

```bash
# チャットAPI
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "プログラミングについて教えて",
    "role": "プログラミング講師"
  }'

# ヘルスチェック
curl http://localhost:3000/api/health
```

### JavaScriptでの使用例

```javascript
// チャットAPIの呼び出し
const response = await fetch('http://localhost:3000/api/agent/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'TypeScriptの基本を教えて',
    role: 'TypeScript専門家'
  })
});

const data = await response.json();
console.log(data.response);
```

## 🔄 開発ワークフロー

### 開発モード

```bash
npm run dev
# または
npx mastra dev
```

ファイル変更時に自動的にサーバーが再起動されます。

### リント

```bash
npx mastra lint
```

### ビルド

```bash
npx mastra build
```

## 📦 主要な依存関係

- **@mastra/core**: Mastraフレームワークのコア機能
- **@ai-sdk/openai**: OpenAI APIとの統合

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
   npx mastra build
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

- **ステートレス**: エージェントは各リクエストを独立して処理します
- **会話履歴**: 現在の実装では会話履歴は保持されません
- **永続化**: 必要に応じてCloudflare D1やKVストレージとの統合を検討してください

詳細な手順については、[Cloudflareデプロイガイド](./docs/cloudflare-deploy.md)を参照してください。

### その他の環境

1. 環境変数の設定
2. ビルドの実行: `npx mastra build`
3. 適切なNode.jsランタイムでの起動

## 🤝 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはISCライセンスの下で公開されています。

## 🔗 関連リンク

- [Mastra公式ドキュメント](https://mastra.ai/)
- [OpenAI API](https://openai.com/api/)
- [LangSmith](https://smith.langchain.com/)