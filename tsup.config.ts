import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "source/index.ts"
  ],
  outDir: "build",
  //clean: true,
  bundle: true,
  splitting: true,
  format: ['cjs', 'esm'],
  platform: 'node',
  target: 'node18',
  sourcemap: true,
  dts: true,
  tsconfig: "tsconfig.json",
  minify: true,
  shims: true,
  async onSuccess() { }
});
