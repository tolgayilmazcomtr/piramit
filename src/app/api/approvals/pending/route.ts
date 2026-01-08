import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Assuming Manager sees tasks that are WAITING_APPROVAL
        // If we had task assignment to users, filter by users managed by this session.user.id
        // For now, listing all WAITING_APPROVAL tasks.
        const tasks = await prisma.task.findMany({
            where: { status: "WAITING_APPROVAL" },
            include: { assignee: true }
        });

        // Map to simplified structure if needed by frontend
        const mapped = tasks.map(t => ({
            id: t.id,
            subject: t.subject,
            date: t.createdAt.toISOString(),
            user: t.assignee
        }));

        return Response.json(mapped);
    } catch (error) {
        return Response.json({ error: "Fetch error" }, { status: 500 });
    }
}
