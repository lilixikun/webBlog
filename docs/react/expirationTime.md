# expirationTime计算

expirationTime 时间的计算和 React 没有任何关联,首先让我们抛开 React 相关东西,单纯的来看 这个计算,在 **/react-reconciler/src/ReactFiberExpirationTime.js** 中我们可以看到相关的expirationTime计算 公式,代码如下

```js
// MAX_SIGNED_31_BIT_INT 默认定义为 Math.pow(2, 30) - 1  1073741823
export const Sync = MAX_SIGNED_31_BIT_INT;
export const Batched = Sync - 1;


const UNIT_SIZE = 10;
const MAGIC_NUMBER_OFFSET = Batched - 1;  // 1073741821


// 1 unit of expiration time represents 10ms.
export function msToExpirationTime(ms: number): ExpirationTime {
  // Always add an offset so that we don't clash with the magic number for NoWork.
  return MAGIC_NUMBER_OFFSET - ((ms / UNIT_SIZE) | 0);
}


export function expirationTimeToMs(expirationTime: ExpirationTime): number {
  return (MAGIC_NUMBER_OFFSET - expirationTime) * UNIT_SIZE;
}


function ceiling(num: number, precision: number): number {
  return (((num / precision) | 0) + 1) * precision;
}


function computeExpirationBucket(
  currentTime,
  expirationInMs,
  bucketSizeMs,
): ExpirationTime {
  return (
    MAGIC_NUMBER_OFFSET -
    ceiling(
      MAGIC_NUMBER_OFFSET - currentTime + expirationInMs / UNIT_SIZE,
      bucketSizeMs / UNIT_SIZE,
    )
  );
}


export const LOW_PRIORITY_EXPIRATION = 5000;
export const LOW_PRIORITY_BATCH_SIZE = 250;


export function computeAsyncExpiration(
  currentTime: ExpirationTime,
): ExpirationTime {
  return computeExpirationBucket(
    currentTime,
    LOW_PRIORITY_EXPIRATION,
    LOW_PRIORITY_BATCH_SIZE,
  );
}


export function computeSuspenseExpiration(
  currentTime: ExpirationTime,
  timeoutMs: number,
): ExpirationTime {
  // TODO: Should we warn if timeoutMs is lower than the normal pri expiration time?
  return computeExpirationBucket(
    currentTime,
    timeoutMs,
    LOW_PRIORITY_BATCH_SIZE,
  );
}

export const HIGH_PRIORITY_EXPIRATION = __DEV__ ? 500 : 150;
export const HIGH_PRIORITY_BATCH_SIZE = 100;

export function computeInteractiveExpiration(currentTime: ExpirationTime) {
  return computeExpirationBucket(
    currentTime,
    HIGH_PRIORITY_EXPIRATION,
    HIGH_PRIORITY_BATCH_SIZE,
  );
}
```

React 有两种类型的 **ExpirationTime**, 一个是 Interactive,另一种是普通的异步。Interactive的比如说是由事件触发的，那么他的响应优先级会比较高因为涉及到交互

拿 **computeAsyncExpiration** 和 **computeInteractiveExpiration** 方法来说,他们分别调用 **computeExpirationBucket** 传入以下: 
- currentTime  调用 msToExpirationTime 得到的 ExpirationTime
- expirationInMs 不同优先级任务会传不同的偏移量，把不同优先级的时间拉开差距
- bucketSizeMs 越大，批处理的间隔就越大

我们现在套用公式来试试,

```js
// computeAsyncExpiration 公式
computeExpirationBucket(currentTime,5000,250)
// computeExpirationBucket 方法
(1073741821-ceiling(1073741821-currentTime+5000/10,250/10))
// 代入 ceiling
1073741821-((((1073741821 - currentTime + 500) / 25) | 0) + 1) * 25

// 我们设定currentTime的值为 997到1025得出结果为
// 从997到1021的结果都是496
// 从1022到1025的结果都是521
// 可以得出再间隔25ms内即(1021 - 997 + 1)结果是一致的。
// 也即异步更新的过期时间间隔是25ms
```

其他的如 **computeSuspenseExpiration**、**computeInteractiveExpiration**是同样的道理。

**React**为什么这么设计呢？
 
这么做也许是为了让非常相近的两次更新得到相同的expirationTime，然后在一次更新中完成，相当于一个自动的batchedUpdates。

我们知道setState可能会批量更新，就是这个原因。

内部会把异步更新间隔在25ms内的更新合并成一个，可以很大的提高性能