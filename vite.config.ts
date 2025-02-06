import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";

export default defineConfig({
	resolve: {
		alias: {
			"@/": "/src/",
		},
	},
	plugins: [tsconfigPaths()],
	esbuild: {
		jsx: "transform",
		jsxDev: false,
		jsxImportSource: "@/react/jsx-runtime",
		jsxInject: 'import { createElement } from "@/react/jsx-runtime"',
		jsxFactory: "createElement",
	},
});
