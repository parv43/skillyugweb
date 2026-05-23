import type { Metadata } from "next";
import OnboardingResolveClient from "./OnboardingResolveClient";
import { createMetadata, noIndexRobots } from "@/lib/seo";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Resolving Onboarding - Skillyug",
    description: "Configuring your Skillyug profile...",
    path: "/onboarding/resolve",
    robots: noIndexRobots,
  }),
};

export default function OnboardingResolvePage() {
  return <OnboardingResolveClient />;
}
