//ES6 提供了新的数据结构 Set。它类似于数组，但是成员的值都是唯一的，没有重复的值。
const s=new Set();
[2,2,3,4,5,4].forEach(x=>s.add(x));
console.log(s);//Set {2,3,4,5}
console.log(s.size); //4

//数组去重
let arr=[2,2,3,4,4];
console.log([...new Set(arr)]);//[2,3,4]

//set 在加入时不会做类型装换    
//主要的区别是向 Set 加入值时认为NaN等于自身，而精确相等运算符认为NaN不等于自身
let set=new Set();
let a=NaN;
let b=NaN;
set.add(a);
set.add(b);
set // Set {NaN}
//向 Set 实例添加了两次NaN，但是只会加入一个。这表明，在 Set 内部，两个NaN是相等的

//两个对象总是不相等
let set=new Set();
set.add({});
set.size; //1
set.add({});
set.size//2

Set.prototype.constructor; //默认set函数
Set.prototype.size;

Set.prototype.delete();
Set.prototype.has();
Set.prototype.add();
Set.prototype.clear();


Set.prototype.entries();
Set.prototype.keys();
Set.prototype.values();
Set.prototype.forEach();

//遍历的运用
//扩展运算符 ...  for...of

//首先，WeakSet 的成员只能是对象，而不能是其他类型的值。
//其次，WeakSet 中的对象都是弱引用，即垃圾回收机制不考虑 WeakSet 对该对象的引用，
//也就是说，如果其他对象都不再引用该对象，那么垃圾回收机制会自动回收该对象所占用的内存，不考虑该对象还存在于 WeakSet 之中。

let weak=new WeakMap();

//是a数组的成员成为 WeakSet 的成员，而不是a数组本身。这意味着，数组的成员只能是对象
const a = [[1, 2], [3, 4]];
const ws = n
new WeakSet(a); //WeakSet {[1, 2], [3, 4]}

//数组b的成员不是对象，加入 WeakSet 就会报错。
const b=[3,4];
new WeakMap(b)//// Uncaught TypeError: Invalid value used in weak set(…)

WeakMap.prototype.has();
WeakMap.prototype.add();
WeakMap.prototype.delete();

//Map
const m=new Map();
m.set(p,"hello");
m.get("p"); //hello

m.has('p') //true
m.delete('p')//true
m.has('p')//false


const map=new Map([['name','张三'],['title','Author']]);
map.size;

Map.prototype.size;
Map.prototype.set();
Map.prototype.get();
Map.prototype.has();
Map.prototype.delete();
Map.prototype.clear();

//遍历方法
Map.prototype.keys();
Map.prototype.values();
Map.prototype.entries();
Map.prototype.forEach();


//WeakMap 与 Map 在 API 上的区别主要是两个，一是没有遍历操作（即没有keys()、values()和entries()方法），也没有size属性
const weakMap=new WeakMap();
WeakMap.prototype.get();
WeakMap.prototype.set();
WeakMap.prototype.has();
WeakMap.prototype.delete();









