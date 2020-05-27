var A = function () {
    this.name = 'xx'
    this.age = 12
}

A.prototype.n = 1

var b = new A()

A.prototype.m = 2
console.log(b.n);
console.log(b.m);

console.log(A.prototype.construcuor);

