import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
    try {
        const tags = await prisma.tag.findMany({
            include: {
                _count: {
                    select: { users: true, tasks: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(tags);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if ((session?.user as any)?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, name } = body;

        if (id) {
            // Update
            const tag = await prisma.tag.update({
                where: { id },
                data: { name }
            });
            return NextResponse.json(tag);
        } else {
            // Create
            const tag = await prisma.tag.create({
                data: { name }
            });
            return NextResponse.json(tag);
        }
    } catch (error) {
        return NextResponse.json({ error: "Failed to save tag" }, { status: 500 });
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
        await prisma.tag.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 });
    }
}
