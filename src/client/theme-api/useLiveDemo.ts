import { useDemo } from 'dumi';
import throttle from 'lodash.throttle';
import {
  createElement,
  useCallback,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import DemoErrorBoundary from './DumiDemo/DemoErrorBoundary';

const THROTTLE_WAIT = 500;

export const useLiveDemo = (id: string) => {
  const { context, asset, renderOpts } = useDemo(id)!;
  const [loading, setLoading] = useState(false);
  const loadingTimer = useRef<number>();
  const [demoNode, setDemoNode] = useState<ReactNode>();
  const [error, setError] = useState<Error | null>(null);
  const setSource = useCallback(
    throttle(
      async (source: Record<string, string>) => {
        // set loading status if still compiling after 499ms
        loadingTimer.current = window.setTimeout(
          () => {
            setLoading(true);
          },
          // make sure timer be fired before next throttle
          THROTTLE_WAIT - 1,
        );

        const entryFileName = Object.keys(asset.dependencies).find(
          (k) => asset.dependencies[k].type === 'FILE',
        )!;
        const require = (v: string) => {
          if (v in context!) return context![v];
          throw new Error(`Cannot find module: ${v}`);
        };
        const exports: { default?: ComponentType } = {};
        const module = { exports };
        let entryFileCode = source[entryFileName];

        try {
          // load renderToStaticMarkup in async way
          const renderToStaticMarkupDeferred = import('react-dom/server').then(
            ({ renderToStaticMarkup }) => renderToStaticMarkup,
          );

          // compile entry file code
          entryFileCode = await renderOpts!.compile!(entryFileCode, {
            filename: entryFileName,
          });

          // initial component with fake runtime
          new Function('module', 'exports', 'require', entryFileCode)(
            module,
            exports,
            require,
          );

          const newDemoNode = createElement(
            DemoErrorBoundary,
            null,
            createElement(exports.default!),
          );
          const oError = console.error;

          // hijack console.error to avoid useLayoutEffect error
          console.error = (...args) =>
            !args[0].includes('useLayoutEffect does nothing on the server') &&
            oError.apply(console, args);

          // check component is able to render, to avoid show react overlay error
          (await renderToStaticMarkupDeferred)(newDemoNode);
          console.error = oError;

          // set new demo node with passing source
          setDemoNode(newDemoNode);
          setError(null);
        } catch (err: any) {
          setError(err);
        }

        // reset loading status
        clearTimeout(loadingTimer.current);
        setLoading(false);
      },
      THROTTLE_WAIT,
      { leading: true },
    ) as (source: Record<string, string>) => Promise<void>,
    [context],
  );

  return { node: demoNode, loading, error, setSource };
};