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
                },
                assignments: {
                    select: { status: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Enrich tasks with stats
        const enrichedTasks = (tasks as any[]).map(t => {
            const stats = {
                total: t.assignments?.length || 0,
                accepted: t.assignments?.filter((a: any) => a.status === 'ACCEPTED').length || 0,
                completed: t.assignments?.filter((a: any) => a.status === 'COMPLETED').length || 0,
                rejected: t.assignments?.filter((a: any) => a.status === 'REJECTED').length || 0,
            };
            return { ...t, stats, assignments: undefined };
        });

        return Response.json(enrichedTasks);
    } catch (error) {
        return Response.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
}
