import { NextRequest } from "next/server";
import { proxyN8N } from "@/lib/n8n";

// Developer: Tolga Yılmaz
export async function POST(req: NextRequest) {
    // Geliştirme için Mock Login
    // Eğer özel bir header veya body varsa direkt onayla
    const body = await req.clone().json();

    if (body.email === "admin@piramit.com" && body.password === "123456") {
        return Response.json({
            token: "mock-token-admin-" + Date.now(),
            role: "admin",
            success: true
        });
    }

    if (body.email === "friend@piramit.com" && body.password === "123456") {
        return Response.json({
            token: "mock-token-friend-" + Date.now(),
            role: "friend",
            success: true
        });
    }

    return proxyN8N(req, "/auth/login", "POST");
}
