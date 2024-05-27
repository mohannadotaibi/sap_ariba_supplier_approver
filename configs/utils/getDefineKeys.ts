export function getDefineKeys(names: string[]): Record<string, VitePluginRuntimeKeys> {
    const define: Record<string, VitePluginRuntimeKeys> = {};
  
    return names.reduce((acc, name) => {
      const NAME = name.toUpperCase();
      const keys: VitePluginRuntimeKeys = {
        VITE_DEV_SERVER_URL: `${NAME}_VITE_DEV_SERVER_URL`,
        VITE_NAME: `${NAME}_VITE_NAME`,
      };
  
      return { ...acc, [name]: keys };
    }, define);
  }
  