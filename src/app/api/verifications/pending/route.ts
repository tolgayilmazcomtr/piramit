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
            where: { status: "WAITING_VERIFICATION" },
            include: { assignee: true }
        });

        const mapped = tasks.map(t => ({
            id: t.id,
            subject: t.subject,
            proofUrl: t.proofUrl,
            user: t.assignee
        }));

        return Response.json(mapped);
    } catch (error) {
        return Response.json({ error: "Fetch error" }, { status: 500 });
    }
}
