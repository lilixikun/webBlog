## 数组中有一个数字出现的次数超过数组长度的一半,请找出这个数字.

你可以假设数组是非空的,并且给定的数组总是存在多数元素

## 解法一

```js
var majorityElement = function(nums){
    const map = new Map();
    const length = nums.length;
    num.forEach(num=>{
        const times = map.get(num);
        if(times===undefined){
            map.set(num,1);
        }else{
            map.set(num,times + 1);
        }
    })
    for(const key of map.keys()){
        if(map.get(key)>length/2){
            return key
        }
    }
    return 0;
}
// 遍历两次,时间复杂度是 0(N).哈希表存储次数,空间复杂度是 0(N)
```

## 解法二 摩尔投票法

```js
var majorityElement = function(nums){
    let times=0;
    let result = 0;
    muns.forEach(number=>{
        if(times===0){
            times = 1;
            result = number;    
        }else if(number===result){
            times+=1;
        }else{
            times -=1;
        }
    })
    return result
}
```