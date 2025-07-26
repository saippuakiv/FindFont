import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'src/content/main.ts',
        background: 'src/background.ts',
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Output background.js to root, content scripts to content/
          if (chunkInfo.name === 'background') return '[name].js';
          return 'content/[name].js';
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2017',
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'src/static/*', dest: 'static' },
        { src: 'src/styles/styles.css', dest: '.' },
        { src: 'src/manifest.json', dest: '.' },
      ],
    }),
  ],
});
