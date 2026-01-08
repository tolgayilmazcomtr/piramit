import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import bot from "@/lib/telegram";

export async function POST(req: NextRequest) {
    try {
        const update = await req.json();

        if (update.callback_query) {
            const data = update.callback_query.data; // e.g., "accept_taskId_userId"
            const chatId = update.callback_query.message.chat.id;
            const messageId = update.callback_query.message.message_id;

            // Handle callbacks
            const parts = data.split('_');
            const action = parts[0];
            const taskId = parts[1];
            const userId = parts[2] || null; // For accept/reject actions by user

            if (action === "accept" && userId) {
                // User accepts task -> Status: WAITING_APPROVAL
                await prisma.task.update({
                    where: { id: taskId },
                    data: {
                        status: "WAITING_APPROVAL",
                        assigneeId: userId
                    }
                });

                // Notify user
                await bot.sendMessage(chatId, "✅ Görevi kabul ettiniz! Yöneticinizden onay bekleniyor.");

                // Notify Manager (Friend) - Need to find manager of this user
                const user = await prisma.user.findUnique({ where: { id: userId }, include: { manager: true } });
                if (user?.manager?.telegram) {
                    await bot.sendMessage(user.manager.telegram, `🔔 ${user.name} bir görevi kabul etti. Onaylıyor musunuz?`, {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: "Onayla", callback_data: `approve_${taskId}` },
                                    { text: "Reddet", callback_data: `reject_approval_${taskId}` }
                                ]
                            ]
                        }
                    });
                }

            } else if (action === "reject" && userId) {
                // User rejects -> Log it or ignore? Just notify.
                await bot.sendMessage(chatId, "❌ Görevi reddettiniz.");
                // Maybe log rejection?
            } else if (action === "approve") {
                // Manager approves -> Status: IN_PROGRESS
                const task = await prisma.task.update({
                    where: { id: taskId },
                    data: { status: "IN_PROGRESS" },
                    include: { assignee: true }
                });

                await bot.sendMessage(chatId, "✅ Görev başlangıcını onayladınız.");
                if (task.assignee?.telegram) {
                    await bot.sendMessage(task.assignee.telegram, `🚀 Göreviniz onaylandı! Başlayabilirsiniz: ${task.subject}`);
                }

            } else if (action === "reject_approval") {
                // Manager rejects -> Status: CANCELLED or PENDING (back to pool)
                const task = await prisma.task.update({
                    where: { id: taskId },
                    data: { status: "PENDING", assigneeId: null }, // Reset to pending? Or Cancelled? User logic "reject_approval" usually means "No, don't do this".
                    // Let's say CANCELLED for this assignment flow.
                });

                await bot.sendMessage(chatId, "❌ Görev başlangıcını reddettiniz.");
                // Notify user?
            }

            // Answer callback query to stop loading animation
            await bot.answerCallbackQuery(update.callback_query.id);
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false }, { status: 500 });
    }
}
