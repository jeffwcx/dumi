import { defineComponent, h, ref } from 'vue';
import { Button } from '../src/index';
import './demo.less';

export default defineComponent({
  setup() {
    const count = ref(0);
    const handleClick = () => {
      count.value++;
    };
    return () =>
      h(Button, { onClick: handleClick, text: `count: ${count.value}` });
  },
});
