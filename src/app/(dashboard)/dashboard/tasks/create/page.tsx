"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Developer: Tolga Yılmaz
export default function CreateTaskPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form States
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<string | null>(null);
    const [selectedTier, setSelectedTier] = useState("");
    const [rewardAmount, setRewardAmount] = useState("");
    const [hasReward, setHasReward] = useState(false);
    const [duration, setDuration] = useState("");

    // Data Lists
    const [tiers, setTiers] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    // Multi-select States
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [targetType, setTargetType] = useState<"all" | "selected" | "top">("all");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [topUserCount, setTopUserCount] = useState(10);

    useEffect(() => {
        // Fetch initial data
        const fetchData = async () => {
            try {
                const [tiersRes, tagsRes, usersRes] = await Promise.all([
                    fetch("/api/tiers", { headers: { Authorization: token || "" } }),
                    fetch("/api/tags", { headers: { Authorization: token || "" } }),
                    fetch("/api/users", { headers: { Authorization: token || "" } }),
                ]);

                if (tiersRes.ok) setTiers(await tiersRes.json());
                if (tagsRes.ok) setTags(await tagsRes.json());
                if (usersRes.ok) setUsers(await usersRes.json());
            } catch (error) {
                console.error("Veri çekme hatası:", error);
            }
        };

        if (token) fetchData();
    }, [token]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                alert("Dosya boyutu 4MB'dan büyük olamaz!");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFile(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            subject,
            description,
            file,
            tierId: selectedTier,
            tagIds: selectedTags,
            target: {
                type: targetType,
                userIds: targetType === "selected" ? selectedUsers : [],
                topCount: targetType === "top" ? topUserCount : undefined,
            },
            reward: hasReward ? Number(rewardAmount) : 0,
            duration,
        };

        try {
            const res = await fetch("/api/task/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token || "",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Görev oluşturulamadı");

            alert("Görev başarıyla oluşturuldu!");
            router.push("/dashboard/tasks");
        } catch (error) {
            alert("Hata oluştu: " + error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Yeni Görev Başlat</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Görev Konusu</Label>
                            <Input
                                id="subject"
                                required
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Açıklama</Label>
                            <Textarea
                                id="description"
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file">Dosya (Görsel/Video - Max 4MB)</Label>
                            <Input
                                id="file"
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Katman Seçimi</Label>
                                <Select onValueChange={setSelectedTier} value={selectedTier}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Katman seçiniz" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tiers.map((t: any) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Etiketler</Label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {selectedTags.map(tagId => (
                                        <span key={tagId} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                            {tags.find(t => t.id === tagId)?.name || tagId}
                                            <button type="button" onClick={() => setSelectedTags(prev => prev.filter(p => p !== tagId))}>×</button>
                                        </span>
                                    ))}
                                </div>
                                <Select onValueChange={(val) => !selectedTags.includes(val) && setSelectedTags([...selectedTags, val])}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Etiket ekle..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tags.map((t: any) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4 border p-4 rounded-md">
                            <Label className="text-base">Hedef Kitle</Label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="targetType"
                                        checked={targetType === "all"}
                                        onChange={() => setTargetType("all")}
                                    />
                                    Herkese
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="targetType"
                                        checked={targetType === "selected"}
                                        onChange={() => setTargetType("selected")}
                                    />
                                    Kişi Seç
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="targetType"
                                        checked={targetType === "top"}
                                        onChange={() => setTargetType("top")}
                                    />
                                    En Yüksek Puanlılar
                                </label>
                            </div>

                            {targetType === "selected" && (
                                <div className="space-y-2">
                                    <Label>Kişiler</Label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {selectedUsers.map(uid => (
                                            <span key={uid} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                                {users.find(u => u.id === uid)?.name || uid}
                                                <button type="button" onClick={() => setSelectedUsers(prev => prev.filter(p => p !== uid))}>×</button>
                                            </span>
                                        ))}
                                    </div>
                                    <Select onValueChange={(val) => !selectedUsers.includes(val) && setSelectedUsers([...selectedUsers, val])}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Kişi seç..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((u: any) => (
                                                <SelectItem key={u.id} value={u.id}>
                                                    {u.name || u.email}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {targetType === "top" && (
                                <div className="space-y-2">
                                    <Label>İlk X Kişi: {topUserCount}</Label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={topUserCount}
                                        onChange={(e) => setTopUserCount(Number(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="hasReward"
                                        checked={hasReward}
                                        onChange={(e) => setHasReward(e.target.checked)}
                                    />
                                    <Label htmlFor="hasReward">Parasal Ödül Var mı?</Label>
                                </div>
                                {hasReward && (
                                    <Input
                                        type="number"
                                        placeholder="Miktar"
                                        value={rewardAmount}
                                        onChange={(e) => setRewardAmount(e.target.value)}
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Süre (Son Tarih)</Label>
                                <Input
                                    type="datetime-local"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Görevi Yayınla
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
