

Animal.prototype.eat = function () {
    console.log(this.name + " is eating something.")
}

function Animal(name) {
    this.name = name;
}

var tiger = new Animal('ea')
tiger.eat()

var tiger2 = {};
tiger2.name = 'xxx'
tiger2.__proto__ = Animal.prototype
// Animal.call(tiger2)
tiger2.eat()


function A() {

}
var a = new A()

Function.prototype === Function.__proto__

Function.prototype.__proto__ === Object.prototype

Object.prototype.__proto__ === null

Function.prototype === Object.__proto__
