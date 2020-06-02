function createIterator(items) {
    var i = 0;
    return {
        next: function () {
            var done = i >= items.length;
            var value = !done ? items[i++] : undefined
            return {
                done: done,
                value: value
            }
        }
    }
}

// 生成器
function* createIterator(items) {
    for (let i = 0; i < items.length; i++) {
        yield items[i]
    }
}



var iterator = createIterator([1, 2, 3]);
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());

console.log(iterator.next());  // "{ value: undefined, done: true }"

var o = {
    createIterator: function* (items) {
        for (let i = 0; i < items.length; i++) {
            yield items[i]
        }
    }

    // *createIterator(items){

    // }
}
//let iterator = o.createIterator([1, 2, 3]);

let values = [1, 2, 3]
// for (const num of values) {
//     console.log(num)
// }

let defIterator = values[Symbol.iterator]
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());

function isIterable(object) {
    return typeof object[Symbol.iterator] === 'function'
}

console.log(isIterable([]));
console.log(isIterable(""));
console.log(isIterable({}));
console.log(isIterable(1));
console.log(isIterable(new Map()));
console.log(isIterable(new Set()));
console.log(isIterable(new WeakMap()));
console.log(isIterable(new WeakSet()));


let collection = {
    obj: {},
    *[Symbol.iterator]() {
        for (const key in this.obj) {
            yield this.obj[key]
        }
    }
}
collection.obj.name = 'Tom'
collection.obj.age = 20
for (const iterator of collection) {
    console.log(iterator);
}

function* createIterator() {
    yield 1;
    return;
    yield 2
    yield 3
}

let iterator1 = createIterator();
console.log(iterator1.next());
console.log(iterator1.next());