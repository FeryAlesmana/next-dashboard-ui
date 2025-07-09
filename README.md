# SMP ISLAMIYAH SCHOOL MANAGEMENT

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

Then, run Prisma:

```bash
npx prisma generate
#after that

npx prisma migrate reset
# or
npx prisma migrate dev --name migration_name
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
