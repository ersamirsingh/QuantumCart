// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // ✅ Correct ESM export syntax
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss()
  ],
});