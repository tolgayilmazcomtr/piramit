import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        // Check if manager or admin
        const isAuthorized = session?.user?.role === "admin" || session?.user?.role === "manager";

        if (!isAuthorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, nick, name, phone, discord, telegram, role, managerId } = body;

        if (!id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Only Admin can change role or manager
        const isAdmin = session?.user?.role === "admin";

        let updateData: any = {
            nick,
            name,
            phone,
            discord,
            telegram,
        };

        if (isAdmin) {
            if (role) updateData.role = role;
            if (managerId !== undefined) updateData.managerId = managerId === "" ? null : managerId;
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error: any) {
        console.error("Update user error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
