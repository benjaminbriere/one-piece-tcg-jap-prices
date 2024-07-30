import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/one-piece-tcg-jap-prices/",
  plugins: [svelte()],
})
