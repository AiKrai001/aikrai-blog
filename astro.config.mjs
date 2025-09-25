// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://blog.aikrai.com',
	integrations: [
		expressiveCode({
			// Use light/dark themes that follow your [data-theme="dark"] attribute
			themes: ['min-light', 'min-dark'],
			removeUnusedThemes: true,
			themeCssSelector: (theme) =>
				theme.type === 'dark' ? '[data-theme="dark"]' : ':root',
			// Avoid 404 for /_astro/ec.*.css during dev; emit only in production
			emitExternalStylesheet: process.env.NODE_ENV === 'production',
			shiki: {
				// Ensure Dockerfile code fences are highlighted
				bundledLangs: ['dockerfile', 'yaml', 'toml', 'bash', 'nginx', 'json', 'kotlin', 'java'],
				langAlias: { Dockerfile: 'dockerfile', docker: 'dockerfile', yml: 'yaml', compose: 'yaml', toml: 'toml' },
			},
		}),
		mdx(),
		sitemap(),
	],
});
