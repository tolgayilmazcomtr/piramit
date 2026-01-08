import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const tags = await prisma.tag.findMany();
        return Response.json(tags);
    } catch (error) {
        return Response.json({ error: "Failed to fetch tags" }, { status: 500 });
    }
}
