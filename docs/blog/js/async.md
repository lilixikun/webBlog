# async

先来一道面试题看看你是否掌握了 **async**

```js
let a = 0;
let test = async () => {

    a = a + await 10;
    console.log(a)
}
test();
console.log(++a);
```

你成思了很久，做出了正确的答案(也可能是蒙的)，那我们再变一下，

```js
let a = 0;
let test = async () => {

    a = await 10 + a;
    console.log(a)
}
test();
console.log(++a);
```

那么，你都答对了吗？