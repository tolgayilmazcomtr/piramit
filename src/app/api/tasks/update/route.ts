import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        const userRole = (session?.user as any)?.role;
        const isAuthorized = userRole === "admin" || userRole === "manager";

        if (!isAuthorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, subject, description, reward, status, assigneeId } = body;

        if (!id) {
            return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data: {
                subject,
                description,
                reward: reward || undefined,
                status,
                assigneeId: assigneeId === "no_assignee" ? null : assigneeId
            },
        });

        return NextResponse.json({ success: true, task: updatedTask });
    } catch (error: any) {
        console.error("Update task error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
