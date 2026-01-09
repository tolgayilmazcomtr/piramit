import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const totalTasks = await prisma.task.count();
    const pendingVerifications = await prisma.task.count({
        where: {
            status: "WAITING_VERIFICATION"
        }
    });
    const totalUsers = await prisma.user.count();

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Görev</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalTasks}</div>
                    <p className="text-xs text-muted-foreground">Aktif görev sayısı</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bekleyen Onay</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{pendingVerifications}</div>
                    <p className="text-xs text-muted-foreground">Doğrulama bekleyen</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Kişi</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalUsers}</div>
                    <p className="text-xs text-muted-foreground">Sistemdeki toplam üye</p>
                </CardContent>
            </Card>
        </div>
    );
}
