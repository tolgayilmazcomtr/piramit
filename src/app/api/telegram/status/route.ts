import { NextResponse } from "next/server";
import bot from "@/lib/telegram";

export async function GET() {
    try {
        const info = await bot.getWebHookInfo();
        return NextResponse.json({
            status: "success",
            info: {
                url: info.url,
                has_custom_certificate: info.has_custom_certificate,
                pending_update_count: info.pending_update_count,
                last_error_date: info.last_error_date,
                last_error_message: info.last_error_message,
                max_connections: info.max_connections,
                allowed_updates: info.allowed_updates
            }
        });
    } catch (error: any) {
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }
}
