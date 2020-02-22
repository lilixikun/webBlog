//ES6 引入了一种新的原始数据类型Symbol，表示独一无二的值。它是 JavaScript 语言的第七种数据类型，
//前六种是：undefined、null、布尔值（Boolean）、字符串（String）、数值（Number）、对象（Object）。
let s=Symbol();
typeof(s);
//Symbol 不能用 new 命名,否则会报错,Symbol不是一个对象,因此不能添加属性
let si=Symbol("s1");
s1//Symbol("s1")
s1.toString();"Symbol(s1)"


//Symbol函数的参数只是表示对当前 Symbol 值的描述，因此相同参数的Symbol函数的返回值是不相等的。
let s1=Symbol();
let s2=Symbol();
s1===s2;//false
//有参数情况下
let s1=Symbol("str");
let s2=Symbol("str");
s1===s2;//false

//Symbol 不能计算
let s3=s1+s2; //TypeError: Cannot convert a Symbol value to a number

console.log(s3);












