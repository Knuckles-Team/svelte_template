import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	server:{port:35729}
//	test: {
//		include: ['src/**/*.{test,spec}.{js,ts}']
//	}
};

export default config;
