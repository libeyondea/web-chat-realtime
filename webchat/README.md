# WebChat Realtime (Next.js 15 + Firebase)

## Cài đặt

1. Cài dependencies

```bash
npm install
```

2. Tạo file `.env.local` dựa trên `.env.local.example` và điền thông tin Firebase

3. Chạy dev

```bash
npm run dev
```

Mở `http://localhost:3000`

## Công nghệ

- Next.js 15, TypeScript (strict)
- Tailwind CSS + DaisyUI + SCSS
- Firebase v10 (Auth, Firestore, Storage)
- React Query
- ESLint + Prettier

## Deploy Vercel

- Push repo lên GitHub
- Import vào Vercel
- Thiết lập Environment Variables theo `.env.local.example`
- Chọn Framework: Next.js, build command mặc định `npm run build`, output `.next`
