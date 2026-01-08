import { redirect } from "next/navigation";

// Developer: Tolga Yılmaz
export default function Home() {
    // Şimdilik direkt login'e yönlendiriyoruz
    redirect("/login");
}
