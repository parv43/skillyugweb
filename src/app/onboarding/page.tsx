import type { Metadata } from "next";
import OnboardingClient from "@/app/onboarding/OnboardingClient";
import { createMetadata, noIndexRobots } from "@/lib/seo";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Who Are You? - Skillyug",
    description: "Select your profile and onboard to the Skillyug AI Bootcamp.",
    path: "/onboarding",
    robots: noIndexRobots,
  }),
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
