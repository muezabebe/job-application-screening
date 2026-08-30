// app/(admin)/layout.tsx
import { auth } from "@/app/auth"
import { redirect } from "next/navigation"
import AdminSidebar from "@/components/AdminSidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/jobs")
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminSidebar user={session.user} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 bg-white overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}