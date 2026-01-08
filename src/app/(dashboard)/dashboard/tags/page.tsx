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
export default function TagsPage() {
    const { token } = useAuth();
    const [tags, setTags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newTagName, setNewTagName] = useState("");

    const fetchTags = async () => {
        try {
            const res = await fetch("/api/tags", {
                headers: { Authorization: token || "" },
            });
            if (res.ok) {
                const data = await res.json();
                setTags(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchTags();
    }, [token]);

    const handleAddTag = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/tag/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token || "",
                },
                body: JSON.stringify({ name: newTagName }),
            });
            if (res.ok) {
                alert("Etiket eklendi!");
                setIsAddOpen(false);
                setNewTagName("");
                fetchTags();
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
                <h2 className="text-3xl font-bold tracking-tight">Etiket Yönetimi</h2>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Yeni Etiket
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Yeni Etiket Ekle</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddTag} className="space-y-4">
                            <div>
                                <Label>Etiket Adı</Label>
                                <Input
                                    required
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full">Kaydet</Button>
                        </form>
                    </DialogContent>
                </Dialog>
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
                                <TableHead className="w-[100px]">ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={2}>Yükleniyor...</TableCell></TableRow>
                            ) : tags.length === 0 ? (
                                <TableRow><TableCell colSpan={2}>Etiket bulunamadı.</TableCell></TableRow>
                            ) : (
                                tags.map((tag) => (
                                    <TableRow key={tag.id}>
                                        <TableCell className="font-medium">{tag.name}</TableCell>
                                        <TableCell className="text-muted-foreground text-xs">{tag.id}</TableCell>
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
