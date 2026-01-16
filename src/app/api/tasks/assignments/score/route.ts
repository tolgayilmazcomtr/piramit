import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        // Assuming admin or manager can rate
        const userRole = (session?.user as any)?.role;
        if (userRole !== "admin" && userRole !== "manager") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { assignmentId, score } = body;

        if (!assignmentId || score === undefined || score === null) {
            return NextResponse.json({ error: "Assignment ID and Score required" }, { status: 400 });
        }

        const numericScore = Number(score);
        if (isNaN(numericScore) || numericScore < 0) {
            return NextResponse.json({ error: "Invalid score" }, { status: 400 });
        }

        // 1. Update Assignment Score
        const assignment = await prisma.taskAssignment.update({
            where: { id: assignmentId },
            data: { score: numericScore },
            include: { user: true }
        });

        // 2. Recalculate User Average Score
        const userId = assignment.userId;

        // Fetch all assignments for this user that have a score
        const userAssignments = await prisma.taskAssignment.findMany({
            where: {
                userId: userId,
                score: { not: null }
            },
            select: { score: true }
        });

        if (userAssignments.length > 0) {
            const totalScore = userAssignments.reduce((acc, curr) => acc + (curr.score || 0), 0);
            const averageScore = Math.round(totalScore / userAssignments.length);

            await prisma.user.update({
                where: { id: userId },
                data: { score: averageScore }
            });
        }

        return NextResponse.json({ success: true, newScore: numericScore });
    } catch (error) {
        console.error("Score update error:", error);
        return NextResponse.json({ error: "Failed to update score" }, { status: 500 });
    }
}
