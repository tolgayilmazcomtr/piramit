import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
    const logs: string[] = [];
    try {
        logs.push("Starting debug...");

        // Step 1: Auth
        logs.push("Step 1: Check Auth");
        const session = await auth();
        logs.push(`Auth result: ${session ? "Logged In (" + (session.user as any)?.email + ")" : "Not Logged In"}`);

        // Step 2: DB Connection
        logs.push("Step 2: Simple DB Query (User Count)");
        const count = await prisma.user.count();
        logs.push(`User count: ${count}`);

        // Step 3: Check Tier Relation
        logs.push("Step 3: Check Tier Table");
        try {
            const tiers = await prisma.tier.findMany({ take: 1 });
            logs.push(`Tiers found: ${tiers.length}`);
        } catch (e: any) {
            logs.push(`Tier Error: ${e.message}`);
        }

        // Step 4: Check Tags Relation
        logs.push("Step 4: Check Tag Table");
        try {
            const tags = await prisma.tag.findMany({ take: 1 });
            logs.push(`Tags found: ${tags.length}`);
        } catch (e: any) {
            logs.push(`Tag Error: ${e.message}`);
        }

        // Step 5: Full Join (The one failing)
        logs.push("Step 5: Attempting Full Query (like api/users)");
        try {
            const users = await prisma.user.findMany({
                take: 1,
                select: {
                    id: true,
                    tier: { select: { name: true } },
                    tags: { select: { id: true, name: true } }
                }
            });
            logs.push(`Full Query Success. Retrieved ${users.length} users.`);
        } catch (e: any) {
            logs.push(`Full Query FAILED: ${e.message}`);
            throw e; // Re-throw to catch block but include logs
        }

        return NextResponse.json({ status: "success", logs });
    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: error.message,
            logs
        }, { status: 200 }); // Return 200 to see the JSON in browser
    }
}
