import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			// 添加标签和分类支持
			tags: z.array(z.string()).optional(),
			categories: z.array(z.string()).optional(),
			// 添加其他Chirpy主题相关字段
			author: z.string().optional(),
			pin: z.boolean().optional(),
			math: z.boolean().optional(),
			mermaid: z.boolean().optional(),
		}),
});

export const collections = { blog };
