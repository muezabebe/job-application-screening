import { redirect } from "next/navigation"

export default function RootHomePage() {
  // Automatically redirect users landing on the base URL "/" straight to the careers page
  redirect("/jobs")
}
