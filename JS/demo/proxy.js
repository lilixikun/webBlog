let handler = {
    get: function (target, name) {
        return name in target ? target[name] : 42
    }
}

let p = new Proxy({}, handler)
p.a = 1

console.log(p.a, p.b); // 1  42

// 
let a = {
    [Symbol.toPrimitive]: ((i) => () => ++i)(0)
};

if (a == 1 && a == 2 && a == 3) {
    console.log('元编程')
}
console.log(a)


let b = {
    val: 1,
    valueOf() {
        return this.val++
    }
}

if (b == 1 && b == 2 && b == 3) {
    console.log('重写valueOf/toString ')
}

Reflect.has(Object, 'assign')

const negativeArray = (els) =>
    new Proxy(els, {
        get: (target, propKey, receiver) =>
            Reflect.get(
                target,
                +propKey < 0 ? String(target.length + +propKey) : propKey,
                receiver
            ),
    });
const unicorn = negativeArray(['奥', '🐰', '前', '行']);
console.log(unicorn[-1]);


