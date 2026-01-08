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
        const { userId, score, note } = body;

        // Update user score
        const user = await prisma.user.update({
            where: { id: userId },
            data: { score: score } // In real app, might average it or add history. Here just set.
        });

        // Check tiers upgrade
        const tiers = await prisma.tier.findMany({ orderBy: { requiredScore: 'desc' } });
        let newTierId = user.tierId;

        for (const tier of tiers) {
            if (user.score >= tier.requiredScore) {
                newTierId = tier.id;
                break;
            }
        }

        if (newTierId !== user.tierId) {
            await prisma.user.update({
                where: { id: userId },
                data: { tierId: newTierId }
            });
        }

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: "Failed to rate user" }, { status: 500 });
    }
}
