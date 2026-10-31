
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

interface AdminSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

const navigation = [
  {
    title: "OVERVIEW",
    links: [
      { label: "Dashboard", href: "/admin", icon: "📊" },
    ],
  },
  {
    title: "RECRUITMENT",
    links: [
      { label: "Manage Jobs", href: "/admin/jobs", icon: "💼" },
      { label: "Applications", href: "/admin/applications", icon: "📋" },
      { label: "Candidates", href: "/admin/candidates", icon: "👥" },
    ],
  },
  {
    title: "ASSESSMENT",
    links: [
      {
        label: "Manual Assessment",
        href: "/admin/competency-test/manual-assessment",
        icon: "📝",
      },
      {
        label: "Online Tests",
        href: "/admin/competency-test",
        icon: "💻",
      },
    ],
  },
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="hidden md:flex min-h-screen w-64 shrink-0 flex-col justify-between border-r border-zinc-800 bg-zinc-950 px-4 py-6 text-zinc-400">
      <div className="space-y-9">
        {/* Brand */}
        <div className="px-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg shadow-lg shadow-blue-600/20">
              ⚡
            </div>

            <div>
              <h2 className="text-base font-bold tracking-wide text-white">
                Control Panel
              </h2>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                Admin Workspace
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-7">
          {navigation.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.15em] text-zinc-600">
                {section.title}
              </p>

              <div className="space-y-1">
                {section.links.map((item) => {
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        active
                          ? "border border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-sm"
                          : "border border-transparent text-zinc-400 hover:bg-zinc-800/70 hover:text-white"
                      }`}
                    >
                      <span className="text-base opacity-90">
                        {item.icon}
                      </span>

                      <span className="flex-1">{item.label}</span>

                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="space-y-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-blue-400">
              {(user?.name || "A").charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                {user?.name || "Admin User"}
              </p>
              <p className="truncate text-[11px] text-zinc-500">
                {user?.email || "Administrator"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
            <Link
              href="/jobs"
              className="text-xs font-medium text-zinc-400 transition-colors hover:text-white"
            >
              ← Live Site
            </Link>

            <LogoutButton className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-rose-400 transition-colors hover:bg-transparent hover:text-rose-300">
              Sign Out
            </LogoutButton>
          </div>
        </div>

        <p className="text-center text-[10px] text-zinc-600">
          Admin Workspace
        </p>
      </div>
    </aside>
  );
}
