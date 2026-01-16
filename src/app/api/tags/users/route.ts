import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const tagId = searchParams.get("tagId");

        if (!tagId) {
            return NextResponse.json({ error: "Tag ID required" }, { status: 400 });
        }

        const tag = await prisma.tag.findUnique({
            where: { id: tagId },
            include: {
                users: {
                    select: {
                        id: true,
                        nick: true,
                        name: true,
                        role: true
                    }
                }
            }
        });

        if (!tag) {
            return NextResponse.json({ error: "Tag not found" }, { status: 404 });
        }

        return NextResponse.json(tag.users);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        // Allow admin or maybe manager? The prompt implies "admin" usually manages tags.
        if ((session?.user as any)?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { tagId, userId } = body;

        if (!tagId || !userId) {
            return NextResponse.json({ error: "Tag ID and User ID required" }, { status: 400 });
        }

        // Disconnect user from tag
        await prisma.tag.update({
            where: { id: tagId },
            data: {
                users: {
                    disconnect: { id: userId }
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to remove user from tag" }, { status: 500 });
    }
}
