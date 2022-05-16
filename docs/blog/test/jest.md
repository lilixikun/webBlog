# Jest

## Jest 简介

### 通用测试框架

- [Mocha](https://mochajs.org/)
- [Jasmine](https://jasmine.github.io/)
- [**Jest**](https://jestjs.io/)

### 测试框架的几大功能

- 断言
  - Jest 内置
  - Mocha 需要安装[Chai](https://www.chaijs.com/) 或者其他断言库
- 异步支持
  - Jest 内置
  - Mocha 需要安装[Sinon](https://sinonjs.org/)
- 代码覆盖率
  - Jest 内置
  - Mocha 需要安装[istanbul](https://istanbul.js.org/)

### Jest 特点

开箱即用、**零**配置、快、内置代码覆盖率、Mocking 很容易

## Jest 基本使用

全局安装 `Jest`、或者项目内安装、先来一个小🌰。新建一个 `sum.js`

```js
function sum(a, b) {
    return a + b
}
module.exports = sum;
```

编写一个测试用例 `sum.spec.js`

```js
const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
});
```

添加 `"test": "npx jest"` 脚本并运行、看到终端绿色的PASS说明顺利通过。ok、接下来让我们再看看别的方法、来验证不同的东西

```js
test("two plus two is four", () => {
    expect(2 + 2).toBe(4);
});

test('object assignment', () => {
    const data = { one: 1, two: 2 };
    expect(data).toEqual({ one: 1, two: 2 });
});

test("true or false", () => {
    expect(1).toBeTruthy()
    expect(0).toBeFalsy()
})

test('two plus two', () => {
    const value = 2 + 2;
    expect(value).toBeGreaterThan(3);
    expect(value).toBeGreaterThanOrEqual(3.5);
    expect(value).toBeLessThan(5);
    expect(value).toBeLessThanOrEqual(4.5);

    // toBe and toEqual are equivalent for numbers
    expect(value).toBe(4);
    expect(value).toEqual(4);
});
```

更多的方法可以查看[expect](https://jestjs.io/zh-Hans/docs/expect)

## 异步测试

异步通过就是回调 `callback` 和 `promise` 两种，先来看下 `callback`

```js
const featchUser = (cb) => {
    setTimeout(() => {
        cb("dewu")
    }, 100);
}

test("test callback", () => {
    featchUser((data) => {
        expect(data).toBe("dewu")
    })
})
```

运行 `Jest` 发现顺利通过了、但是一看时间不对、明明延迟了 `100` 可是终端只有 `1` 毫秒，这个时候需要用到 `Jest` 提供给我们的 `done` 方法，如下：

```js
test("test callback", (done) => {
    featchUser((data) => {
        expect(data).toBe("dewu")
        done()
    })
})
```

再次运行、正常了 😌

再看下 `Promise` 的用法

```js
const userPromise = () => Promise.resolve("dewu")
test("test with async", async () => {
    const data = await userPromise()
    expect(data).toBe("dewu")
})

test("test with expect", () => {
    return expect(userPromise()).resolves.toBe("dewu")
})

const rejectPromise = () => Promise.reject("error")
test("test with reject", () => {
    return expect(rejectPromise()).rejects.toBe("error")
})
```

## Mock功能

在单元测试中、我们一般对最小单元进行测试、不会去关心业务/模块之间的耦合情况、只需要知道是否被调用即可。因此会使用 `mock` 来模拟、**fn** 是 `Jest` 最简单的 `mock` 函数

```js
function mockTest(call, cb) {
    if (call) {
        return cb(22)
    }
}

it("test with mock function", () => {
    const mockCb = jest.fn()
    mockTest(true, mockCb)
    // 是否被调用
    expect(mockCb).toHaveBeenCalled()
    // 被什么值调用
    expect(mockCb).toHaveBeenCalledWith(22)
    // 被调用次数
    expect(mockCb).toHaveBeenCalledTimes(1)
})
```

上面演示了如何模拟一个 `Mock` 函数、我们就需要关心是否被调用、不必在乎它内部的实现

那么、`Mock` 如何返回一个值呢

```js
test("test with mockReturnValue", () => {
    let mockResult = jest.fn().mockReturnValue("dewu");
    let result = mockResult();
    expect(result).toBe("dewu");
});

test("test with fn", () => {
    let mockResult = jest.fn((str) => str);
    expect(mockResult("dewu")).toBe("dewu");
});
```

**替换第三方模块**

有时候我的模块依赖第三方库或者模块、我们可以用 `Jest` 来实现 "狸猫换太子"，如下🌰

`getUserName()` 是一个应用于 `axios` 发生请求的方法、最终我们要测试返回是否正确，`Jest` 给我们提供的对应的方法

```js
jest.mock("axios")
axios.get.mockImplementation(() => {
    return Promise.resolve("aotuman")
})

it("test with request", async () => {
    const name = await getUserName(1)
    expect(name).toBe("aotuman")
    expect(axios.get).toHaveBeenCalled()
    expect(axios.get).toHaveBeenCalledTimes(1)
})
```

运行测试通过、也可以写成上面的返回方式

```js
jest.mock("axios")

axios.get.mockReturnValue(Promise.resolve("aotuman"))
axios.get.mockResolvedValue(Promise.resolve("aotuman"))
```

`Jest` 提供了一种更简单的方案、可以在目录下新建 `__mocks__` 目录、新建 `axios.js`

```js
const axios = {
    get: jest.fn(() => Promise.resolve("aotuman"))
}
module.exports = axios
```

再次运行、发现也是正常通过测试

## Timers

原生定时器功能(即setTimeout，setInterval，clearTimeout，clearInterval)对于测试环境来说不太理想，因为它们依赖于实时时间。`Jest` 可以将定时器换成允许我们自己控制时间的功能。

**运行所有计时器(Run All Timers)**

```js
const featchUser = (cb) => {
    setTimeout(() => {
        cb("aotuman")
    }, 1000);
}

it("test the callback after 1 sec", () => {
    const callback = jest.fn()
    featchUser(callback)
    expect(callback).not.toHaveBeenCalled()
    // “快进”时间使得所有定时器回调被执行
    jest.runAllTimers()
    expect(callback).toHaveBeenCalled()
    expect(callback).toHaveBeenCalledWith("aotuman")
})
```

**运行待定时间器 RunOnlyPendingTimers**

```js
const loopFeatchUser = (cb) => {
    setTimeout(() => {
        cb("one")
        setTimeout(() => {
            cb("two")
        }, 2000);
    }, 1000);
}

it("test the callback after 1 sec", () => {
    const callback = jest.fn()
    loopFeatchUser(callback)
    expect(callback).not.toHaveBeenCalled()
    // “快进”时间使得所有定时器回调被执行
    jest.runOnlyPendingTimers()
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith("one")
    jest.runOnlyPendingTimers()
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith("two")
})
```

更多方法查看[Jest](https://jestjs.io/docs/jest-object#jestrunalltimers)