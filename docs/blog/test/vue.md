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

## 测试高级技巧

我们需要测试如下一个组件、当 `store` 里面当 **user.isLogin** 为 `false` 时显示登录按钮、点击 `a-button` 改变 `store` 里面的登录状态、显示出登出按钮、点击登录触发改变状态并触发 `router.push`

::: details 点击查看代码

```vue
<template>
  <a-button
    type="primary"
    v-if="!user.isLogin"
    class="user-profile-component"
    @click="login"
  >
    登录
  </a-button>
  <div v-else>
    <a-dropdown-button class="user-profile-component">
      <router-link to="/setting">{{ user.userName }}</router-link>
      <template v-slot:overlay>
        <a-menu class="user-profile-dropdown">
          <a-menu-item key="0" @click="logout">登出</a-menu-item>
        </a-menu>
      </template>
    </a-dropdown-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { UserProps } from "../store/user";

export default defineComponent({
  name: "user-profile",
  props: {
    user: {
      type: Object as PropType<UserProps>,
      required: true,
    },
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const login = () => {
      store.commit("login");
      message.success("登录成功", 2);
    };
    const logout = () => {
      store.commit("logout");
      message.success("退出登录成功，2秒后跳转到首页", 2);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    };
    return {
      login,
      logout,
    };
  },
});
</script>
<style>
.user-profile-dropdown {
  border-radius: 2px !important;
}
.user-operation > * {
  margin-left: 30px !important;
}
</style>
```

:::

我们要实现 `mock` 全局组件、模拟第三方库的实现，使用了 `ant-design-vue` 里面的组件、并且使用了 `vue-router`、`vuex` 等库。首先需要进行 `mock`

```js
jest.mock("ant-design-vue");
jest.mock("vue-router");
jest.mock("vuex");
```

## 全局组件

编写第一个用例、当 `isLogin` 为 `false` 时显示登录按钮

```ts
describe("UserProfile component", () => {
  beforeAll(() => {
    wrapper = mount(UserProfile, {
      props: {
        user: { isLogin: false },
      },
    });
  });
  it("should render login button when login is flase", () => {
    console.log(wrapper.html());
  });
});
```

终端提示 `Failed to resolve component`、我们需要模拟一些全局组件

```ts
const mockComponent = {
  template: "<div><slot></slot></div>",
};
const globalComponents = {
  "a-button": mockComponent,
  "a-dropdown-button": mockComponent,
  "router-link": mockComponent,
  "a-menu": mockComponent,
  "a-menu-item": mockComponent,
};
```

添加全局组件

```ts
wrapper = mount(UserProfile, {
  // ...
  global: {
    components: globalComponents,
  },
});
```

调整用例

```ts
it("should render login button when login is flase", () => {
  console.log(wrapper.html());
  expect(wrapper.get("div").text()).toBe("登录");
});
```

顺利通过。下面通过改变 `store` 值、展示登出

```ts
it("should render username when login is true", async () => {
  await wrapper.setProps({
    user: {
      isLogin: true,
      userName: "凹凸曼",
    },
  });
  console.log(wrapper.html());
});
```

打印发现没有 登出字段。发现是因为登出在 `template v-slot:overlay` 里面、需要自定义一下 `a-dropdown-button`

```ts
const mockComponent2 = {
    template: '<div><slot></slot><slot name="overlay"></slot></div>'
    'a-dropdown-button': mockComponent2,
}
```

再次打印 发现有了、补充下显示 `userName` 和 登出的 case

```ts
expect(wrapper.get(".user-profile-component").html()).toContain("凹凸曼");
expect(wrapper.find(".user-profile-dropdown").exists()).toBeTruthy();
```

## mock 行为

- ant-design-vue message.success()
- vuex useStore().commit
- vue-router useRouter().push

先来测试点击触发 `message.success`、先注释 `store.commit("login")`，我们可以继续 mock `ant-design-vue`

```ts
jest.mock("ant-design-vue", () => ({
  message: {
    success: jest.fn(),
  },
}));
```

在定义引入 `import { message } from "ant-design-vue"`

::: warning 注意
虽然在顶部引入 `message`，但是被 jest.mock 后只会走我们自定义的、修改 case 点击后触发 `message.success`方法
:::

```ts
it("should render login button when login is flase", async () => {
  expect(wrapper.get("div").text()).toBe("登录");
  await wrapper.get("div").trigger("click");
  expect(message.success).toHaveBeenCalled();
});
```

## 注入全局 store

现在我们换一种方式来解决全局 `mock`

- 移除 jest.mock("vuex")
- 首先引入真实的 store
- 挂在到全局属性上

```ts
import store from "@/store";
wrapper = mount(UserProfile, {
  global: {
    components: globalComponents,
    provide: {
      store,
    },
  },
});
```

来测试 `store` 里面的 `userName` 是否正确显示

```ts
expect(store.state.user.userName).toBe("凹凸曼");
```

## mock 半真半假

上面演示了 mock 全局组件、也演示了 使用真实 `store`，下面我们来使用一种半真半假来测试 `useRouter().push` 行为

编写一个 点击登出后、触发 `message.success` 提示、2s 后路由跳转的 case

```ts
it("should call logout and show message, call router.push after timeout", async () => {
  await wrapper.get(".user-profile-dropdown div").trigger("click");
  expect(store.state.user.isLogin).toBeFalsy();
  expect(message.success).toHaveBeenCalledTimes(1);
  jest.runAllTimers();
  expect(mockedRoutes).toEqual(["/"]);
});
```

这里用到了之前的 `jest.useFakeTimers()` 和 `jest.runAllTimers()`，不过运行出现错误、提示我们 `toHaveBeenCalledTimes` 被调用了两次，是因为我们在之前 call 了一次，我们可以使用之前的 `afterEach` 来重置下

```ts
afterEach(() => {
  (message as jest.Mocked<typeof message>).success.mockReset();
});
```

再次运行、顺利通过 😊
