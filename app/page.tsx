"use client"

import { useState } from "react"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { DashboardView } from "@/components/dashboard-view"

export default function HomePage() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false)
  const [userProfile, setUserProfile] = useState(null)

  const handleOnboardingComplete = (profile: any) => {
    setUserProfile(profile)
    setIsOnboardingComplete(true)
  }

  if (!isOnboardingComplete) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  return <DashboardView userProfile={userProfile} />
}
