import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import bot from "@/lib/telegram";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { subject, description, file, tierId, tagIds, target, reward, duration } = body;

        // Create Task in DB
        const task = await prisma.task.create({
            data: {
                subject,
                description,
                file,
                tierId: tierId,
                reward: reward || "",
                duration: duration ? new Date(duration) : null,
                status: "PENDING",
                targetType: target.type,
                targetUserIds: JSON.stringify(target.userIds || []),
                targetTopCount: Number(target.topCount || 0),
                tags: {
                    connect: tagIds?.map((id: string) => ({ id })) || []
                }
            },
            include: {
                tier: true,
                tags: true
            }
        });

        // Send Telegram Notification (Mock logic for target selection)
        // Real logic needs user's Telegram ID from DB.
        // For now, we will try to find users based on targeting.

        let targetUsers: any[] = [];
        if (target.type === "all") {
            // Apply filtering based on Tier and Tags if provided
            const whereClause: any = { role: 'user', telegram: { not: null } };

            if (tierId) {
                whereClause.tierId = tierId;
            }

            if (tagIds && tagIds.length > 0) {
                whereClause.tags = {
                    some: {
                        id: { in: tagIds }
                    }
                };
            }

            targetUsers = await prisma.user.findMany({ where: whereClause });
        } else if (target.type === "selected") {
            targetUsers = await prisma.user.findMany({ where: { id: { in: target.userIds }, telegram: { not: null } } });
        } else if (target.type === "top") {
            targetUsers = await prisma.user.findMany({
                where: { role: 'user', telegram: { not: null } },
                orderBy: { score: 'desc' },
                take: target.topCount
            });
        }

        // Create Assignments for all targeted users
        if (targetUsers.length > 0) {
            await prisma.taskAssignment.createMany({
                data: targetUsers.map(user => ({
                    taskId: task.id,
                    userId: user.id,
                    status: "ASSIGNED"
                }))
            });
        }

        // Send message to each user
        for (const user of targetUsers) {
            if (user.telegram) {
                try {
                    const opts = {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: "✅ Kabul Et", callback_data: `ac_${task.id}_${user.id}` },
                                    { text: "❌ Reddet", callback_data: `rj_${task.id}_${user.id}` }
                                ]
                            ]
                        }
                    };
                    await bot.sendMessage(user.telegram, `📢 YENİ GÖREV:\n\n*${task.subject}*\n\n${task.description || ''}\n\n💰 Ödül: ${task.reward}`, { ...opts, parse_mode: 'Markdown' });
                } catch (e) {
                    console.error(`Failed to send telegram to ${user.id}`, e);
                }
            }
        }

        return Response.json({ success: true, id: task.id });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Failed to create task" }, { status: 500 });
    }
}
