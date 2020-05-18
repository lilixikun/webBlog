
## 数组的表示法

### 「类型 + 方括号」

最简单的方法是使用「类型 + 方括号」来表示数组：

```ts
let fibonacci: number[] = [1, 1, 2, 3, 5];
```

> 数组中不允许出现其他的类型

### 数组泛型

也可以使用数组泛型（Array Generic） Array<elemType> 来表示数组：

```ts
let fibonacci: Array<number> = [1, 1, 2, 3, 5];
```