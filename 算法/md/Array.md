# 数组

# 添加元素

## 在数组末尾插入元素

如果想要给数组添加一个元素,只要把值赋给数组中最后一个空位上的元素即可。

```js
let numbers = [0, 1, 2, 3, 4, 5]
numbers[numbers.length] = 6
```

使用 **push** 方法,能添加任意个

```js
numbers.push(7, 8)
```

## 在数组开头插入元素

首先要腾出数组里第一个元素的位置，把所有的元素向右移动一位。

```js
Array.prototype.insertFirstPosition = function (value) {
    for (let i = this.length; i >= 0; i--) {
        this[i] = this[i - 1]
    }
    this[0] = value
}

numbers.insertFirstPosition(-1)
```

使用 **unshift** 方法(后台逻辑和insertFirstPosition 方法行为是一样的)

```js
numbers.unshift(-2)
```

## 删除元素

要删除数组里最靠后的元素，可以用 pop 方法。

```js
numbers.pop();
```

从数组开头删除元素

```js
// 删除 undefined 元素
Array.prototype.reIndex = function (myArray) {
    const newArray = []
    for (let i = 0; i < myArray.length; i++) {
        if (myArray[i] != undefined) {
            newArray.push(myArray[i])
        }
    }
    return newArray
}

// 手动移除第一个元素
Array.prototype.removeFirstPosition = function () {
    for (let i = 0; i < this.length; i++) {
        this[i] = this[i + 1]
    }
    return this.reIndex(this)
}

numbers.removeFirstPosition()
```

使用 **shif** 方法

```js
numbers.shift();
```

## 在任意位置添加或者删除

使用 **splice** 方法，简单地通过指定位置/索引，就可以删除相应位置上指定数量的元素。

# JavaScript 的数组方法参考

## concat
连接 2 个或更多数组，并返回结果

## every
对数组中的每个元素运行给定函数，如果该函数对每个元素都返回 **true**,则返回 **true**

## filter
对数组中的每个元素运行给定函数，返回该函数会返回 **true** 的元素组成的数组

## forEach
对数组中的每个元素运行给定函数。这个方法没有返回值

## join
将所有的数组元素连接成一个字符串

## indexOf
返回第一个与给定参数相等的数组元素的索引，没有找到则返回 **-1**

## lastIndexOf
返回在数组中搜索到的与给定参数相等的元素的索引里最大的值

## map
对数组中的每个元素运行给定函数，返回每次函数调用的结果组成的数组

## reverse
颠倒数组中元素的顺序，原先第一个元素现在变成最后一个，同样原先的最后一个元素变成了现在的第一个

## reduce
reduce 方法接收一个有如下四个参数的函数：previousValue、currentValue、index 和 array。

## slice
传入索引值，将数组里对应索引范围内的元素作为新数组返回

## some
对数组中的每个元素运行给定函数，如果任一元素返回 **true**,则返回 **true**

## sort
按照字母顺序对数组排序，支持传入指定排序方法的函数作为参数

## toString
将数组作为字符串返回

## valueOf
和 toString 类似，将数组作为字符串返回

# ECMAScript 6 和数组的新功能

| 方法 | 描述 |
|-----|------|
|@@iterator | 返回一个包含数组键值对的迭代器对象，可以通过同步调用得到数组元素的键值对|
|copyWithin | 复制数组中一系列元素到同一数组指定的起始位置 |
|entries    | 返回包含数组所有键值对的@@iterator    |
|includes   | 如果数组中存在某个元素则返回 true，否则返回 false。E2016 新增 |
|find       | 根据回调函数给定的条件从数组中查找元素，如果找到则返回该元素 |
|findIndex | 根据回调函数给定的条件从数组中查找元素，如果找到则返回该元素在数组中的索引 |
|fill       | 用静态值填充数组 |
|from       | 根据已有数组创建一个新数组 |
|keys      | 返回包含数组所有索引的@@iterator |
|of         | 根据传入的参数创建一个新数组 |
|values     | 返回包含数组中所有值的@@iterator|


## 使用 for...of 循环迭代

```js
for (const item of numbers) {
    console.log(item);
}
```

**使用@@iterator 对象**

```js
let iterator = numbers[Symbol.iterator]()
console.log(iterator.next().value);  // -1
console.log(iterator.next().value);  // 0
console.log(iterator.next().value);  // 1   
console.log(iterator.next().value);  // 2
```

不断调用迭代器的 next 方法，就能依次得到数组中的值

```js
for (const item of iterator) {
    console.log(item);
}
```

**数组中的所有值都迭代完之后，iterator.next().value 会返回 undefined**