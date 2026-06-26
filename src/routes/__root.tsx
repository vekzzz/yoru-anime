import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { lazy, Suspense } from 'react'

import appCss from '../styles.css?url'
import { SmoothScroll } from '../components/SmoothScroll'
import { Grain } from '../components/Grain'
import { CommandPalette } from '../components/CommandPalette'
import { TrailerModal } from '../components/TrailerModal'
import { PageTransition } from '../components/PageTransition'

const AgentDock = lazy(() =>
  import('../components/agent/AgentDock').then((m) => ({ default: m.AgentDock }))
)

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#08080b' },
      { title: 'YORU — Stream anime the night it airs' },
      {
        name: 'description',
        content:
          'YORU streams thousands of anime series, simulcast from Japan within the hour. Subbed, dubbed, and ready the moment you are.',
      },
      { property: 'og:title', content: 'YORU — night, on demand' },
      {
        property: 'og:description',
        content:
          'Simulcast anime from Japan, the night it airs. Subbed, dubbed, and ready the moment you are.',
      },
      { property: 'og:type', content: 'website' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Grain />
        <SmoothScroll><PageTransition>{children}</PageTransition></SmoothScroll>
        <CommandPalette />
        <TrailerModal />
        <Suspense fallback={null}><AgentDock /></Suspense>
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
