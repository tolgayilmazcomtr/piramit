import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const tiers = await prisma.tier.findMany({ orderBy: { requiredScore: 'asc' } });
        return Response.json(tiers);
    } catch (error) {
        return Response.json({ error: "Failed to fetch tiers" }, { status: 500 });
    }
}
