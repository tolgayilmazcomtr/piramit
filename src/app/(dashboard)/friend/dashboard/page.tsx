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
import { Check, X } from "lucide-react";

// Developer: Tolga Yılmaz
export default function FriendDashboard() {
    const { token } = useAuth();
    const [approvals, setApprovals] = useState<any[]>([]);
    const [verifications, setVerifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [appRes, verRes] = await Promise.all([
                fetch("/api/approvals/pending", { headers: { Authorization: token || "" } }),
                fetch("/api/verifications/pending", { headers: { Authorization: token || "" } }),
            ]);

            if (appRes.ok) setApprovals((await appRes.json()) || []);
            if (verRes.ok) setVerifications((await verRes.json()) || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const handleAction = async (id: string, type: "approval" | "verification", action: "approve" | "reject") => {
        try {
            const res = await fetch("/api/approval/action", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token || "",
                },
                body: JSON.stringify({ id, type, action }),
            });

            if (res.ok) {
                alert("İşlem başarılı!");
                fetchData();
            } else {
                alert("Hata oluştu");
            }
        } catch (e) {
            alert("Hata: " + e);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Onay Paneli</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Onay Bekleyen İşler</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Konu</TableHead>
                                <TableHead>Kişi</TableHead>
                                <TableHead>Tarih</TableHead>
                                <TableHead>İşlem</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4}>Yükleniyor...</TableCell></TableRow>
                            ) : approvals.length === 0 ? (
                                <TableRow><TableCell colSpan={4}>Bekleyen onay yok.</TableCell></TableRow>
                            ) : (
                                approvals.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.subject}</TableCell>
                                        <TableCell>{item.user?.name}</TableCell>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleAction(item.id, "approval", "approve")}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleAction(item.id, "approval", "reject")}
                                                >
                                                    <X className="h-4 w-4" />
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

            <Card>
                <CardHeader>
                    <CardTitle>Doğrulama Bekleyenler</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Konu</TableHead>
                                <TableHead>Kişi</TableHead>
                                <TableHead>Kanıt</TableHead>
                                <TableHead>İşlem</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4}>Yükleniyor...</TableCell></TableRow>
                            ) : verifications.length === 0 ? (
                                <TableRow><TableCell colSpan={4}>Bekleyen doğrulama yok.</TableCell></TableRow>
                            ) : (
                                verifications.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.subject}</TableCell>
                                        <TableCell>{item.user?.name}</TableCell>
                                        <TableCell>
                                            {item.proofUrl && (
                                                <a href={item.proofUrl} target="_blank" className="text-blue-500 underline">Göster</a>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleAction(item.id, "verification", "approve")}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleAction(item.id, "verification", "reject")}
                                                >
                                                    <X className="h-4 w-4" />
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
        </div>
    );
}
