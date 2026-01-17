import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserRole = (session.user as any).role;
    const currentUserId = (session.user as any).id;

    try {
        let whereClause = {};

        // If not admin, strict visibility
        if (currentUserRole !== "admin") {
            // Friends/Managers see only their own users
            if (currentUserRole === "friend" || currentUserRole === "manager") {
                whereClause = { managerId: currentUserId };
            } else {
                // Regular users see nobody (or maybe just themselves? restricting to nobody for now as per admin panel usage)
                whereClause = { id: currentUserId }; // Or return empty array
            }
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                nick: true,
                score: true,
                discord: true,
                telegram: true,
                role: true,
                managerId: true,
                tierId: true,
                tier: { select: { name: true } },
                tags: { select: { id: true, name: true } }
            }
        });
        return Response.json(users);
    } catch (error) {
        console.error("GET /api/users ERROR:", error);
        return Response.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
