


function baz() {
    // 当前调用栈是：baz 
    // 因此，当前调用位置是全局作用域 
    console.log("baz");
    bar();  // <-- bar 的调用位置 

}
function bar() {

    // 当前调用栈是 baz -> bar 
    // 因此，当前调用位置在 baz 中 
    console.log("bar");
    foo(); // <-- foo 的调用位置 
}
function foo() {
    // 当前调用栈是 baz -> bar -> foo 
    // 因此，当前调用位置在 bar 中
    console.log("foo");
    baz(); // <-- baz 的调用位置
}

function foo() {
    console.log(this.a);
}

function foo() {
    console.log(this.a);
}
var obj = {
    a: 2,
    foo: foo
};
obj.foo(); //2

function foo() {
    console.log(this.a)
}
var obj = {
    a: 2,
    foo: foo
}

var bar = obj.foo;
var a = 'oops, global'; //a 是全局对象
bar() // oops, global

function foo() {
    console.log(this.a)
}

var obj = {
    a: 2
}

foo.call(obj) //2

function foo(a) {
    this.a = a
}
var bar = new foo(2)
console.log(bar.a)



var obj = {
    a: 1,
    foo: function (b) {
        b = b || this.a
        return function (c) {
            console.log(this.a + b + c)
        }
    }
}
var a = 2
var obj2 = { a: 3 }

obj.foo(a).call(obj2, 1)
obj.foo.call(obj2)(1)