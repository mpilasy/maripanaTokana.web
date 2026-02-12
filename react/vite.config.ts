import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'$lib': path.resolve(__dirname, '../src/lib'),
		},
	},
	esbuild: {
		tsconfigRaw: {
			compilerOptions: {
				jsx: 'react-jsx',
			},
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: () => 'app',
			},
		},
	},
});
