// app/(user)/layout.tsx
import { auth } from "@/app/auth"
import UserNavbar from "@/components/UserNavbar"

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <div className="flex min-h-screen flex-col">
      <UserNavbar user={session?.user} />
      <main className="flex-1">{children}</main>
    </div>
  )
}