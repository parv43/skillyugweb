import AdminDashboardClient from "@/app/admin/AdminDashboardClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Batch Admin Console | Skillyug",
  description: "Cohort and student management console for Skillyug administrators",
};

export default function AdminPage() {
  return <AdminDashboardClient />;
}

