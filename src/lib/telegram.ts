import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN || 'mock_token';

// Polling false because we use Webhook in Next.js
const bot = new TelegramBot(token, { polling: false });

export default bot;
