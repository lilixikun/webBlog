## 请从字符串中找出一个最长的不包含重复的子字符串,计算该长子字符串的长度


## 滑动窗口
```js
/**
 * 滑动窗口
 * 准备2个指针i,j  i指向窗口左边,j 指向右边。指针每次都可以向前 "滑动" 一个位置,它们之间的区域就是 "窗口"
 * 整体流程如下:
 * 1.i 和 js 初始化为0, 结果 ans 初始值为0
 * 2.检查 s[j] 是否出现:
 *  没有出现,扩大窗口,记录 s[j], 指针 j 向右滑动一格,更新 ans
 *  出现过,缩小窗口：指针 i 向右移动一格, map[s[j]] 更新为 false
 * 3.如果 i 和 j 没有越界, 回到循环,否则返回 ans
 */
function getMaxLengthOfString(s) {
    const length = s.length;
    let map = {}
    let i = 0;
    let j = 0;
    let ans = 0;
    while (i < length && j < length) {
        if (!map[s[j]]) {
            ans = Math.max(j - i + 1, ans)
            map[s[j]] = true
            ++j
        } else {
            map[s[i]] = false
            ++i
        }
    }
    return ans
}
```

## 优化后

```js
/**
 * 优化后
 * 如果 s[j] 出现在滑动窗口内,采用的做法是左边逐步缩小滑动窗口.
 * 事实上,不需要逐步缩小. 假设滑动窗口内 和 s[j] 相同字符下标是 j ,那么直接跳过 [i,j] 范围即可
 * 为了做到 "跳动优化" ,改造一下 哈希表 map 的用法, key 还是 char,value 变成 int ,记录 char 对应的下标
*/

function getMaxLengthOfString(s) {
    const length = s.length;
    const map = new Map();
    let i = 0;
    let j = 0;
    let ans = 0;
    while (i < length && j < length) {
        if (map.has(s[j]) && map.get(s[j]) >= i) {
            i = map.get(s[j]) + 1
        }
        ans = Math.max(j - i + 1, ans);
        map.set(s[j], j)
        ++j;
    }
    console.log(ans);

    return ans
}

getMaxLengthOfString('ahffgafdnbfjsksabbds')
```