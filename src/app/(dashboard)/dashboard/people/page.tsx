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
import { Plus, Star, Edit } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

// Developer: Tolga Yılmaz
export default function PeoplePage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isRateOpen, setIsRateOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    // Form States
    const [newPerson, setNewPerson] = useState({
        nick: "",
        name: "",
        phone: "",
        discord: "",
        telegram: "",
    });

    const [rating, setRating] = useState([5]);
    const [ratingNote, setRatingNote] = useState("");

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddPerson = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/users/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newPerson),
            });
            if (res.ok) {
                alert("Kişi eklendi!");
                setIsAddOpen(false);
                fetchUsers();
            } else {
                alert("Hata oluştu");
            }
        } catch (e) {
            alert("Hata: " + e);
        }
    };

    const handleRatePerson = async () => {
        if (!selectedUser) return;
        try {
            const res = await fetch("/api/users/rate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    score: rating[0],
                    note: ratingNote,
                }),
            });
            if (res.ok) {
                alert("Puan verildi!");
                setIsRateOpen(false);
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
                <h2 className="text-3xl font-bold tracking-tight">Kişi Yönetimi</h2>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Yeni Kişi Ekle
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Yeni Kişi Ekle</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddPerson} className="space-y-4">
                            <div>
                                <Label>Nick (Zorunlu)</Label>
                                <Input
                                    required
                                    value={newPerson.nick}
                                    onChange={(e) => setNewPerson({ ...newPerson, nick: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>İsim Soyisim</Label>
                                    <Input
                                        value={newPerson.name}
                                        onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Telefon</Label>
                                    <Input
                                        value={newPerson.phone}
                                        onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Discord ID</Label>
                                    <Input
                                        value={newPerson.discord}
                                        onChange={(e) => setNewPerson({ ...newPerson, discord: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Telegram ID</Label>
                                    <Input
                                        value={newPerson.telegram}
                                        onChange={(e) => setNewPerson({ ...newPerson, telegram: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Kaydet</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Kişi Listesi</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nick</TableHead>
                                <TableHead>İsim</TableHead>
                                <TableHead>İletişim</TableHead>
                                <TableHead>Puan</TableHead>
                                <TableHead>İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5}>Yükleniyor...</TableCell></TableRow>
                            ) : users.length === 0 ? (
                                <TableRow><TableCell colSpan={5}>Kişi bulunamadı.</TableCell></TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.nick || "-"}</TableCell>
                                        <TableCell>{user.name || "-"}</TableCell>
                                        <TableCell>
                                            <div className="text-xs">
                                                {user.discord && <div>DC: {user.discord}</div>}
                                                {user.telegram && <div>TG: {user.telegram}</div>}
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.score || 0}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => {
                                                    setSelectedUser(user);
                                                    setIsRateOpen(true);
                                                    setRating([user.score || 5]);
                                                    setRatingNote("");
                                                }}>
                                                    <Star className="h-4 w-4 mr-1" /> Puan Ver
                                                </Button>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
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

            <Dialog open={isRateOpen} onOpenChange={setIsRateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Puan Ver: {selectedUser?.nick}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label>Puan: {rating[0]}</Label>
                            <Slider
                                min={1}
                                max={10}
                                step={1}
                                value={rating}
                                onValueChange={setRating}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Not (Opsiyonel)</Label>
                            <Textarea
                                value={ratingNote}
                                onChange={(e) => setRatingNote(e.target.value)}
                                placeholder="Puan nedeniniz..."
                            />
                        </div>
                        <Button onClick={handleRatePerson} className="w-full">Kaydet</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
