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
        const { chatId, message } = body;

        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: "Failed to send message" }, { status: 500 });
    }
}
