"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, XCircle, CheckCircle } from "lucide-react";

// Developer: Tolga Yılmaz
type Task = {
    id: string;
    subject: string;
    status: string;
    assignee?: { name: string };
    reward?: number;
    duration?: string;
    tags?: { name: string }[];
};

export default function TasksPage() {
    const { token } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await fetch("/api/tasks", {
                    headers: { Authorization: token || "" },
                });
                if (res.ok) {
                    const data = await res.json();
                    // Eğer data array değilse boş array kabul et
                    setTasks(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Görevler çekilemedi:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchTasks();
    }, [token]);

    useEffect(() => {
        let result = tasks;

        if (search) {
            result = result.filter((t) =>
                t.subject.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (statusFilter !== "ALL") {
            result = result.filter((t) => t.status === statusFilter);
        }

        setFilteredTasks(result);
    }, [tasks, search, statusFilter]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Bekliyor":
                return <Badge variant="secondary">Bekliyor</Badge>;
            case "Devam Ediyor":
                return <Badge variant="default">Devam Ediyor</Badge>;
            case "Tamamlandı":
                return <Badge className="bg-green-500">Tamamlandı</Badge>;
            case "İptal":
                return <Badge variant="destructive">İptal</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Görev Listesi</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-4">
                        <Input
                            placeholder="Konu ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-sm"
                        />
                        <select
                            className="px-3 py-2 border rounded-md text-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">Tüm Durumlar</option>
                            <option value="Bekliyor">Bekliyor</option>
                            <option value="Onay Bekliyor">Onay Bekliyor</option>
                            <option value="Devam Ediyor">Devam Ediyor</option>
                            <option value="Tamamlandı">Tamamlandı</option>
                            <option value="İptal">İptal</option>
                        </select>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Görev Konusu</TableHead>
                                    <TableHead>Etiketler</TableHead>
                                    <TableHead>Atanan</TableHead>
                                    <TableHead>Durum</TableHead>
                                    <TableHead>Ödül</TableHead>
                                    <TableHead>İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            Yükleniyor...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredTasks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            Görev bulunamadı.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTasks.map((task) => (
                                        <TableRow key={task.id}>
                                            <TableCell className="font-medium">
                                                {task.subject}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1 flex-wrap">
                                                    {task.tags?.map((t, i) => (
                                                        <span
                                                            key={i}
                                                            className="text-xs bg-gray-100 px-2 py-1 rounded"
                                                        >
                                                            {t.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>{task.assignee?.name || "-"}</TableCell>
                                            <TableCell>{getStatusBadge(task.status)}</TableCell>
                                            <TableCell>
                                                {task.reward ? `${task.reward} ₺` : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button size="icon" variant="ghost">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="text-red-500">
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
