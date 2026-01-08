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
                    await prisma.user.update({
                        where: { id: task.assigneeId },
                        data: { score: { increment: Math.floor(task.reward) } }
                    });
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
