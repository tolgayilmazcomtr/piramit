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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Plus, Users } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog";

// Developer: Tolga Yılmaz

export default function TagsPage() {
    const [tags, setTags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editTag, setEditTag] = useState({ id: "", name: "" });

    const fetchTags = async () => {
        try {
            const res = await fetch("/api/tags");
            if (res.ok) {
                const data = await res.json();
                setTags(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const handleSaveTag = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editTag),
            });
            if (res.ok) {
                alert(editTag.id ? "Etiket güncellendi!" : "Etiket oluşturuldu!");
                setIsEditOpen(false);
                setEditTag({ id: "", name: "" });
                fetchTags();
            } else {
                alert("Hata oluştu");
            }
        } catch (e) {
            alert("Hata: " + e);
        }
    };

    const handleDeleteTag = async (id: string) => {
        if (!confirm("Bu etiketi silmek istediğinize emin misiniz?")) return;
        try {
            const res = await fetch("/api/tags", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                alert("Etiket silindi!");
                fetchTags();
            } else {
                alert("Hata oluştu");
            }
        } catch (e) {
            alert("Hata: " + e);
        }
    };

    const openEdit = (tag: any) => {
        setEditTag({ id: tag.id, name: tag.name });
        setIsEditOpen(true);
    };

    const openCreate = () => {
        setEditTag({ id: "", name: "" });
        setIsEditOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Etiket Yönetimi</h2>
                <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Yeni Etiket
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Etiket Listesi</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Etiket Adı</TableHead>
                                <TableHead>Kullanıcı Sayısı</TableHead>
                                <TableHead>Görev Sayısı</TableHead>
                                <TableHead>İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} className="text-center">Yükleniyor...</TableCell></TableRow>
                            ) : tags.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center">Etiket bulunamadı.</TableCell></TableRow>
                            ) : (
                                tags.map((tag) => (
                                    <TableRow key={tag.id}>
                                        <TableCell className="font-medium">{tag.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3 w-3 text-gray-400" />
                                                {tag._count?.users || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell>{tag._count?.tasks || 0}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => openEdit(tag)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDeleteTag(tag.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editTag.id ? "Etiketi Düzenle" : "Yeni Etiket"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveTag} className="space-y-4">
                        <div>
                            <Label>Etiket Adı</Label>
                            <Input
                                value={editTag.name}
                                onChange={(e) => setEditTag({ ...editTag, name: e.target.value })}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">Kaydet</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
