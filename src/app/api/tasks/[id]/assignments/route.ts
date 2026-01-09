import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const taskId = params.id;
        const assignments = await prisma.taskAssignment.findMany({
            where: { taskId },
            include: {
                user: {
                    select: { id: true, nick: true, name: true, role: true }
                }
            },
            orderBy: { assignedAt: 'desc' }
        });

        return NextResponse.json(assignments);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
    }
}
