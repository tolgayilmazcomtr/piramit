# Piramit Admin Panel

Piramit tabanlı görev dağıtım sistemi admin paneli. Next.js, SQLite, Prisma ve Telegram entegrasyonu içerir.

## Kurulum

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. Veritabanını hazırlayın ve seed verilerini yükleyin:
   ```bash
   npx prisma migrate dev --name init
   ```
   *Bu komut otomatik olarak `prisma/seed.ts` dosyasını çalıştıracak ve başlangıç verilerini (Admin kullanıcısı, Etiketler vb.) ekleyecektir.*

3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

## Telegram Bot Kurulumu

1. BotFather'dan yeni bir bot oluşturun ve token alın.
2. `.env` dosyasındaki `TELEGRAM_BOT_TOKEN` değerini güncelleyin.
3. Webhook URL'ini ayarlamak için (public URL gerektirir, örn: ngrok kullanarak):
   ```bash
   curl -F "url=https://your-domain.com/api/telegram/webhook" https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook
   ```

## Giriş Bilgileri

**Admin:**
- Email: `admin@admin.com`
- Şifre: `admin123`

## Teknoloji Stack
- Next.js 14 App Router
- SQLite / Prisma ORM
- NextAuth.js (v5)
- Telegram Bot API
- Tailwind CSS / shadcn/ui
