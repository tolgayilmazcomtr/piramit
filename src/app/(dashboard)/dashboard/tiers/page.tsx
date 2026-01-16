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
import { Trash2, Edit, Plus, BarChart, Users } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Developer: Tolga Yılmaz

export default function TiersPage() {
    const [tiers, setTiers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editTier, setEditTier] = useState({ id: "", name: "", requiredScore: 0 });

    // User Management States
    const [isUsersOpen, setIsUsersOpen] = useState(false);
    const [selectedTierForUsers, setSelectedTierForUsers] = useState<any>(null);
    const [tierUsers, setTierUsers] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [selectedUserToAdd, setSelectedUserToAdd] = useState("");

    const fetchTiers = async () => {
        try {
            const res = await fetch("/api/tiers");
            if (res.ok) {
                const data = await res.json();
                setTiers(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTierUsers = async (tierId: string) => {
        setUsersLoading(true);
        try {
            const res = await fetch(`/api/tiers/users?tierId=${tierId}`);
            if (res.ok) {
                const data = await res.json();
                setTierUsers(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setUsersLoading(false);
        }
    };

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

    const openUsers = (tier: any) => {
        setSelectedTierForUsers(tier);
        setIsUsersOpen(true);
        fetchTierUsers(tier.id);
        if (allUsers.length === 0) fetchAllUsers();
    };

    const handleAddUserToTier = async () => {
        if (!selectedUserToAdd) return;
        try {
            const res = await fetch("/api/tiers/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tierId: selectedTierForUsers.id, userId: selectedUserToAdd }),
            });
            if (res.ok) {
                alert("Kullanıcı katmana eklendi!");
                setSelectedUserToAdd("");
                fetchTierUsers(selectedTierForUsers.id);
                fetchTiers(); // Update counts
            } else {
                alert("Hata oluştu");
            }
        } catch (e) {
            alert("Hata: " + e);
        }
    };

    const handleRemoveUserFromTier = async (userId: string) => {
        if (!confirm("Bu kullanıcıyı katmandan çıkarmak istediğinize emin misiniz?")) return;
        try {
            const res = await fetch("/api/tiers/users", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }), // tierId not needed for removal
            });
            if (res.ok) {
                alert("Kullanıcı katmandan çıkarıldı!");
                fetchTierUsers(selectedTierForUsers.id);
                fetchTiers(); // Update counts
            } else {
                alert("Hata oluştu");
            }
        } catch (e) {
            alert("Hata: " + e);
        }
    };

    useEffect(() => {
        fetchTiers();
    }, []);

    const handleSaveTier = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/tiers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editTier),
            });
            if (res.ok) {
                alert(editTier.id ? "Katman güncellendi!" : "Katman oluşturuldu!");
                setIsEditOpen(false);
                setEditTier({ id: "", name: "", requiredScore: 0 });
                fetchTiers();
            } else {
                alert("Hata oluştu");
            }
        } catch (e) {
            alert("Hata: " + e);
        }
    };

    const handleDeleteTier = async (id: string) => {
        if (!confirm("Bu katmanı silmek istediğinize emin misiniz?")) return;
        try {
            const res = await fetch("/api/tiers", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                alert("Katman silindi!");
                fetchTiers();
            } else {
                alert("Hata oluştu");
            }
        } catch (e) {
            alert("Hata: " + e);
        }
    };

    const openEdit = (tier: any) => {
        setEditTier({ id: tier.id, name: tier.name, requiredScore: tier.requiredScore });
        setIsEditOpen(true);
    };

    const openCreate = () => {
        setEditTier({ id: "", name: "", requiredScore: 0 });
        setIsEditOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Katman (Tier) Yönetimi</h2>
                <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Yeni Katman
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Katman İstatistikleri</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Katman Adı</TableHead>
                                <TableHead>Gereken Puan</TableHead>
                                <TableHead>Kullanıcı Sayısı</TableHead>
                                <TableHead>Ortalama Puan</TableHead>
                                <TableHead>İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="text-center">Yükleniyor...</TableCell></TableRow>
                            ) : tiers.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center">Katman bulunamadı.</TableCell></TableRow>
                            ) : (
                                tiers.map((tier) => (
                                    <TableRow key={tier.id}>
                                        <TableCell className="font-medium">{tier.name}</TableCell>
                                        <TableCell>{tier.requiredScore}</TableCell>
                                        <TableCell>{tier._count?.users || 0}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 font-semibold text-blue-600">
                                                <BarChart className="h-3 w-3" />
                                                {tier.avgScore || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="ghost" title="Kullanıcıları Yönet" onClick={() => openUsers(tier)}>
                                                    <Users className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => openEdit(tier)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDeleteTier(tier.id)}>
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
                        <DialogTitle>{editTier.id ? "Katmanı Düzenle" : "Yeni Katman"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveTier} className="space-y-4">
                        <div>
                            <Label>Katman Adı</Label>
                            <Input
                                value={editTier.name}
                                onChange={(e) => setEditTier({ ...editTier, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label>Gereken Puan</Label>
                            <Input
                                type="number"
                                value={editTier.requiredScore}
                                onChange={(e) => setEditTier({ ...editTier, requiredScore: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">Kaydet</Button>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isUsersOpen} onOpenChange={setIsUsersOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Kullanıcılar: {selectedTierForUsers?.name}</DialogTitle>
                    </DialogHeader>

                    <div className="flex gap-2 items-end mb-4 border-b pb-4">
                        <div className="flex-1">
                            <Label>Kişi Ekle</Label>
                            <Select value={selectedUserToAdd} onValueChange={setSelectedUserToAdd}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Kullanıcı Seçiniz" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allUsers
                                        .filter(u => !tierUsers.some(tu => tu.id === u.id)) // Hide already added users
                                        .map(u => (
                                            <SelectItem key={u.id} value={u.id}>
                                                {u.nick} ({u.name})
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleAddUserToTier} disabled={!selectedUserToAdd}>Ekle</Button>
                    </div>

                    <div className="max-h-[50vh] overflow-y-auto">
                        {usersLoading ? (
                            <div className="text-center py-4">Yükleniyor...</div>
                        ) : tierUsers.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">Bu katmanda kullanıcı yok.</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nick</TableHead>
                                        <TableHead>İsim</TableHead>
                                        <TableHead>Puan</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tierUsers.map(u => (
                                        <TableRow key={u.id}>
                                            <TableCell className="font-medium">{u.nick}</TableCell>
                                            <TableCell>{u.name}</TableCell>
                                            <TableCell>{u.score}</TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="ghost" className="text-red-500 h-8 w-8 p-0" onClick={() => handleRemoveUserFromTier(u.id)}>
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
