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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// Developer: Tolga Yılmaz
export default function TiersPage() {
    const { token } = useAuth();
    const [tiers, setTiers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newTierName, setNewTierName] = useState("");

    const fetchTiers = async () => {
        try {
            const res = await fetch("/api/tiers", {
                headers: { Authorization: token || "" },
            });
            if (res.ok) {
                const data = await res.json();
                setTiers(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchTiers();
    }, [token]);

    const handleAddTier = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/tier/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token || "",
                },
                body: JSON.stringify({ name: newTierName }),
            });
            if (res.ok) {
                alert("Katman eklendi!");
                setIsAddOpen(false);
                setNewTierName("");
                fetchTiers();
            } else {
                alert("Hata oluştu");
            }
        } catch (e) {
            alert("Hata: " + e);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Katman Yönetimi</h2>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Yeni Katman
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Yeni Katman Ekle</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddTier} className="space-y-4">
                            <div>
                                <Label>Katman Adı</Label>
                                <Input
                                    required
                                    value={newTierName}
                                    onChange={(e) => setNewTierName(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full">Kaydet</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Katman Listesi</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Katman Adı</TableHead>
                                <TableHead className="w-[100px]">ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={2}>Yükleniyor...</TableCell></TableRow>
                            ) : tiers.length === 0 ? (
                                <TableRow><TableCell colSpan={2}>Katman bulunamadı.</TableCell></TableRow>
                            ) : (
                                tiers.map((tier) => (
                                    <TableRow key={tier.id}>
                                        <TableCell className="font-medium">{tier.name}</TableCell>
                                        <TableCell className="text-muted-foreground text-xs">{tier.id}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
