import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name } = body;
        // Default requiredScore to 0 if not provided, or handle in body
        const tier = await prisma.tier.create({ data: { name, requiredScore: 0 } });
        return Response.json({ success: true, id: tier.id });
    } catch (error) {
        return Response.json({ error: "Failed to create tier" }, { status: 500 });
    }
}
