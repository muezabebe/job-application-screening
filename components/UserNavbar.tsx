// components/UserNavbar.tsx
import Link from "next/link"
import LogoutButton from "@/components/LogoutButton"

interface UserNavbarProps {
  user?: {
    name?: string | null
    email?: string | null
    role?: string | null
  } | null
}

export default function UserNavbar({ user }: UserNavbarProps) {
  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/jobs" className="text-xl font-bold tracking-tight text-blue-600">
            💼 JobTracker
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-zinc-600">
            <Link href="/jobs" className="hover:text-zinc-900 transition-colors">
              Explore Careers
            </Link>
            {user && (
              <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">
                My Applications
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Show Recruiter Switcher for ADMIN users */}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-md px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 transition-all hidden sm:inline-block"
            >
              Switch to Recruiter Portal →
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-zinc-200">
              <span className="text-xs text-zinc-600 font-medium hidden sm:inline-block">
                {user.name || user.email}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 px-3 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md px-3 py-1.5 transition-all shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}