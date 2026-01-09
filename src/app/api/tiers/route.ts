import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
    try {
        const tiers = await prisma.tier.findMany({
            include: {
                _count: {
                    select: { users: true, tasks: true }
                },
                users: {
                    select: { score: true }
                }
            },
            orderBy: { requiredScore: 'asc' }
        });

        // Calculate Average Score
        const formattedTiers = tiers.map(t => {
            const totalScore = t.users.reduce((acc, u) => acc + u.score, 0);
            const avgScore = t._count.users > 0 ? (totalScore / t._count.users).toFixed(1) : 0;
            return {
                ...t,
                avgScore,
                users: undefined // remove heavy user list
            };
        });

        return NextResponse.json(formattedTiers);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch tiers" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if ((session?.user as any)?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, name, requiredScore } = body;

        if (id) {
            const tier = await prisma.tier.update({
                where: { id },
                data: { name, requiredScore: Number(requiredScore) }
            });
            return NextResponse.json(tier);
        } else {
            const tier = await prisma.tier.create({
                data: { name, requiredScore: Number(requiredScore) }
            });
            return NextResponse.json(tier);
        }
    } catch (error) {
        return NextResponse.json({ error: "Failed to save tier" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if ((session?.user as any)?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const body = await req.json();
        const { id } = body;
        await prisma.tier.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete tier" }, { status: 500 });
    }
}
