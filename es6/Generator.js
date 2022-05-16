//yield 只能用在 Generator 函数里面 用在别的会报错
(function () {
    yield 1;
})()
//SyntaxError: Unexpected number

//yield表达式如果用在另一个表达式之中，必须放在圆括号里面。
function* deme() {
    //console.log('hello' +yield 2);

    console.log('hello' + (yield 123)); 
}


//由于 Generator 函数就是遍历器生成函数，因此可以把 Generator 赋值给对象的Symbol.iterator属性，从而使得该对象具有 Iterator 接口。

var myIterator = {};
myIterator[Symbol.iterator] = function* () {
    yield 1;
    yield 2;
    yield 3;
}
//[...myIterator] [1,2,3]

function* gen() {

}
var g = gen();
g[Symbol.iterator] === g; //true

//yield表达式本身没有返回值，或者说总是返回undefined。next方法可以带一个参数，该参数就会被当作上一个yield表达式的返回值。
function* foo(x) {
    var y = 2 * (yield (x + 1));
    var z = yield (y / 3);
    return (x + y + z)
}

var a = foo(5);
a.next();//6
a.next()//undefined
a.next() //undefined

var f = foo(5);
f.next();//6
f.next(12); //8
f.next(13); //42

//Generator.prototype.return()
//Generator 函数返回的遍历器对象，还有一个return方法，可以返回给定的值，并且终结遍历 Generator 函数。

function* gen() {
    yield 1;
    yield 2;
    yield 3;
}
var g = gen();
g.next(); //{value:1,done:false}
g.return('foo'); //{value:'foo',done:true}
//如果不提供参数 则是undefined
g.return()//{value:undefined,done:true}
