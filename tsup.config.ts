import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "source/index.ts"
  ],
  outDir: "build",
  //clean: true,
  bundle: true,
  splitting: true,
  format: ['cjs'],
  platform: 'node',
  target: 'node18',
  sourcemap: true,
  dts: false,
  tsconfig: "tsconfig.json",
  minify: true,
  shims: true,
  async onSuccess() { }
});
