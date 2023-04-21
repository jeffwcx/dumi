---
hero:
  title: library
  description: A vue libraray
  actions:
    - text: Hello
      link: /
    - text: World
      link: /
features:
  - title: Hello
    emoji: 💎
    description: Put hello description here
  - title: World
    emoji: 🌈
    description: Put world description here
  - title: '!'
    emoji: 🚀
    description: Put ! description here
---

```jsx | vue
export default {
  data() {
    return {
      greeting: 'Hello World!',
    };
  },
  render() {
    return <p class="greeting">{this.greeting}</p>;
  },
};
```
