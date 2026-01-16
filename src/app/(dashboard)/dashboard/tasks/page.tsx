"use client";

import { useEffect, useState } from "react";
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
import { Eye, Trash2, Edit, Check, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Developer: Tolga Yılmaz
type Task = {
    id: string;
    subject: string;
    status: string;
    assignee?: { name: string };
    reward?: string;
    duration?: string;
    tags?: { name: string }[];
    stats?: {
        total: number;
        accepted: number;
        completed: number;
        rejected: number;
    };
};

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);

    // Edit State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editTask, setEditTask] = useState<any>({});

    // Assignments State
    const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false);
    const [selectedTaskAssignments, setSelectedTaskAssignments] = useState<any[]>([]);
    const [currentTaskSubject, setCurrentTaskSubject] = useState("");

    const fetchTasks = async () => {
        try {
            const res = await fetch("/api/tasks");
            if (res.ok) {
                const data = await res.json();
                setTasks(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Görevler çekilemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchUsers();
    }, []);

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

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm("Bu görevi silmek istediğinize emin misiniz?")) return;
        try {
            const res = await fetch("/api/tasks/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: taskId }),
            });
            if (res.ok) {
                alert("Görev silindi!");
                fetchTasks();
            } else {
                alert("Hata oluştu");
            }
        } catch (e) {
            alert("Hata: " + e);
        }
    };

    const handleUpdateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/tasks/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editTask),
            });
            if (res.ok) {
                alert("Görev güncellendi!");
                setIsEditOpen(false);
                fetchTasks();
            } else {
                alert("Hata oluştu");
            }
        } catch (e) {
            alert("Hata: " + e);
        }
    };

    const handleViewAssignments = async (task: Task) => {
        setCurrentTaskSubject(task.subject);
        try {
            const res = await fetch(`/api/tasks/${task.id}/assignments`);
            if (res.ok) {
                const data = await res.json();
                setSelectedTaskAssignments(Array.isArray(data) ? data : []);
                setIsAssignmentsOpen(true);
            } else {
                alert("Atamalar çekilemedi.");
            }
        } catch (e) {
            alert("Hata: " + e);
        }
    };

    const openEditModal = (task: any) => {
        setEditTask({
            id: task.id,
            subject: task.subject,
            description: task.description || "",
            reward: task.reward || "",
            status: task.status,
            assigneeId: task.assigneeId || "no_assignee"
        });
        setIsEditOpen(true);
    };

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
                                    <TableHead>Kabul / Tamamlanan</TableHead>
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
                                            <TableCell>
                                                <div className="text-xs space-y-1">
                                                    <div className="text-green-600 font-semibold">
                                                        Kabul: {task.stats?.accepted || 0}
                                                    </div>
                                                    <div className="text-blue-600 font-semibold">
                                                        Tamam: {task.stats?.completed || 0}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(task.status)}</TableCell>
                                            <TableCell>
                                                {task.reward || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button size="icon" variant="ghost" title="Detaylar / Katılımcılar" onClick={() => handleViewAssignments(task)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => openEditModal(task)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-100" onClick={() => handleDeleteTask(task.id)}>
                                                        <Trash2 className="h-4 w-4" />
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

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Görevi Düzenle</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateTask} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label>Görev Konusu</Label>
                                <Input
                                    value={editTask.subject}
                                    onChange={(e) => setEditTask({ ...editTask, subject: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Açıklama</Label>
                                <Textarea
                                    value={editTask.description}
                                    onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Ödül (TL, Eşya, Puan vb.)</Label>
                                <Input
                                    value={editTask.reward}
                                    onChange={(e) => setEditTask({ ...editTask, reward: e.target.value })}
                                    placeholder="Örn: 100 TL veya Premium Üyelik"
                                />
                            </div>
                            <div>
                                <Label>Durum</Label>
                                <Select
                                    value={editTask.status}
                                    onValueChange={(val) => setEditTask({ ...editTask, status: val })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Bekliyor (PENDING)</SelectItem>
                                        <SelectItem value="WAITING_APPROVAL">Onay Bekliyor</SelectItem>
                                        <SelectItem value="IN_PROGRESS">Devam Ediyor</SelectItem>
                                        <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
                                        <SelectItem value="CANCELLED">İptal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2">
                                <Label>Atanan Kişi (Assignee)</Label>
                                <Select
                                    value={editTask.assigneeId || "no_assignee"}
                                    onValueChange={(val) => setEditTask({ ...editTask, assigneeId: val })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Kişi Seçiniz" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no_assignee">Atanmamış</SelectItem>
                                        {users.map(u => (
                                            <SelectItem key={u.id} value={u.id}>{u.nick} ({u.role})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button type="submit" className="w-full">Güncelle</Button>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={isAssignmentsOpen} onOpenChange={setIsAssignmentsOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Görev Katılımcıları: {currentTaskSubject}</DialogTitle>
                    </DialogHeader>
                    <div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kullanıcı</TableHead>
                                    <TableHead>Durum</TableHead>
                                    <TableHead>Atanma Tarihi</TableHead>
                                    <TableHead>Puan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedTaskAssignments.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center">Henüz katılımcı yok.</TableCell></TableRow>
                                ) : (
                                    selectedTaskAssignments.map((a: any) => (
                                        <TableRow key={a.id}>
                                            <TableCell>{a.user.nick || a.user.name} ({a.user.role})</TableCell>
                                            <TableCell><Badge variant="outline">{a.status}</Badge></TableCell>
                                            <TableCell>{new Date(a.assignedAt).toLocaleDateString('tr-TR')}</TableCell>
                                            <TableCell>
                                                <ScoreCell assignment={a} onSuccess={() => handleViewAssignments({ id: editTask.id || (tasks.find(t => t.subject === currentTaskSubject)?.id) } as any)} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}

function ScoreCell({ assignment, onSuccess }: { assignment: any, onSuccess: () => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [score, setScore] = useState(assignment.score || "");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (score === "" || isNaN(Number(score)) || Number(score) < 0) {
            alert("Geçerli bir puan giriniz.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/tasks/assignments/score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ assignmentId: assignment.id, score: Number(score) }),
            });

            if (res.ok) {
                setIsEditing(false);
                onSuccess();
            } else {
                alert("Puan kaydedilemedi.");
            }
        } catch (e) {
            console.error(e);
            alert("Hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-1">
                <Input
                    type="number"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-16 h-8"
                    placeholder="0-100"
                />
                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleSave} disabled={loading}>
                    <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setIsEditing(false)} disabled={loading}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 group">
            <span className="font-semibold">{assignment.score !== null ? assignment.score : "-"}</span>
            {/* Show Rate button if no score and status is valid, or edit button if admin */}
            {(assignment.status === "COMPLETED" || assignment.score !== null) && (
                <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsEditing(true)}>
                    <Edit className="h-3 w-3" />
                </Button>
            )}
            {assignment.score === null && assignment.status === "COMPLETED" && (
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setIsEditing(true)}>
                    Puan Ver
                </Button>
            )}
        </div>
    );
}
