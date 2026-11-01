
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Check authentication.
  if (!session?.user?.id) {
    redirect("/jobs");
  }

  // Verify current account details from the database.
  const admin = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  // Check current role and account status.
  if (
    !admin ||
    admin.role !== "ADMIN" ||
    admin.status !== "ACTIVE"
  ) {
    redirect("/jobs");
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminSidebar user={session.user} />

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
