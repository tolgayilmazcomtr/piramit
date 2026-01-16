import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const tierId = searchParams.get("tierId");

        if (!tierId) {
            return NextResponse.json({ error: "Tier ID required" }, { status: 400 });
        }

        const tier = await prisma.tier.findUnique({
            where: { id: tierId },
            include: {
                users: {
                    select: {
                        id: true,
                        nick: true,
                        name: true,
                        role: true,
                        score: true
                    }
                }
            }
        });

        if (!tier) {
            return NextResponse.json({ error: "Tier not found" }, { status: 404 });
        }

        return NextResponse.json(tier.users);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if ((session?.user as any)?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { tierId, userId } = body;

        if (!tierId || !userId) {
            return NextResponse.json({ error: "Tier ID and User ID required" }, { status: 400 });
        }

        // Add user to tier (update user's tierId)
        await prisma.user.update({
            where: { id: userId },
            data: { tierId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to add user to tier" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if ((session?.user as any)?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        // We expect userId. tierId is redundant for update but good for validation if needed.
        // Actually we just need to set this user's tierId to null.
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { tierId: null }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to remove user from tier" }, { status: 500 });
    }
}
