# Cloudflare Workersデプロイガイド

このガイドでは、MastraのCloudflareDeployerを使用してAPIサーバーをCloudflare Workersにデプロイする詳細な手順を説明します。

## 📋 前提条件

### 1. Cloudflareアカウントの準備

1. [Cloudflare](https://cloudflare.com/)でアカウントを作成
2. ダッシュボードにログイン

### 2. API認証情報の取得

#### Account IDとメールアドレスの確認

```bash
# Wrangler CLIで確認（推奨）
wrangler whoami
```

このコマンドでAccount IDとメールアドレスが表示されます。

#### Cloudflare API トークンの作成

1. [Cloudflareダッシュボード](https://dash.cloudflare.com/) → **My Profile** → **API Tokens**
2. **Create Token** をクリック
3. **"Edit Workers"** テンプレートを選択
4. **Continue to summary** → **Create Token**
5. 生成されたトークンをコピー（一度しか表示されません）

### 3. 環境変数の設定

プロジェクトルートに`.env.production`ファイルを作成し、以下の環境変数を設定してください：

```bash
# .env.production
NODE_ENV=production
OPENAI_API_KEY=your-openai-api-key
LIBSQL_URL=libsql://your-database-name.aws-region.turso.io
LIBSQL_AUTH_TOKEN=your_libsql_auth_token
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
CLOUDFLARE_EMAIL=your-cloudflare-email
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_PROJECT_NAME=your-project-name
```

## デプロイ手順

### ステップ1: プロジェクトの準備

```bash
# 依存関係のインストール
npm install

# プロジェクトのリント（問題がないか確認）
npx mastra lint
```

### ステップ2: ビルドとデプロイ

```bash
# Mastraプロジェクトのビルド（本番環境設定を使用）
npm run build:prod
```

このコマンドにより、以下が実行されます：

1. プロジェクトのビルド
2. `.mastra/output` ディレクトリの生成
3. `wrangler.json` 設定ファイルの自動生成
4. Cloudflare Workersへの自動デプロイ

### ステップ3: デプロイの確認

ビルドが成功すると、以下の出力構造が生成されます：

```
.mastra/output/
├── index.mjs          # メインワーカーのエントリーポイント
├── wrangler.json      # Cloudflare Workerの設定ファイル
├── node_modules/      # 依存関係
└── assets/            # 静的アセットおよび依存ファイル
```

## 🔧 設定詳細

### 自動生成されるwrangler.json

MastraのCloudflareDeployerは、以下の設定を含む`wrangler.json`を自動生成します：

```json
{
  "name": "your-project-name",
  "main": "./index.mjs",
  "compatibility_date": "2024-12-02",
  "compatibility_flags": [
    "nodejs_compat",
    "nodejs_compat_populate_process_env"
  ],
  "observability": {
    "logs": {
      "enabled": true
    }
  },
  "vars": {
    "OPENAI_API_KEY": "your-openai-api-key",
    "LIBSQL_URL": "libsql://your-database-name.aws-region.turso.io",
    "LIBSQL_AUTH_TOKEN": "your_libsql_auth_token"
  }
}
```

### 環境変数の処理

CloudflareDeployerは以下のソースから環境変数を自動的に処理します：

1. **環境ファイル**: `.env.production` ファイル
2. **システム環境変数**: `process.env` から取得
3. **設定パラメータ**: `env` オプションで指定された変数

## 🛠️ 手動デプロイ（オプション）

Wrangler CLIを使用して手動でデプロイすることも可能です：

### Wrangler CLIのインストール

```bash
# グローバルインストール
npm install -g wrangler

# インストール確認
wrangler --version

# Cloudflareアカウント情報の確認
wrangler whoami
```

### 手動デプロイ手順

```bash
# 出力ディレクトリに移動
cd .mastra/output

# Cloudflareアカウントにログイン
wrangler login

# プレビュー環境にデプロイ
wrangler deploy

# 本番環境にデプロイ
wrangler deploy --env production
```

### ローカルテスト

```bash
# 出力ディレクトリでローカルテスト
cd .mastra/output
wrangler dev
```

## 🔍 デプロイ後の確認

### APIエンドポイントのテスト

デプロイが成功したら、以下のエンドポイントをテストしてください：

```bash
# ヘルスチェック
curl https://your-worker-url.workers.dev/api/health

# チャットAPI
curl -X POST https://your-worker-url.workers.dev/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "こんにちは",
    "role": "アシスタント"
  }'
```

### ログの確認

Cloudflareダッシュボードの「Workers & Pages」→「your-project-name」→「Logs」でリアルタイムログを確認できます。

## 🚨 トラブルシューティング

### よくある問題と解決策

#### 1. 認証エラー

```
Error: Authentication error
```

**解決策**:
- `CLOUDFLARE_API_TOKEN` が正しく設定されているか確認
- APIトークンの権限が適切か確認

#### 2. Account IDエラー

```
Error: Invalid account ID
```

**解決策**:
- `wrangler whoami` でAccount IDを再確認
- `CLOUDFLARE_ACCOUNT_ID` が正しく設定されているか確認
- Cloudflareダッシュボードで正しいAccount IDを確認

#### 3. ビルドエラー

```
Error: Build failed
```

**解決策**:
```bash
# 出力ディレクトリを削除
rm -rf .mastra/output

# 依存関係を再インストール
npm install

# 再ビルド（本番環境設定を使用）
npm run build:prod
```

#### 4. 環境変数が反映されない

**解決策**:
- `.env.production` ファイルが正しい場所にあるか確認
- 環境変数名が正確か確認
- `npm run build:prod` を再実行

## 🔗 関連リンク

- [Mastra公式ドキュメント](https://mastra.ai/)
- [Cloudflare Workers公式ドキュメント](https://developers.cloudflare.com/workers/)
- [Wrangler CLI公式ドキュメント](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare API トークン管理](https://dash.cloudflare.com/profile/api-tokens)
- [Turso公式ドキュメント](https://docs.turso.tech/)