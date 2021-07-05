# Vue单侧

上章简单说了下 `Jest` 的基本使用、咋不能光说不练、看看在 `Vue` 中如何使用 `Jest` 来测试

## 环境

如何你是用 `Vue-cli` 生成模版创建时直接选择测试即可、如果不是、`vue-cli` 给我们提供了插件能力、直接执行 `vue add unit-jest`。 

插件会做以下几件事情：

- 安装依赖
  - vue-test-unit
  - vue-jest
  - 注入了新的命令
- vue-cli-server test:unit
  - any files in tests/unit that end in .spec.(js|jsx|ts|tsx)
  - any (js(x) | ts(x))files inside __tests__ directories
- vue-jest转换
  - 将vue SFC文件格式转换为对应的ts文件
  - 将ts通过presets/typescript-babel转换成对应的js文件

## 前置知识

- 渲染组件
  - `mount` 和 `shallowMount`
  - 传递属性
- 元素是否成功的显示
  - 查找元素不同的方法
  - get、getAll
  - find、findAll
  - findComponent、getComponent
- 触发事件
  - trigger
- 测试界面是否正确更新
  - dom更新是一个一步过程，在测试中使用asyn，await

## 挂载组件

首先 `mount` 和 `shallowMount` 的区别是什么？

用通俗的话来说、mount 会渲染所有的子组件、孙子组件、shallowMount 浅渲染、既不会渲染子组件，更不用提孙子辈的组件、会原原本本的显示子组件的存根、如 `<my-componet-stub></my-componet-stub>`

首先定义一个基础组件

```vue
<template>
  <p class="msg">{{ msg }}</p>
  <h1 class="number">{{ count }}</h1>
  <button @click="addCount" class="addCount">ADD</button>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "Test",
  props: {
    msg: String,
  },
  setup() {
    const count = ref<number>(0);
    const addCount = () => {
      count.value++;
    };
    return {
      count,
      addCount,
    };
  },
});
</script>
```

在 `tests` 目录下新建一个 `test.spec.ts` 文件、启动命令 `yarn test:unit --watch`、监听文件变化、编写一个基本 `case`

```ts
import { mount } from "@vue/test-utils";
import Test from "@/components/test.vue";

describe("HelloWorld.vue", () => {
  it("renders props.msg when passed", () => {
    const msg = "new message";
    const wrapper = mount(Test, {
      props: { msg },
    });    
    expect(wrapper.get(".msg").text()).toBe(msg);
  });
});
```

ok、看到终端顺利通过。

## 触发点击事件

现在我们要测试点击 `button` 后 `h1` 的 count 显示为 `1`

```ts
  it("test click", () => {
    wrapper.get(".addCount").trigger("click");
    expect(wrapper.get(".number").text()).toBe(1);
  });
```

发现终端出现了错误。

![trigger-click](/unitTest/trigger-click.png)

上面讲到、更新视图是一个异步操作、另外 `text` 文本显示应该是 字符串 `1`

```ts
  it("test click", async () => {
    await wrapper.get(".addCount").trigger("click");
    expect(wrapper.get(".number").text()).toBe("1");
  });
```

修改后、测试顺利通过。

