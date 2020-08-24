# ReactChildren
ReactChildren 对外暴露了以下 几个方法 

```jsx
export {
    forEachChildren as forEach,
    mapChildren as map,
    countChildren as count,
    onlyChild as only,
    toArray,
  };
```

我们就拿 **mapChildren** 简单做下分析看看,首先方法如下:

## mapChildren

```js
function mapChildren(children, func, context) {
  if (children == null) {
    return children;
  }
  const result = [];
  mapIntoWithKeyPrefixInternal(children, result, null, func, context);
  return result;
}
```

接下来 来看 **mapIntoWithKeyPrefixInternal**

```js
function mapIntoWithKeyPrefixInternal(children, array, prefix, func, context) {
  let escapedPrefix = '';
  if (prefix != null) {
    escapedPrefix = escapeUserProvidedKey(prefix) + '/';
  }
  const traverseContext = getPooledTraverseContext(
    array,
    escapedPrefix,
    func,
    context,
  );
  // 将嵌套的数组展平
  traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);
  releaseTraverseContext(traverseContext);
}
```

**getPooledTraverseContext**

```js
const POOL_SIZE = 10;
const traverseContextPool = [];
// 维护一个对象最大为10的池子，从这个池子取到对象去赋值，用完了清空， 防止内存抖动
// 可以循环使用，创建太多的话，也会占据内存
function getPooledTraverseContext(
  mapResult,
  keyPrefix,
  mapFunction,
  mapContext,
) {
  if (traverseContextPool.length) {
    const traverseContext = traverseContextPool.pop();
    traverseContext.result = mapResult;
    traverseContext.keyPrefix = keyPrefix;
    traverseContext.func = mapFunction;
    traverseContext.context = mapContext;
    traverseContext.count = 0;
    return traverseContext;
  } else {
    return {
      result: mapResult,
      keyPrefix: keyPrefix,
      func: mapFunction,
      context: mapContext,
      count: 0,
    };
  }
}
```
getPooledTraverseContext 就是从 pool 里面找一个对象，releaseTraverseContext 会把当前的context对象清空然后放回到pool中。

**releaseTraverseContext**

```js
function releaseTraverseContext(traverseContext) {
  if (traverseContextPool.length < POOL_SIZE) {
    traverseContextPool.push(traverseContext);
  }
}
```

releaseTraverseContext 的作用就是会把当前的 context 对象清空然后放回到pool中。

从这两个方法来看感觉 **traverseContextPool** 永远都是只有一个值,因为每次都是先 pop 完再 push 进去,那么为什么还要 定义**POOL_SIZE** 为 **10**呢

那让我们来看看 **traverseAllChildren**

```js
function traverseAllChildren(children, callback, traverseContext) {
  if (children == null) {
    return 0;
  }

  return traverseAllChildrenImpl(children, '', callback, traverseContext);
}
```


**traverseAllChildren** 就做了一次简单判断,然后就去调用自己的实现方法(不知道代码是不是后台老哥写的😭),**traverseAllChildrenImpl** 就流程就比较长一点了

```js
function traverseAllChildrenImpl(
  children,
  nameSoFar,
  callback,
  traverseContext,
) {
  const type = typeof children;

  if (type === 'undefined' || type === 'boolean') {
    // All of the above are perceived as null.
    children = null;
  }
  // invokeCallback=true,才触发callBack执行
  let invokeCallback = false;

  if (children === null) {
    invokeCallback = true;
  } else {
    switch (type) {
      case 'string':
      case 'number':
        invokeCallback = true;
        break;
      case 'object':
        switch (children.$$typeof) {
          //如果props.children是单个ReactElement/PortalElement的话 必会触发invokeCallback=true
          case REACT_ELEMENT_TYPE:
          case REACT_PORTAL_TYPE:
            invokeCallback = true;
        }
    }
  }
  // 处理非数组的情况
  if (invokeCallback) {
    callback(
      traverseContext,
      children,
      // If it's the only child, treat the name as if it was wrapped in an array
      // so that it's consistent if the number of children grows.
      nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar,
    );
    return 1;
  }

  let child;
  let nextName;
  let subtreeCount = 0; // Count of children found in the current subtree.
  const nextNamePrefix =
    nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      child = children[i];
      nextName = nextNamePrefix + getComponentKey(child, i);
      // 是数组就递归执行
      subtreeCount += traverseAllChildrenImpl(
        child,
        nextName,
        callback,
        traverseContext,
      );
    }
  } else {
    // 迭代器处理
    const iteratorFn = getIteratorFn(children);
    if (typeof iteratorFn === 'function') {
      if (disableMapsAsChildren) {
        invariant(
          iteratorFn !== children.entries,
          'Maps are not valid as a React child (found: %s). Consider converting ' +
          'children to an array of keyed ReactElements instead.',
          children,
        );
      }

      const iterator = iteratorFn.call(children);
      let step;
      let ii = 0;
      while (!(step = iterator.next()).done) {
        child = step.value;
        nextName = nextNamePrefix + getComponentKey(child, ii++);
        // 遍历
        subtreeCount += traverseAllChildrenImpl(
          child,
          nextName,
          callback,
          traverseContext,
        );
      }
    } else if (type === 'object') {
      let addendum = ''
      const childrenString = '' + children;
      // 类型判断不正确 抛出错误
      invariant(
        false,
        'Objects are not valid as a React child (found: %s).%s',
        childrenString === '[object Object]'
          ? 'object with keys {' + Object.keys(children).join(', ') + '}'
          : childrenString,
        addendum,
      );
    }
  }

  return subtreeCount;
}
```

> child 数据不能是一个 object 对象

上来对传来的 **children** 做了检测, 如果是 **数组** 或者 **迭代器** 就继续递归自己, **traverseContext** 里面包含着以下属性

      result: mapResult,
      keyPrefix: keyPrefix,
      func: mapFunction,
      context: mapContext,
      count: 0,

重点是  **invokeCallback** 为 **true** 的时候 执行 callback, 也就是传入的 **mapSingleChildIntoContext** 方法   

```js
function mapSingleChildIntoContext(bookKeeping, child, childKey) {
  const { result, keyPrefix, func, context } = bookKeeping;
  // func 就是我们在 React.Children.map(this.props.children, c => c)中传入的第二个函数参数
  let mappedChild = func.call(context, child, bookKeeping.count++);
  if (Array.isArray(mappedChild)) {
    // 数组递归展平
    // React.Children.map(this.props.children, c => [c, [c, [c]]])
    mapIntoWithKeyPrefixInternal(mappedChild, result, childKey, c => c);
  } else if (mappedChild != null) {
    if (isValidElement(mappedChild)) {
      // 创建一个新的ReactElement
      mappedChild = cloneAndReplaceKey(
        mappedChild,
        // Keep both the (mapped) and old keys if they differ, just as
        // traverseAllChildren used to do for objects as children
        keyPrefix +
        (mappedChild.key && (!child || child.key !== mappedChild.key)
          ? escapeUserProvidedKey(mappedChild.key) + '/'
          : '') +
        childKey,
      );
    }
    result.push(mappedChild);
  }
}
```
我们在 **React.Children.map(this.props.children, fun => fun)** fun 执行完如果还是一个 数组 则继续 去 又跑去调用 **mapIntoWithKeyPrefixInternal**。

这个时候我们再回去看,每次从pool里面取context了,而pool的意义大概也就是在这里了,如果循环嵌套多了,可以减少很多对象创建和gc的损耗。

>频繁的对象创建,频繁的垃圾回收让GC没有机会工作

## 验证

看完上面的流程,个人做了自己的理解,就是把一个多维数组,铺平成一个一维数组,按照深度优先的规则.下面来验证下自己的这个总结是否正确,

我们在看看  ReactChildren-test.js 文件下面的测试用例，如 219 行的一个🌰来说
```js
  it('should be called for each child in nested structure', () => {
    const zero = <div key="keyZero" />;
    const one = null;
    const two = <div key="keyTwo" />;
    const three = null;
    const four = <div key="keyFour" />;
    const five = <div key="keyFive" />;

    const context = {};
    const callback = jest.fn().mockImplementation(function(kid) {
      return kid;
    });

    const instance = <div>{[[zero, one, two], [three, four], five]}</div>;

    function assertCalls() {
      expect(callback).toHaveBeenCalledTimes(6);
      expect(callback).toHaveBeenCalledWith(zero, 0);
      expect(callback).toHaveBeenCalledWith(one, 1);
      expect(callback).toHaveBeenCalledWith(two, 2);
      expect(callback).toHaveBeenCalledWith(three, 3);
      expect(callback).toHaveBeenCalledWith(four, 4);
      expect(callback).toHaveBeenCalledWith(five, 5);
      callback.mockClear();
    }

    React.Children.forEach(instance.props.children, callback, context);
    assertCalls();

    const mappedChildren = React.Children.map(
      instance.props.children,
      callback,
      context,
    );
    assertCalls();
}   
```

我们自己再写个简单 demo 验证下

```js

const arr = [['1', '2'], ['3'], ["4", ['1', '1']]]

function ReactChindren() {
    return (
        Children.map(arr, (child, index) => {
            return <li>{child}</li>
        })
    )
}

export default ReactChindren
```

按照上面总结,应该依此排列的为 1,2,3,4,1,1, 我们访问页面发现也是正确的

## 总结

使用 **React.Children** 可以更好的保护我们的程序,我们可以用来替换常规的 **map** 方法. 它可以把一个多维数组(或者嵌套的 Element)铺平成一个一维数组,按照深度优先遍历的规则,最后再渲染我们的 child,但是 传入的 child 不能是一个 object 对象. 最后用一张图做了简单总结

![ReactChildren](/react/ReactChildren.png)