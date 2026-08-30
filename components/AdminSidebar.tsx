// components/AdminSidebar.tsx
import Link from "next/link"
import LogoutButton from "@/components/LogoutButton"

interface AdminSidebarProps {
  user?: {
    name?: string | null
    email?: string | null
  } | null
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-900 text-zinc-400 p-6 flex flex-col justify-between hidden md:flex shrink-0 min-h-screen">
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-white text-lg font-bold tracking-wide">Control Panel</h2>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Admin Workspace</span>
        </div>

        <nav className="flex flex-col gap-1 text-sm font-medium">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors"
          >
            <span>📊</span> Super Dashboard
          </Link>

          <Link
            href="/admin/jobs"
            className="flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors"
          >
            <span>💼</span> Manage Jobs
          </Link>
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="pt-6 border-t border-zinc-800/80 flex flex-col gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-zinc-200 truncate">{user?.name || "Admin User"}</span>
          <span className="text-[11px] text-zinc-500 truncate">{user?.email}</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <Link
            href="/jobs"
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1 font-medium"
          >
            ← Live Site
          </Link>

          <LogoutButton className="text-xs text-rose-400 hover:text-rose-300 transition-colors font-semibold border-none p-0 bg-transparent hover:bg-transparent cursor-pointer">
            Sign Out
          </LogoutButton>
        </div>
      </div>
    </aside>
  )
}