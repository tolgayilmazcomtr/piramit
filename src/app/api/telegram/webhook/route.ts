import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import bot from "@/lib/telegram";

export async function POST(req: NextRequest) {
    try {
        const update = await req.json();
        console.log("➡️ Telegram Webhook Received:", JSON.stringify(update, null, 2));

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
                    // Check if task exists
                    const existingTask = await prisma.task.findUnique({ where: { id: taskId } });
                    if (!existingTask) {
                        await bot.sendMessage(chatId, "⚠️ Hata: Bu görev artık mevcut değil.");
                        return Response.json({ success: true });
                    }

                    // Update or Create Assignment
                    // If multiple people apply, we update THEIR assignment. 
                    // We don't block others unless the task logic requires it (assuming broad targeting).

                    await prisma.taskAssignment.upsert({
                        where: { userId_taskId: { userId: userId, taskId: taskId } },
                        update: { status: "WAITING_APPROVAL" },
                        create: { userId: userId, taskId: taskId, status: "WAITING_APPROVAL" }
                    });

                    // Notify user
                    await bot.sendMessage(chatId, "✅ Görevi kabul ettiniz! Yöneticinizden onay bekleniyor.");

                    // Notify Manager (Friend)
                    const user = await prisma.user.findUnique({ where: { id: userId }, include: { manager: true } });
                    if (user?.manager?.telegram) {
                        await bot.sendMessage(user.manager.telegram, `🔔 ${user.name} bir görevi kabul etti. Onaylıyor musunuz? (Görev: ${existingTask.subject})`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: "Onayla", callback_data: `approve_${taskId}_${userId}` },
                                        { text: "Reddet", callback_data: `reject_approval_${taskId}_${userId}` }
                                    ]
                                ]
                            }
                        });
                    }

                } else if (action === "reject" && userId) {
                    await prisma.taskAssignment.update({
                        where: { userId_taskId: { userId: userId, taskId: taskId } },
                        data: { status: "REJECTED" }
                    }).catch(() => { }); // Ignore if not found

                    await bot.sendMessage(chatId, "❌ Görevi reddettiniz.");

                } else if (action === "approve") {
                    // Manager approves specific user assignment
                    const targetUserId = userId;

                    if (!targetUserId) {
                        await bot.sendMessage(chatId, "⚠️ Hata: Kullanıcı bilgisi eksik.");
                        return Response.json({ success: true });
                    }

                    await prisma.taskAssignment.update({
                        where: { userId_taskId: { userId: targetUserId, taskId: taskId } },
                        data: { status: "IN_PROGRESS", acceptedAt: new Date() }
                    });

                    await prisma.task.update({
                        where: { id: taskId },
                        data: { status: "IN_PROGRESS" }
                    }).catch(() => { });

                    await bot.sendMessage(chatId, "✅ Kullanıcının görev başlangıcını onayladınız.");

                    // Notify The User with COMPLETE button
                    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
                    if (targetUser?.telegram) {
                        await bot.sendMessage(targetUser.telegram, `🚀 Göreviniz onaylandı! Başlayabilirsiniz.\n\nGörevi bitirdiğinizde aşağıdaki butona basın:`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "🏁 Tamamladım", callback_data: `complete_${taskId}_${targetUserId}` }]
                                ]
                            }
                        });
                    }

                } else if (action === "complete") {
                    // User marks completed -> Status WAITING_VERIFICATION
                    const targetUserId = userId;

                    await prisma.taskAssignment.update({
                        where: { userId_taskId: { userId: targetUserId, taskId: taskId } },
                        data: { status: "WAITING_VERIFICATION" }
                    });

                    await bot.sendMessage(chatId, "✅ Tebrikler! Görev tamamlandı bildirimi yöneticinize iletildi. Onay bekleniyor.");

                    // Notify Manager
                    const user = await prisma.user.findUnique({ where: { id: targetUserId }, include: { manager: true } });
                    const task = await prisma.task.findUnique({ where: { id: taskId } });

                    if (user?.manager?.telegram) {
                        await bot.sendMessage(user.manager.telegram, `🏁 ${user.name} bir görevi tamamladığını bildirdi.\n\nGörev: ${task?.subject}\n\nOnaylıyor musunuz?`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: "✅ Onayla (Tamamlandı)", callback_data: `verify_${taskId}_${targetUserId}` },
                                        { text: "❌ Reddet", callback_data: `reject_verify_${taskId}_${targetUserId}` }
                                    ]
                                ]
                            }
                        });
                    }

                } else if (action === "verify") {
                    // Manager verifies -> Status COMPLETED
                    const targetUserId = userId;

                    await prisma.taskAssignment.update({
                        where: { userId_taskId: { userId: targetUserId, taskId: taskId } },
                        data: { status: "COMPLETED", completedAt: new Date() }
                    });

                    await bot.sendMessage(chatId, "✅ Görevi onayladınız. Kullanıcı görevden puan kazandı (varsa).");

                    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
                    if (targetUser?.telegram) {
                        await bot.sendMessage(targetUser.telegram, `🎉 Harika Haber! Göreviniz doğrulandı ve tamamlandı.`);
                    }

                } else if (action === "reject_verify") {
                    // Manager rejects verification -> Status IN_PROGRESS
                    const targetUserId = userId;

                    await prisma.taskAssignment.update({
                        where: { userId_taskId: { userId: targetUserId, taskId: taskId } },
                        data: { status: "IN_PROGRESS" }
                    });

                    await bot.sendMessage(chatId, "❌ Tamamlandı bildirimini reddettiniz.");

                    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
                    if (targetUser?.telegram) {
                        await bot.sendMessage(targetUser.telegram, `⚠️ Tamamlama bildiriminiz reddedildi. Lütfen eksikleri giderin ve tekrar Tamamladım diyin.`);
                    }

                } else if (action === "reject_approval") {
                    const targetUserId = userId;

                    if (!targetUserId) return Response.json({ success: true });

                    await prisma.taskAssignment.update({
                        where: { userId_taskId: { userId: targetUserId, taskId: taskId } },
                        data: { status: "REJECTED" }
                    });

                    await bot.sendMessage(chatId, "❌ Başlangıcı reddettiniz.");

                    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
                    if (targetUser?.telegram) {
                        await bot.sendMessage(targetUser.telegram, `❌ Görev başvurunuz reddedildi.`);
                    }
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

        if (update.message) {
            const chatId = update.message.chat.id;
            const text = update.message.text || "";

            if (text.startsWith("/start")) {
                const args = text.split(" ");
                // args[0] is "/start", args[1] is the parameter if exists

                if (args.length > 1 && args[1]) {
                    const userIdParam = args[1];

                    // Try to find user with this ID
                    const user = await prisma.user.findUnique({ where: { id: userIdParam } });

                    if (user) {
                        try {
                            await prisma.user.update({
                                where: { id: userIdParam },
                                data: { telegram: String(chatId) }
                            });
                            await bot.sendMessage(chatId, `✅ Harika! Telegram hesabınız **${user.name || user.email}** kullanıcısıyla başarıyla eşleştirildi. Artık bildirimleri buradan alabileceksiniz.`);
                        } catch (err) {
                            console.error("Link user error:", err);
                            await bot.sendMessage(chatId, "⚠️ Bir hata oluştu. Lütfen yöneticiye başvurun.");
                        }
                    } else {
                        await bot.sendMessage(chatId, "⚠️ Kullanıcı bulunamadı. Lütfen paneldeki linki doğru kullandığınızdan emin olun.");
                    }
                } else {
                    // No parameter, check if user exists or register them
                    const existingUser = await prisma.user.findFirst({ where: { telegram: String(chatId) } });

                    if (existingUser) {
                        await bot.sendMessage(chatId, `👋 Tekrar merhaba ${existingUser.name || 'User'}! Zaten sisteme kayıtlısınız.`);
                    } else {
                        // Register new user
                        const from = update.message.from || {};
                        const firstName = from.first_name || "";
                        const lastName = from.last_name || "";
                        const username = from.username || `user_${chatId}`;
                        const name = [firstName, lastName].filter(Boolean).join(" ") || "Telegram User";

                        try {
                            const newUser = await prisma.user.create({
                                data: {
                                    telegram: String(chatId),
                                    nick: username,
                                    name: name,
                                    role: "user"
                                }
                            });
                            await bot.sendMessage(chatId, `✅ Aramıza hoş geldiniz ${name}! Kaydınız başarıyla oluşturuldu.\n\nArtık size atanan görevleri buradan takip edebilirsiniz.`);
                        } catch (err) {
                            console.error("Register Error:", err);
                            await bot.sendMessage(chatId, "⚠️ Kayıt sırasında bir hata oluştu.");
                        }
                    }
                }
            }
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error("Webhook Fatal Error:", error);
        return Response.json({ success: false }, { status: 500 });
    }
}
