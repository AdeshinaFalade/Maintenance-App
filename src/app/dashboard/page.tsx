import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRouter() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any)?.role;

  if (role === "ADMIN") {
    redirect("/dashboard/admin");
  } else if (role === "MAINTENANCE") {
    redirect("/dashboard/maintenance");
  } else {
    // Default for STUDENT and STAFF
    redirect("/dashboard/student");
  }
}
