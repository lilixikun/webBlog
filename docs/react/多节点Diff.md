# 多节点Diff

上节说了单节点 Diff 情况,现在来说下 当 jsx 编译的 props.children 是一个数组的情况下,会进入到

```js
if (isArray(newChild)) {
    return reconcileChildrenArray(
    returnFiber,
    currentFirstChild,
    newChild,
    expirationTime,
    );
}
```

## reconcileChildrenArray

::: details 源码
```js
  function reconcileChildrenArray(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChildren: Array<*>,
    expirationTime: ExpirationTime,
  ): Fiber | null {
    // 这个算法不能通过两端搜索来优化，因为在 fibers 里没有返回指针
    // 我想看看这个那个模型可以走多远，如果它最终不值得权衡，我们稍后在添加
    // 即使采用双端优化，我们也希望针对这种情况进行优化
    // 在没有变化的情况下，强制进行比较而不是
    // 去找 Map 它想先探索一下这条路
    // 仅向前模式，只有在我们发现需要时才会转到 Map
    // 很多展望未来 这不会处理逆转以及两个结束
    // 搜索，但那是不寻常的。 此外，对于两端优化来说
    // 对Iterables工作，我们需要复制整个集合。
    //在第一次迭代中，我们只会遇到不好的情况
    //（将所有内容添加到Map中）进行每次插入/移动。
    //如果更改此代码，还要更新reconcileChildrenIterator（）
    //使用相同的算法。

    // 1. 处理条件渲染导致fiber index不一致的问题
    // 2. newFiber 为 null，就表示没有找到复用的节点，然后就跳出循环
    // 3. 遍历了所有的新子节点，剩下的都删除。新节点遍历完了，old节点可能还有。
    // 4. 如果老的节点已经被复用完了，对剩下的新节点进行操作，批量插入老节点末端
    // 5. 对比了key值的。newFiber不为null ，代表可以复用这个节点，直接复用这个节点

    let resultingFirstChild: Fiber | null = null;
    //遍历children 数组时保存前一个 Fiber
    let previousNewFiber: Fiber | null = null;
    // currentFirstChild 只有在更新时才不为空 他是当前 fiber 的 child 属性，也是下一个要调度的 fiber
    let oldFiber = currentFirstChild;
    // 上次放置的索引， 更新时placeChild() 根据这个索引值决定新组件的插入位置
    let lastPlacedIndex = 0;
    //fiber.index
    let newIdx = 0;
    let nextOldFiber = null;
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
      if (oldFiber.index > newIdx) {
        // 为什么会有 oldFiber.index 大于 newIdx 呢？
        // 1. 处理条件渲染导致fiber index不一致的问题
        // 条件渲染的时候
        nextOldFiber = oldFiber;
        oldFiber = null;
      } else {
        nextOldFiber = oldFiber.sibling;
      }
      const newFiber = updateSlot(
        returnFiber,
        oldFiber,
        newChildren[newIdx],
        expirationTime,
      );
      // 2. newFiber 为 null，就表示没有找到复用的节点，然后就跳出循环
      if (newFiber === null) {
        if (oldFiber === null) {
          oldFiber = nextOldFiber;
        }
        break;
      }
      if (shouldTrackSideEffects) {
        if (oldFiber && newFiber.alternate === null) {
          // We matched the slot, but we didn't reuse the existing fiber, so we
          // need to delete the existing child.
          // newFiber.alternate 不存在，代表没有复用节点,所以需要删除老的节点
          deleteChild(returnFiber, oldFiber);
        }
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null) {
        // TODO: Move out of the loop. This only happens for the first run.
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }
    // 3. 遍历了所有的新子节点，剩下的都删除,新节点遍历完了，old节点可能还有。
    if (newIdx === newChildren.length) {
      // We've reached the end of the new children. We can delete the rest.
      deleteRemainingChildren(returnFiber, oldFiber);
      return resultingFirstChild;
    }
    // 4. 如果老的节点已经被复用完了，对剩下的新节点进行操作，批量插入老节点末端
    if (oldFiber === null) {
      for (; newIdx < newChildren.length; newIdx++) {
        const newFiber = createChild(
          returnFiber,
          newChildren[newIdx],
          expirationTime,
        );
        if (newFiber === null) {
          continue;
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
        if (previousNewFiber === null) {
          // TODO: Move out of the loop. This only happens for the first run.
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
      return resultingFirstChild;
    }

    // Add all children to a key map for quick lookups.
    const existingChildren = mapRemainingChildren(returnFiber, oldFiber);

    // Keep scanning and use the map to restore deleted items as moves.
    for (; newIdx < newChildren.length; newIdx++) {
      // 5. 根据key值，对比
      const newFiber = updateFromMap(
        existingChildren,
        returnFiber,
        newIdx,
        newChildren[newIdx],
        expirationTime,
      );
      // newFiber 不为null ，代表可以复用这个节点
      if (newFiber !== null) {
        if (shouldTrackSideEffects) {
          // newFiber.alternate !== null 表示这个节点已经被复用了，
          if (newFiber.alternate !== null) {
            existingChildren.delete(
              newFiber.key === null ? newIdx : newFiber.key,
            );
          }
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
        if (previousNewFiber === null) {
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
    }

    if (shouldTrackSideEffects) {
      // Any existing children that weren't consumed above were deleted. We need
      // to add them to the deletion list.
      existingChildren.forEach(child => deleteChild(returnFiber, child));
    }

    return resultingFirstChild;
  }
```
:::

## 概览

首先归纳下我们需要处理的情况：

我们以**之前**代表更新前的JSX对象，**之后**代表更新后的JSX对象

**情况一:节点更新**
```js
    // 之前
<ul>
    <li key="0" className="before">0<li>
    <li key="1">1<li>
</ul>

    // 之后 情况1 —— 节点属性变化
<ul>
    <li key="0" className="after">0<li>
    <li key="1">1<li>
</ul>

    // 之后 情况2 —— 节点类型更新
<ul>
    <div key="0">0<li>
    <li key="1">1<li>
</ul>
```

**情况2：节点新增或减少***

```js
// 之前
<ul>
  <li key="0">0<li>
  <li key="1">1<li>
</ul>

// 之后 情况1 —— 新增节点
<ul>
  <li key="0">0<li>
  <li key="1">1<li>
  <li key="2">2<li>
</ul>

// 之后 情况2 —— 删除节点
<ul>
  <li key="1">1<li>
</ul>
```

## 情况3：节点位置变化

```js
// 之前
<ul>
  <li key="0">0<li>
  <li key="1">1<li>
</ul>

// 之后
<ul>
  <li key="1">1<li>
  <li key="0">0<li>
</ul>
```

同级多个节点的Diff,一定属于以上三种情况中的一种或多种。

::: warning
在我们做数组相关的算法题时，经常使用双指针从数组头和尾同时遍历以提高效率，但是这里却不行。

虽然本次更新的JSX对象 newChildren为数组形式，但是和newChildren中每个组件进行比较的是current fiber，同级的Fiber节点是由sibling指针链接形成的单链表，即不支持双指针遍历。

即 newChildren[0]与fiber比较，newChildren[1]与fiber.sibling比较。

所以无法使用双指针优化。
::: 


**Diff** 算法的整体逻辑会经历两轮遍历:

- 第一轮遍历:处理更新的节点。

- 第二轮遍历:处理剩下的不属于更新的节点。