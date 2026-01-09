import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role logic
    const currentUserRole = (session.user as any).role;
    const currentUserId = (session.user as any).id;

    try {
        const body = await req.json();
        const { nick, name, phone, discord, telegram, role, managerId, tierId } = body;

        let finalManagerId = managerId;
        let finalRole = role || "user"; // Default to user if not specified

        // Hierarchy Enforcement
        if (currentUserRole !== "admin") {
            // Non-admins can only create users assign to themselves
            finalManagerId = currentUserId;
            // Non-admins cannot create other admins or friends (managers), only users
            finalRole = "user";
        }

        const hashedPassword = await bcrypt.hash("123456", 10);

        const user = await prisma.user.create({
            data: {
                nick,
                name,
                phone,
                discord,
                telegram,
                password: hashedPassword,
                role: finalRole,
                managerId: finalManagerId || undefined,
                tierId: tierId || undefined
            }
        });

        return Response.json({ success: true, id: user.id });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Failed to create user" }, { status: 500 });
    }
}
