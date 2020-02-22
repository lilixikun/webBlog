//参数变量是默认申明的,因此不能用 let const 再次申明
function point(x = 2) {
    let x = 1;//error
    const x = 3;//error
}

// 使用默认参数时,不能有同名参数
function foo(x, x, y) {

}

//报错
function foo(x, x, y = 1) {
    // Duplicate parameter name not allowed in this context
}

//参数默认值不是传值的，而是每次都重新计算默认值表达式的值。也就是说，参数默认值是惰性求值的
let x = 99;
function foo(p = x + 1) {
    console.log(p);
}

foo();//100
x = 100;
foo();


// rest 参数
// 形式为 ...变量名,用于获取函数多余的参数,这样就不需要argument 对象
function add(...values) {
    let sum = 0;
    for (var val of values) {
        sum += val;
    }
    return sum;
}
add(1, 23)

// rest 代替 arguments变量例子
function sortNumbers() {
    //arguments对象不是数组，而是一个类似数组的对象。所以为了使用数组的方法，必须使用Array.prototype.slice.call先将其转为数组
    return Array.prototype.slice.call(arguments).sort();
}

//rest就是一个真正的数组
const sortNumbers = (...numbers) => numbers.sort();

/**
 * 注意：rest 后面不能有别的参数
 */
function fn(a, ...b, c) {
    //报错
}

// 函数的 length 不包括 rest
(function (a) { }).length; //1
(function (...a) { }).length; //0
(function (a, ...b) { }).length; //1

// name 属性

var f = function () { }

//es5
f.name  //""
//es6
f.name // f

    //Function构造函数返回的函数实例，name属性的值为anonymous。
    (new Function).name

//bind返回的函数，name属性值会加上bound前缀。
function foo() { }
foo.bind({}).name //"bound foo"


/**
 * 箭头函箭头函数有几个使用注意点。
 * 1.函数体内的this对象，就是定义时所在的对象，而不是使用时所在的对象。
 * 2.不可以当作构造函数，也就是说，不可以使用new命令，否则会抛出一个错误。
 * 3.不可以使用arguments对象，该对象在函数体内不存在。如果要用，可以用 rest 参数代替
 * 4.不可以使用yield命令，因此箭头函数不能用作 Generator 函数
 */


//尾递归
// 函数调用自身，称为递归。如果尾调用自身，就称为尾递归
// 递归非常耗费内存，因为需要同时保存成千上百个调用帧，很容易发生“栈溢出”错误（stack overflow）。
// 但对于尾递归来说，由于只存在一个调用帧，所以永远不会发生“栈溢出”错误
function factorial(n) {
    if (n === 1) return 1;
    return n * factorial(n - 1)
}

factorial(5); //120
//上面代码是一个阶乘函数，计算n的阶乘，最多需要保存n个调用记录，复杂度 O(n) 

//如果改写成尾递归，只保留一个调用记录，复杂度 O(1) 。

function factorial(n, total) {
    if (n === 1) return 1;
    return factorial(n - 1, n * total);
}

factorial(5, 1)//123









