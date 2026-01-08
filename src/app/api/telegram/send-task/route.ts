import { NextRequest } from "next/server";
import bot from "@/lib/telegram";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { chatId, message, taskId, userId } = body;

        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "✅ Kabul Et", callback_data: `accept_${taskId}_${userId}` },
                        { text: "❌ Reddet", callback_data: `reject_${taskId}_${userId}` }
                    ]
                ]
            }
        };

        await bot.sendMessage(chatId, message, { ...opts, parse_mode: 'Markdown' });
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: "Failed to send task" }, { status: 500 });
    }
}
