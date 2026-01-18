import { NextResponse } from "next/server";
import bot from "@/lib/telegram";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const forcedUrl = searchParams.get("url");

        // Determine Domain
        let domain = "https://hello.testsitesi.xyz"; // Hardcoded backup or env
        if (process.env.NEXT_PUBLIC_APP_URL) domain = process.env.NEXT_PUBLIC_APP_URL;

        // Dynamic detection from request if local/testing
        const host = req.headers.get("host");
        if (host && !host.includes("localhost")) {
            domain = `https://${host}`;
        }

        const webhookUrl = forcedUrl || `${domain}/api/telegram/webhook`;

        // Log token presence (safe)
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const isMock = !token || token === 'mock_token';

        if (isMock) {
            return NextResponse.json({
                status: "error",
                message: "TELEGRAM_BOT_TOKEN is missing or invalid in server environment.",
                env_check: {
                    has_token: !!token,
                    token_length: token ? token.length : 0
                }
            }, { status: 500 });
        }

        // Set Webhook
        await bot.setWebHook(webhookUrl);

        // Get Info to verify
        const info = await bot.getWebHookInfo();

        return NextResponse.json({
            status: "success",
            message: "Webhook updated successfully.",
            webhook_url: webhookUrl,
            telegram_response: info
        });

    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
