import AdminCommentDashboard from "@/components/comments/AdminCommentDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Comment Moderation | Skillyug",
  description: "Moderation dashboard for Skillyug blog comments",
};

export default function AdminCommentsPage() {
  return <AdminCommentDashboard />;
}
