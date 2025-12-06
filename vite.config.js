import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  // server: {
  //   host: 'localhost',   // ← Force IPv4
  //   port: 5173,          // ← Ensure same port
  //   strictPort: true,    // ← Prevent random port changes
  // },
})
