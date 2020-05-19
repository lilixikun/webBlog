## 输入一个正整数数组,把数组里所有的数组拼接起来排成一个数,输出能拼接出的所有数字最小的一个

**示例**
> 输入 [10,8,22]
>
> 输出 10228

## 快速排序

使用快速排序,把数字放在正确的位置上。 例如 数组 [3,32] 来说, 它有两张 排列方法 :332,323. 因此 就可以比较 332 和 323 ,然后返回正确顺序

```js
function minNumber(nums) {
    nums.sort((a, b) => {
        const s1 = a + "" + b
        const s2 = b + "" + a
        if (s1 < s2) return -1
        if (s1 > s2) return 1
        return 0
    })

    return nums.join('')
}
```