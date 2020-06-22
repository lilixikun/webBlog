class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return '(' + this.x + ', ' + this.y + ')';
    }
}

typeof (Point) //function
Point.prototype.constructor === 'Ponit' //true

//构造函数的prototype属性，在 ES6 的“类”上面继续存在。事实上，类的所有方法都定义在类的prototype属性上面。

class Point {
    constructor() { }
    toString() { }
    valueOf() { }
}
//等同于
Point.prototype = {
    constructor() { },
    toString() { },
    valueOf() { }
}

//在类上调用方法 就是调用原型上的方法
class B { }
let b = new B();
b.constructor = B.prototype.constructor; //true

//类的内部定义的方法都是不可枚举的
Object.keys(Point.prototype);//[]

//es5 写法可以枚举
var Point = function (x, y) { }
Point.prototype.toString = function () { }
Object.keys(Point.prototype);  //['toString']


//constructor方法是类的默认方法，通过new命令生成对象实例时，自动调用该方法。
//一个类必须有constructor方法，如果没有显式定义，一个空的constructor方法会被默认添加。
class Foo { }
//等同于
class Foo {
    constructor() {
        // constructor方法默认返回实例对象（即this），完全可以指定返回另外一个对象。
        return Object.create(null)
    }
}

new Foo instanceof Foo //false

//类必须用new调用 否则会报错
class Point {
    // ...
}

// 报错
var point = Point(2, 3);

// 正确
var point = new Point(2, 3);

class A {
    static hello() {
        console.log();
        console.log('hello word');
    }
}

//第一种情况，super作为函数调用时，代表父类的构造函数。ES6 要求，子类的构造函数必须执行一次super函数。

class B extends A {
    constructor() {
        //super()在这里相当于A.prototype.constructor.call(this)。
        super();

        //作为函数时，super()只能用在子类的构造函数之中，用在其他地方就会报错
        m() {
           // super(); // 报错
        }
    }
}
B.hello();
new A(); //A
new B(); //B

//由于super指向父类的原型对象，所以定义在父类实例上的方法或属性，是无法通过super调用的。
class A {
    constructor() {
        this.p = 2;
    }
}

class B extends A {
    get m() {
        return super.p;
    }
}

let b = new B();
b.m // undefined

//如果定义在原型上就可以获取到


