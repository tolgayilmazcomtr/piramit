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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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

    const [isUsersOpen, setIsUsersOpen] = useState(false);
    const [selectedTagForUsers, setSelectedTagForUsers] = useState<any>(null);
    const [tagUsers, setTagUsers] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [selectedUserToAdd, setSelectedUserToAdd] = useState("");

    const fetchAllUsers = async () => {
        try {
            const res = await fetch("/api/users");
            if (res.ok) {
                const data = await res.json();
                setAllUsers(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openUsers = (tag: any) => {
        setSelectedTagForUsers(tag);
        setIsUsersOpen(true);
        fetchTagUsers(tag.id);
        if (allUsers.length === 0) fetchAllUsers();
    };

    const fetchTagUsers = async (tagId: string) => {
        setUsersLoading(true);
        try {
            const res = await fetch(`/api/tags/users?tagId=${tagId}`);
            if (res.ok) {
                const data = await res.json();
                setTagUsers(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setUsersLoading(false);
        }
    };

    const handleRemoveUserFromTag = async (userId: string) => {
        if (!confirm("Bu kullanıcıyı etiketten çıkarmak istediğinize emin misiniz?")) return;
        try {
            const res = await fetch("/api/tags/users", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tagId: selectedTagForUsers.id, userId }),
            });
            if (res.ok) {
                alert("Kullanıcı etiketten çıkarıldı!");
                fetchTagUsers(selectedTagForUsers.id);
                fetchTags(); // Update counts
            } else {
                alert("Hata oluştu");
            }
        } catch (e) {
            alert("Hata: " + e);
        }
    };

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

    const handleAddUserToTag = async () => {
        if (!selectedUserToAdd) return;
        try {
            const res = await fetch("/api/tags/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tagId: selectedTagForUsers.id, userId: selectedUserToAdd }),
            });
            if (res.ok) {
                alert("Kullanıcı etikete eklendi!");
                setSelectedUserToAdd("");
                fetchTagUsers(selectedTagForUsers.id);
                fetchTags(); // Update counts
            } else {
                alert("Hata oluştu");
            }
        } catch (e) {
            alert("Hata: " + e);
        }
    };

    // Import Select components (Assuming they are imported at top, if not I will check imports)
    // Checking imports... Select is not imported in original file. I need to add imports.

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
                                                <Button size="icon" variant="ghost" title="Kullanıcıları Gör" onClick={() => openUsers(tag)}>
                                                    <Users className="h-4 w-4" />
                                                </Button>
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

            <Dialog open={isUsersOpen} onOpenChange={setIsUsersOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Kullanıcılar: {selectedTagForUsers?.name}</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col sm:flex-row gap-2 sm:items-end mb-4 border-b pb-4">
                        <div className="flex-1 w-full">
                            <Label>Kişi Ekle</Label>
                            <Select value={selectedUserToAdd} onValueChange={setSelectedUserToAdd}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Kullanıcı Seçiniz" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allUsers
                                        .filter(u => !tagUsers.some(tu => tu.id === u.id)) // Hide already added users
                                        .map(u => (
                                            <SelectItem key={u.id} value={u.id}>
                                                {u.nick} ({u.name})
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="w-full sm:w-auto" onClick={handleAddUserToTag} disabled={!selectedUserToAdd}>Ekle</Button>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {usersLoading ? (
                            <div className="text-center py-4">Yükleniyor...</div>
                        ) : tagUsers.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">Bu etikette kullanıcı yok.</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nick</TableHead>
                                        <TableHead>İsim</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tagUsers.map(u => (
                                        <TableRow key={u.id}>
                                            <TableCell className="font-medium">{u.nick}</TableCell>
                                            <TableCell>{u.name}</TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="ghost" className="text-red-500 h-8 w-8 p-0" onClick={() => handleRemoveUserFromTag(u.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
