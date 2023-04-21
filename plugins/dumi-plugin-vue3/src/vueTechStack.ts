import { transformSync } from '@babel/core';
import type { IDumiTechStack } from 'dumi/dist/types';

export class VueTechStack implements IDumiTechStack {
  name = 'vue3';

  isSupported(...[node, lang]: Parameters<IDumiTechStack['isSupported']>) {
    return (
      / vue/.test(String(node.data?.meta)) && ['jsx', 'tsx'].includes(lang)
    );
  }

  transformCode(...[raw, opts]: Parameters<IDumiTechStack['transformCode']>) {
    if (opts.type === 'code-block') {
      const result = transformSync(raw, {
        filename: opts.fileAbsPath,
        plugins: [['@vue/babel-plugin-jsx', { pragma: 'h' }]],
      });
      // TODO: use babel plugin to get default component
      const vueComponentStr = (result?.code || '').replace(
        'export default ',
        '',
      );
      return `React.lazy(async () => {
        const { h, createApp } = await import('vue');
        const vueComponent = ${vueComponentStr};
        const vueDemo = createApp(vueComponent);
        vueDemo.config.errorHandle = (e) => {
          throw e;
        };
        return {
          default: () => {
            const demoRef = React.useRef();
            React.useEffect(() => {
              if (!demoRef.current) {
                return () => {};
              }
              const element = demoRef.current;
              vueDemo.mount(element);
              return () => {
                vueDemo.unmount();
              };
            }, []);
            return <div><span ref={demoRef}></span></div>;
          }
        };

      })`;
    }
    return raw;
  }
}
