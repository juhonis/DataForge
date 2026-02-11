import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
	],
	server: {
		host: true,
		port: 5173,
		watch: {
			usePolling: true,
		}
	},
	// This helps Vite find your TS files correctly
	resolve: {
		extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
	}
})