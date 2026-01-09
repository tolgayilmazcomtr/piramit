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
import { Trash2, Edit, Plus, BarChart } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

// Developer: Tolga Yılmaz

export default function TiersPage() {
    const [tiers, setTiers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editTier, setEditTier] = useState({ id: "", name: "", requiredScore: 0 });

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
        </div>
    );
}
