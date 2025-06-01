# Mastra API Server サンプル

このプロジェクトは、[Mastra](https://mastra.ai/)フレームワークを使用してAIエージェントAPIサーバーを構築するサンプル実装です。動的ロール設定機能を持つチャットエージェントとヘルスチェックAPIを提供します。

## 🚀 機能

- **動的AIエージェント**: ランタイムでロールを変更可能なAIエージェント
- **RESTful API**: チャットとヘルスチェック用のAPIエンドポイント
- **メモリ機能**: LibSQLを使用した会話履歴の永続化
- **テレメトリ**: LangSmithとの統合による監視機能
- **CORS対応**: クロスオリジンリクエストのサポート

## 📋 前提条件

- Node.js >= 20.9.0
- npm または yarn

## 🛠️ セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

OpenAI APIキーを設定してください：

```bash
export OPENAI_API_KEY="your-openai-api-key"
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
├── package.json          # プロジェクト設定と依存関係
└── tsconfig.json         # TypeScript設定
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
- **メモリ**: LibSQLストレージ
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
```

ファイル変更時に自動的にサーバーが再起動されます。

### ビルド

```bash
npm run build
```

## 📦 主要な依存関係

- **@mastra/core**: Mastraフレームワークのコア機能
- **@mastra/memory**: 会話履歴の永続化
- **@mastra/libsql**: SQLiteベースのストレージ
- **@ai-sdk/openai**: OpenAI APIとの統合
- **langsmith**: テレメトリとモニタリング

## 🚀 本番環境への展開

1. 環境変数の設定
2. ビルドの実行: `npm run build`
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

## ❓ トラブルシューティング

### よくある問題

1. **OpenAI APIキーエラー**: 環境変数 `OPENAI_API_KEY` が正しく設定されているか確認
2. **ポート競合**: 他のアプリケーションがポート3000を使用していないか確認
3. **依存関係エラー**: `npm install` を再実行して依存関係を更新

### ログの確認

開発モードでは詳細なログが出力されます。エラーが発生した場合は、コンソール出力を確認してください。 