import { redirect } from "next/navigation"

export default function AdminRootRedirectPage() {
  // Automatically redirect from "/admin" to the actual applications route
  redirect("/admin/applications")
}
