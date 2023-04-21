import type { IApi } from 'dumi/dist/types';
import { VueTechStack } from './vueTechStack';

export default (api: IApi) => {
  api.describe({
    key: 'dumi-plugin-vue3',
  });
  api.register({
    key: 'registerTechStack',
    stage: 0,
    fn: () => new VueTechStack(),
  });
};
