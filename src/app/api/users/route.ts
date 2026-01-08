import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true, // Need this for dropdowns?
                nick: true,
                score: true,
                discord: true,
                telegram: true,
                role: true
            }
        });
        return Response.json(users);
    } catch (error) {
        return Response.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
