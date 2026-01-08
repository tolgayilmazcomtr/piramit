import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name } = body;
        const tag = await prisma.tag.create({ data: { name } });
        return Response.json({ success: true, id: tag.id });
    } catch (error) {
        return Response.json({ error: "Failed to create tag" }, { status: 500 });
    }
}
