# 单节点Diff
在前面 **beginWork** 流程中会调用 [reconcilechildren](/react/beginWork.html#reconcilechildren) 创建 **Fiber** 节点,对于单个节点，我们以类型object为例，会进入 [reconcileSingleElement](/react/beginWork.html#reconcilesingleelement)


## reconcileSingleElement

```js
 const isObject = typeof newChild === 'object' && newChild !== null;

 if (isObject) {
    // 对象类型，可能是 REACT_ELEMENT_TYPE 或 REACT_PORTAL_TYPE
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE:
        // 调用 reconcileSingleElement 处理
      // ...其他case
      return placeSingleChild(
        reconcileSingleElement(
            returnFiber,
            currentFirstChild,
            newChild,
            expirationTime,
        ),
     ); 
    }
  }
```

这个函数会做以下事情:
![diff](/react/diff.png)

具体代码如下:

```js
function reconcileSingleElement(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  element: ReactElement
): Fiber {
  const key = element.key;
  let child = currentFirstChild;
  
  // 首先判断是否存在对应DOM节点
  while (child !== null) {
    // 上一次更新存在DOM节点，接下来判断是否可复用

    // 首先比较key是否相同
    if (child.key === key) {

      // key相同，接下来比较type是否相同

      switch (child.tag) {
        // ...省略case
        
        default: {
          if (child.elementType === element.type) {
            // type相同则表示可以复用 调用 useFiber 复用
            // 返回复用的fiber
            return existing;
          }
          
          // type不同则跳出循环
          break;
        }
      }
      // 代码执行到这里代表：key相同但是type不同
      // 将该fiber及其兄弟fiber标记为删除
      deleteRemainingChildren(returnFiber, child);
      break;
    } else {
      // key不同，将该fiber标记为删除
      deleteChild(returnFiber, child);
    }
    child = child.sibling;
  }

  // 创建新Fiber，并返回 ...省略
}
```

那么什么样的才会进入到 **reconcileSingleElement** 方法里面呢?,这里又不得不提到之前说的 [JSX](/react/JSX.html) 如下节点:

```jsx
const A = (
  <div>
    <div><a>123</a></div>
    <p>
      1
      <span>span</span>
    </p>
  </div>
)
console.log(A);
```

经过编译后会生成如下结构:

![diff1](/react/diff1.jpg)

可以清楚的看到 一个 **div** 有两个子节点分别为 div 和 p 标签,然后下面的 div 有一个子节点就是 **a** 标签 而对应的数据结构也是一个 **object** 且有 **$$typeof** 属性,因此会进入到 **reconcileSingleElement** 方法里面,对于数组多节点则会进入下面的 **reconcileChildrenArray** 方法

## 规则

从上面代码可以看到 React通过先判断 <font color='red'>key</font> 是否相同，如果 <font color='red'>key</font>相同则判断 <font color='red'>type</font> 是否相同，只有都相同时一个DOM节点才能复用。

这里有个细节需要关注下:

- 当 **child !== null** 且 **key** 相同且 **type不同** 时执行 **deleteRemainingChildren** 将 **child及其兄弟fiber** 都标记删除。

- 当**child !== null** 且 **key** 不同时仅将 **child** 标记删除。

当 **key** 不同时, React 尝试去找 fiber 的兄弟节点,看能不能复用,因此只删除该 fiber

当 **key** 相同,**type** 不同时,代表我们已经找到本次更新的对应的上次的 **fiber**,但是 **type** 不同,不能复用。既然唯一的可能性已经不能复用，则剩下的 **fiber**都没有机会了，所以都需要标记删除。

这里我就感概 React 想的真细啊 不放弃任何有可能的复用的优化机会