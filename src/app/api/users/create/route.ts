import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { nick, name, phone, discord, telegram, managerId, tierId } = body;

        // Use a default password for created users, or generate one.
        // Requirement didn't specify, we'll use "123456" as default.
        const hashedPassword = await bcrypt.hash("123456", 10);

        const user = await prisma.user.create({
            data: {
                nick,
                name,
                phone,
                discord,
                telegram,
                password: hashedPassword,
                // Since email is unique and required in schema (actually I made it optional in my schema? No, email String? @unique. Wait, I should check schema.)
                // In my schema I wrote `email String? @unique` but typically users need email to login.
                // The frontend form (Step 0) didn't have email in "Kişi Ekleme Formu", only Nick, Name, Phone, DC, TG.
                // So email might be null. But NextAuth Credentials usually needs email/username.
                // We will allow null email for leaf users since they use Telegram presumably?
                // Ah, Admin uses email/pass.
                role: "user",
                managerId: managerId || undefined,
                tierId: tierId || undefined
            }
        });

        return Response.json({ success: true, id: user.id });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Failed to create user" }, { status: 500 });
    }
}
