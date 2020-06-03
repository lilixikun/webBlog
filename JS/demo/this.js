// var number = 5;
// var obj = {
//     number: 3,
//     fn1: (function () {
//         var number;
//         this.number *= 2;
//         number = number * 2;
//         number = 3;
//         return function () {
//             var num = this.number;
//             this.number *= 2;
//             console.log(num);
//             number *= 3;
//             console.log(number);
//         }
//     })()
// }
// var fn1 = obj.fn1;
// fn1.call(null);
// obj.fn1();
// console.log(window.number);

this.a = 20;
function go() {
    console.log(this.a);
    this.a = 30;
}
go.prototype.a = 40;
var test = {
    a: 50,
    init: function (fn) {
        fn();
        console.log(this.a);
        return fn;
    }
};
console.log((new go()).a);
test.init(go);
var p = test.init(go);
p();