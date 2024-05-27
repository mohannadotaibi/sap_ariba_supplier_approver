import type { ConfigEnv, UserConfig } from 'vite';

export function getBuildConfig(env: ConfigEnv<'build'>): UserConfig {
  const { root, mode, command } = env;

  return {
    root,
    mode,
    build: {
      emptyOutDir: false, // Prevent multiple builds from interfering with each other.
      outDir: '.vite/build',
      watch: command === 'serve' ? {} : null,
      minify: command === 'build',
    },
    clearScreen: false,
  };
}
