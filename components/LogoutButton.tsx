// components/LogoutButton.tsx
"use client"

import { signOut } from "next-auth/react"

interface LogoutButtonProps {
  className?: string
  redirectTo?: string
  children?: React.ReactNode
}

export default function LogoutButton({
  className,
  redirectTo = "/login",
  children = "Sign Out",
}: LogoutButtonProps) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: redirectTo })}
      className={
        className ||
        "px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-md transition-all"
      }
    >
      {children}
    </button>
  )
}