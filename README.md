# ちびっこ新聞

難しいニュースを幼稚園児向けにAIが翻訳するニュースサイト。

**本番URL:** https://chibikko-shinbun.vercel.app

## 技術スタック

- **フロント/バックエンド:** Next.js (App Router)
- **DB:** NeonDB (PostgreSQL) + Prisma
- **AI翻訳:** Anthropic Claude
- **デプロイ:** Vercel
- **収益化:** Google AdSense

## ローカル開発環境のセットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/aitoolsweekly/chibikko-shinbun.git
cd chibikko-shinbun
```

### 2. 依存パッケージをインストール

```bash
npm install
```

### 3. 環境変数を設定

```bash
cp .env.example .env
```

`.env` を編集して以下を設定：

| 変数名 | 内容 |
|--------|------|
| `DATABASE_URL` | NeonDB の接続文字列（`?pgbouncer=true` 付き） |
| `ANTHROPIC_API_KEY` | Anthropic API キー |
| `CRON_SECRET` | Cron エンドポイント保護用の任意の文字列 |

### 4. DBマイグレーション

```bash
npx prisma migrate deploy
```

### 5. 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) で確認。

## 主要ファイル

| ファイル | 役割 |
|----------|------|
| `src/app/page.tsx` | トップページ（コルクボード、フィルター） |
| `src/app/articles/[id]/page.tsx` | 記事詳細 |
| `src/app/api/cron/route.ts` | Cron（毎日朝6時JST） |
| `src/lib/agent.ts` | RSS取得 → Claude翻訳 → DB保存 |
| `src/components/Blackboard.tsx` | SVG黒板ヘッダー |
| `prisma/schema.prisma` | DBスキーマ |

## 手動で記事を生成する

```bash
# Cronエンドポイントを直接叩く
curl -X GET http://localhost:3000/api/cron \
  -H "Authorization: Bearer your-cron-secret"
```

## デプロイ

```bash
npx vercel --prod --scope suzunosukenagata-stars-projects
```

## 号外設定API

```bash
curl -X PATCH https://chibikko-shinbun.vercel.app/api/admin/breaking \
  -H "Authorization: Bearer your-cron-secret" \
  -H "Content-Type: application/json" \
  -d '{"articleId": "xxx", "breaking": true}'
```
