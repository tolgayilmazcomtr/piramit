import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
    try {
        console.log("Testing auth()...");
        const session = await auth();
        console.log("Auth session result:", session);
        return NextResponse.json({ status: "ok", session });
    } catch (error: any) {
        console.error("Auth error:", error);
        return NextResponse.json({ status: "error", message: error.message, stack: error.stack }, { status: 500 });
    }
}
