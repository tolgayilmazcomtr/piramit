import { NextRequest } from "next/server";
import { proxyN8N } from "@/lib/n8n";

// Developer: Tolga Yılmaz
export async function POST(req: NextRequest) {
    return proxyN8N(req, "/tag/create", "POST");
}
