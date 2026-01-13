import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import bot from "@/lib/telegram";

export async function POST(req: NextRequest) {
    try {
        const update = await req.json();

        if (update.callback_query) {
            const callbackQueryId = update.callback_query.id;
            const data = update.callback_query.data; // e.g., "accept_taskId_userId"
            const chatId = update.callback_query.message.chat.id;

            // Immediately answer to stop loading state (optimistic), or do it at the end.
            // Doing it at the end is safer for "notification" types, but if logic takes long, it timeouts.
            // Let's try to handle logic and if error, send error message.

            try {
                // Handle callbacks
                const parts = data.split('_');
                const action = parts[0];
                const taskId = parts[1];
                const userId = parts[2] || null; // For accept/reject actions by user

                if (action === "accept" && userId) {
                    // Check if task exists first
                    const existingTask = await prisma.task.findUnique({ where: { id: taskId } });
                    if (!existingTask) {
                        await bot.sendMessage(chatId, "⚠️ Hata: Bu görev artık mevcut değil.");
                        return Response.json({ success: true });
                    }
                    if (existingTask.status !== "PENDING") {
                        await bot.sendMessage(chatId, `⚠️ Bu görev zaten şu durumda: ${existingTask.status}`);
                        await bot.answerCallbackQuery(callbackQueryId, { text: "Görev zaten alınmış/tamamlanmış" });
                        return Response.json({ success: true });
                    }

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
                        data: { status: "PENDING", assigneeId: null },
                    });

                    await bot.sendMessage(chatId, "❌ Görev başlangıcını reddettiniz.");
                }

                // Success feedback
                await bot.answerCallbackQuery(callbackQueryId, { text: "İşlem başarılı" });

            } catch (innerError: any) {
                console.error("Webhook Logic Error:", innerError);
                // Send error to user so they see what happened
                await bot.sendMessage(chatId, `⚠️ Bir hata oluştu: ${innerError.message}`);
                // Still try to stop the loading animation
                await bot.answerCallbackQuery(callbackQueryId, { text: "Hata oluştu!" });
            }
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error("Webhook Fatal Error:", error);
        return Response.json({ success: false }, { status: 500 });
    }
}
