"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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
import { Plus, Star, Edit, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

// Developer: Tolga Yılmaz
export default function PeoplePage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isRateOpen, setIsRateOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    // Form States
    const [newPerson, setNewPerson] = useState({
        nick: "",
        name: "",
        phone: "",
        discord: "",
        telegram: "",
        role: "user",
        managerId: "",
    });

    const [editPerson, setEditPerson] = useState({
        id: "",
        nick: "",
        name: "",
        phone: "",
        discord: "",
        telegram: "",
        role: "user",
        managerId: "",
    });

    const [rating, setRating] = useState([5]);
    const [ratingNote, setRatingNote] = useState("");

    const isAdmin = (session?.user as any)?.role === "admin";

    // derived list of potential managers (friends/managers)
    const managers = users.filter(u => u.role === "friend" || u.role === "manager");

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
        if (session) {
            fetchUsers();
        }
    }, [session]);

    const handleAddPerson = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/users/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPerson),
            });
            if (res.ok) {
                alert("Kişi eklendi!");
                setIsAddOpen(false);
                setNewPerson({
                    nick: "", name: "", phone: "", discord: "", telegram: "",
                    role: "user", managerId: ""
                });
                fetchUsers();
            } else {
                alert("Hata oluştu");
            }
        } catch (e) {
            alert("Hata: " + e);
        }
    };

    const handleEditPerson = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/users/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editPerson),
            });
            if (res.ok) {
                alert("Kişi güncellendi!");
                setIsEditOpen(false);
                fetchUsers();
            } else {
                alert("Hata oluştu");
            }
        } catch (e) {
            alert("Hata: " + e);
        }
    };

    const handleDeletePerson = async (userId: string) => {
        if (!confirm("Bu kişiyi silmek istediğinize emin misiniz?")) return;
        try {
            const res = await fetch("/api/users/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: userId }),
            });
            if (res.ok) {
                alert("Kişi silindi!");
                fetchUsers();
            } else {
                alert("Hata oluştu");
            }
        } catch (e) {
            alert("Hata: " + e);
        }
    };

    const openEditModal = (user: any) => {
        setEditPerson({
            id: user.id,
            nick: user.nick || "",
            name: user.name || "",
            phone: user.phone || "",
            discord: user.discord || "",
            telegram: user.telegram || "",
            role: user.role || "user",
            managerId: user.managerId || "",
        });
        setIsEditOpen(true);
    };

    const handleRatePerson = async () => {
        if (!selectedUser) return;
        try {
            const res = await fetch("/api/users/rate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    score: rating[0],
                    note: ratingNote,
                }),
            });
            if (res.ok) {
                alert("Puan verildi!");
                setIsRateOpen(false);
                fetchUsers(); // Refresh to update score in table
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

                            {isAdmin && (
                                <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-md">
                                    <div>
                                        <Label>Rol (Yetki)</Label>
                                        <Select
                                            value={newPerson.role}
                                            onValueChange={(val) => setNewPerson({ ...newPerson, role: val })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">User (Üye)</SelectItem>
                                                <SelectItem value="friend">Friend (Arkadaş/Manager)</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {newPerson.role === "user" && (
                                        <div>
                                            <Label>Bağlı Olduğu (Manager)</Label>
                                            <Select
                                                value={newPerson.managerId || "no_manager"}
                                                onValueChange={(val) => setNewPerson({ ...newPerson, managerId: val === "no_manager" ? "" : val })}
                                            >
                                                <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="no_manager">Yok (Admin)</SelectItem>
                                                    {managers.map(m => (
                                                        <SelectItem key={m.id} value={m.id}>{m.nick}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            )}

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

                            {(isAdmin || newPerson.role === "friend" || newPerson.role === "admin") && (
                                <div className="grid grid-cols-2 gap-4 bg-yellow-50 p-4 rounded-md border border-yellow-200">
                                    <div className="col-span-2 text-xs font-semibold text-yellow-800 mb-2">Login Bilgileri (Friend/Admin için gereklidir)</div>
                                    <div>
                                        <Label>Email (Giriş İçin)</Label>
                                        <Input
                                            type="email"
                                            value={(newPerson as any).email || ""}
                                            onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value } as any)}
                                            placeholder="ornek@piramit.com"
                                        />
                                    </div>
                                    <div>
                                        <Label>Şifre</Label>
                                        <Input
                                            type="password"
                                            value={(newPerson as any).password || ""}
                                            onChange={(e) => setNewPerson({ ...newPerson, password: e.target.value } as any)}
                                            placeholder="******"
                                        />
                                    </div>
                                </div>
                            )}

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
                                <TableHead>Rol</TableHead>
                                <TableHead>Manager (Friend)</TableHead>
                                <TableHead>İletişim</TableHead>
                                <TableHead>Puan</TableHead>
                                <TableHead>İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6}>Yükleniyor...</TableCell></TableRow>
                            ) : users.length === 0 ? (
                                <TableRow><TableCell colSpan={6}>Kişi bulunamadı.</TableCell></TableRow>
                            ) : (
                                users.map((user) => {
                                    const manager = users.find(u => u.id === user.managerId);
                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.nick || "-"}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                    user.role === 'friend' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {user.role?.toUpperCase()}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {manager ? manager.nick : "-"}
                                            </TableCell>
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
                                                    <Button variant="ghost" size="icon" onClick={() => openEditModal(user)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-100" onClick={() => handleDeletePerson(user.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Kişi Düzenle</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditPerson} className="space-y-4">
                        <div>
                            <Label>Nick (Zorunlu)</Label>
                            <Input
                                required
                                value={editPerson.nick}
                                onChange={(e) => setEditPerson({ ...editPerson, nick: e.target.value })}
                            />
                        </div>

                        {isAdmin && (
                            <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-md">
                                <div>
                                    <Label>Rol (Yetki)</Label>
                                    <Select
                                        value={editPerson.role}
                                        onValueChange={(val) => setEditPerson({ ...editPerson, role: val })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User (Üye)</SelectItem>
                                            <SelectItem value="friend">Friend (Arkadaş/Manager)</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {(editPerson.role === "user") && (
                                    <div>
                                        <Label>Bağlı Olduğu (Manager)</Label>
                                        <Select
                                            value={editPerson.managerId || "no_manager"}
                                            onValueChange={(val) => setEditPerson({ ...editPerson, managerId: val === "no_manager" ? "" : val })}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="no_manager">Yok (Admin)</SelectItem>
                                                {managers.filter(m => m.id !== editPerson.id).map(m => (
                                                    <SelectItem key={m.id} value={m.id}>{m.nick}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>İsim Soyisim</Label>
                                <Input
                                    value={editPerson.name}
                                    onChange={(e) => setEditPerson({ ...editPerson, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Telefon</Label>
                                <Input
                                    value={editPerson.phone}
                                    onChange={(e) => setEditPerson({ ...editPerson, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        {(isAdmin) && (
                            <div className="grid grid-cols-2 gap-4 bg-yellow-50 p-4 rounded-md border border-yellow-200">
                                <div className="col-span-2 text-xs font-semibold text-yellow-800 mb-2">Login Bilgileri Güncelleme</div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={(editPerson as any).email || ""}
                                        onChange={(e) => setEditPerson({ ...editPerson, email: e.target.value } as any)}
                                    />
                                </div>
                                <div>
                                    <Label>Yeni Şifre (Değişmeyecekse boş bırak)</Label>
                                    <Input
                                        type="password"
                                        value={(editPerson as any).password || ""}
                                        onChange={(e) => setEditPerson({ ...editPerson, password: e.target.value } as any)}
                                        placeholder="******"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Discord ID</Label>
                                <Input
                                    value={editPerson.discord}
                                    onChange={(e) => setEditPerson({ ...editPerson, discord: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Telegram ID</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={editPerson.telegram}
                                        onChange={(e) => setEditPerson({ ...editPerson, telegram: e.target.value })}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(`https://t.me/torypto_bot?start=${editPerson.id}`, '_blank')}
                                        title="Kullanıcıya bu linki göndererek veya tıklatarak otomatik eşleşmesini sağlayabilirsiniz."
                                    >
                                        🔗 Bağla
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <Button type="submit" className="w-full">Güncelle</Button>
                    </form>
                </DialogContent>
            </Dialog >

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
        </div >
    );
}
