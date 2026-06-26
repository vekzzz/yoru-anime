import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    // Order matters: tanstackStart() must come before nitro(), and react() last.
    tanstackStart(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    viteReact(),
  ],
})

export default config
