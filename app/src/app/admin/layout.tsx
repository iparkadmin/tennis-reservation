"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Calendar, CalendarDays, LogOut, Building2, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard },
    { href: "/admin/users", label: "ユーザー一覧", icon: Users },
    { href: "/admin/reservations", label: "予約一覧", icon: Calendar },
    { href: "/admin/calendar", label: "予約カレンダー", icon: CalendarDays },
    { href: "/admin/courts", label: "コート管理", icon: Building2 },
    { href: "/admin/audit-logs", label: "監査ログ", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-56 bg-primary text-on-primary flex flex-col border-r border-primary/20">
        <div className="p-4 border-b border-primary/20">
          <h1 className="font-bold text-lg">管理画面</h1>
          <p className="text-sm text-on-primary/80">テニスコート予約</p>
        </div>
        <nav className="flex-1 p-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-1 transition-colors ${
                  isActive ? "bg-primary-accent/30 text-white" : "hover:bg-primary/20 text-on-primary/90"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-primary/20">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-on-primary/90 hover:bg-primary/20 transition-colors text-sm"
          >
            サイトへ戻る
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-on-primary/90 hover:bg-primary/20 transition-colors w-full text-left text-sm"
          >
            <LogOut className="w-4 h-4" />
            ログアウト
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
