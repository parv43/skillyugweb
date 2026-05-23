import type { Metadata } from "next";
import ParentPortalClient from "@/app/parent-portal/ParentPortalClient";
import { createMetadata, noIndexRobots } from "@/lib/seo";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Parent Portal - Skillyug",
    description: "Manage enrolled children and payments.",
    path: "/parent-portal",
    robots: noIndexRobots,
  }),
};

export default function ParentPortalPage() {
  return <ParentPortalClient />;
}
