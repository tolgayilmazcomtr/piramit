import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const tasks = await prisma.task.findMany({
            include: {
                tags: true,
                assignee: {
                    select: { name: true, nick: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return Response.json(tasks);
    } catch (error) {
        return Response.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
}
