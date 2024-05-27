import { builtinModules } from 'node:module';
import pkg from '../package.json';
import { getBuildConfig, getBuildDefine, getDefineKeys, pluginExposeRenderer, pluginHotRestart } from './utils';

export const builtins: string[] = ['electron', ...builtinModules.map((m) => [m, `node:${m}`]).flat()];

export const external: string[] = [
  ...builtins,
  ...Object.keys('dependencies' in pkg ? (pkg.dependencies as Record<string, unknown>) : {}),
];

export { getBuildConfig, getBuildDefine, getDefineKeys, pluginExposeRenderer, pluginHotRestart };
