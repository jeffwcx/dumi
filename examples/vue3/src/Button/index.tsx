import { defineComponent, h } from 'vue';
import './button.less';

export default defineComponent({
  props: {
    text: String,
  },
  setup(props) {
    return () => h('button', { class: 'btn' }, props.text);
  },
});
