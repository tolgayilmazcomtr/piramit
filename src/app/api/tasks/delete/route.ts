import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        // Only admin or manager can delete tasks? Or maybe just admin.
        // Let's say Admin and Manager (friend) can delete.
        const userRole = (session?.user as any)?.role;
        const isAuthorized = userRole === "admin" || userRole === "manager";

        if (!isAuthorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
        }

        await prisma.task.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete task error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
