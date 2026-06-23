import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Nav } from '../components/Nav'
import { Hero } from '../components/Hero'
import { ContinueWatching } from '../components/ContinueWatching'
import { TrendingRail } from '../components/TrendingRail'
import { FeaturedShowcase } from '../components/FeaturedShowcase'
import { GenreBento } from '../components/GenreBento'
import { WhyYoru } from '../components/WhyYoru'
import { Testimonials } from '../components/Testimonials'
import { CtaBand } from '../components/CtaBand'
import { Footer } from '../components/Footer'
import { PullToRefresh } from '../components/PullToRefresh'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [refreshKey, setRefreshKey] = useState(0)

  // Pull-to-refresh reshuffles the trending rail so the gesture has real,
  // visible feedback (the static catalog has nothing to re-fetch).
  const onRefresh = async () => {
    await new Promise((r) => setTimeout(r, 650))
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="min-h-[100dvh] bg-night-950 font-sans text-zinc-100">
      <Nav />
      <PullToRefresh onRefresh={onRefresh}>
        <main>
          <Hero />
          <ContinueWatching />
          <TrendingRail refreshKey={refreshKey} />
          <FeaturedShowcase />
          <GenreBento />
          <WhyYoru />
          <Testimonials />
          <CtaBand />
        </main>
      </PullToRefresh>
      <Footer />
    </div>
  )
}
