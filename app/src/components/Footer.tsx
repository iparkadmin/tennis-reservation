"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-4 px-4 text-left border-t border-outline/20 bg-surface/50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <p className="text-sm text-on-background/80">
          運営会社 iPark Institute Co., Ltd.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/privacy-policy"
            className="text-sm text-primary-accent hover:underline font-medium"
          >
            プライバシーポリシー
          </Link>
          <Link
            href="/admin"
            className="text-sm text-on-background/50 hover:text-on-background/70 hover:underline"
          >
            管理画面（運営者向け）
          </Link>
        </div>
      </div>
    </footer>
  );
}
