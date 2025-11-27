This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## GitHub Actions secrets

Configure the following repository secrets and variables under **Settings → Secrets and variables → Actions** to support automation and optional integrations:

- `OPENAI_API_KEY`: Required for scripts that call the OpenAI API.

Optional email settings (set these if enabling email features):

- `SMTP_SERVER` (e.g., `smtp.gmail.com`)
- `SMTP_PORT` (e.g., `587`)
- `SMTP_USERNAME`
- `SMTP_PASSWORD` (use an app password or similar)
- `EMAIL_FROM`
- `EMAIL_TO`

Optional Notion integration settings:

- `NOTION_WEBHOOK_URL` (or your proxy URL)
- `NOTION_API_TOKEN` (for direct Notion API usage)

You can populate just the variables you need today and leave placeholders for future growth.
