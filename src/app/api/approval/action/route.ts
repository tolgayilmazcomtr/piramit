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
        const { id, type, action } = body;

        const task = await prisma.task.findUnique({
            where: { id },
            include: { assignee: true }
        });

        if (!task) return Response.json({ error: "Not found" }, { status: 404 });

        let newStatus = task.status;
        let notifyMessage = "";

        if (type === "approval") {
            if (action === "approve") {
                newStatus = "IN_PROGRESS";
                notifyMessage = `✅ Görev onaylandı! Başlayabilirsiniz: ${task.subject}`;
            } else {
                newStatus = "CANCELLED"; // Or Unassigned?
                notifyMessage = `❌ Görev başvurunuz reddedildi: ${task.subject}`;
            }
        } else if (type === "verification") {
            if (action === "approve") {
                newStatus = "COMPLETED";
                notifyMessage = `🎉 Görev tamamlandı onaylandı! Ödül: ${task.reward} puan.`;
                // Update user score here?
                if (task.assigneeId) {
                    // Try to parse number from string reward (e.g. "100 TL" -> 100)
                    const rewardPoints = task.reward ? parseInt(task.reward.replace(/[^0-9]/g, '')) || 0 : 0;
                    if (rewardPoints > 0) {
                        await prisma.user.update({
                            where: { id: task.assigneeId },
                            data: { score: { increment: rewardPoints } }
                        });
                    }
                }
            } else {
                newStatus = "IN_PROGRESS"; // Return to progress if rejected?
                notifyMessage = `⚠️ Görev kanıtı reddedildi, tekrar kontrol et: ${task.subject}`;
            }
        }

        await prisma.task.update({
            where: { id },
            data: { status: newStatus }
        });

        // Notify User via Telegram
        if (task.assignee?.telegram) {
            try {
                await bot.sendMessage(task.assignee.telegram, notifyMessage);
            } catch (e) { console.error("Telegram error", e); }
        }

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: "Action failed" }, { status: 500 });
    }
}
