import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, '.', '')

	return {
		base: env.BASE_PATH || '/DataForge/',
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
	}
})
