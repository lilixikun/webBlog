function* gen(x) {
    const y = yield x + 6;
    return y
}

function* genOne(x) {
    const y = `这是一段文字:${yield x + 1}`;
    return y
}

//执行Generator 会返回一个 object 而不是像普通函数那样返回 return 后面的值
const g = gen(1);
//{ value: 7, done: false }
g.next();
//调用指针的 next 方法,会从函数的头部或上一次停下来的地方开始执行，直到遇到下一个 yield 表达式或return语句暂停,也就是执行yield 这一行
// 执行完成会返回一个 Object,
// value 就是执行 yield 后面的值,done 表示函数是否执行完毕

// { value: undefined, done: true }
g.next()

//next 方法传参

g.next();
g.next(2);

//实现一个迭代器
function creatIterator(items) {
    var i = 0;
    return {
        next: () => {
            var done = (i >= items.length);
            var value = !done ? items[i++] : undefined;
            return {
                done: done,
                value: value
            }
        }
    }
}

//应用
const iteror = creatIterator([1, 2, 3]);
console.log(iteror.next());
console.log(iteror.next());
console.log(iteror.next());
console.log(iteror.next());

console.log('script start')

async function async1() {
    await async2()
    console.log('async1 end')
}
async function async2() {
    console.log('async2 end')
}
async1()

setTimeout(function () {
    console.log('setTimeout')
}, 0)

new Promise(resolve => {
    console.log('Promise')
    resolve()
}).then(function () {
    console.log('promise1')
}).then(function () {
    console.log('promise2')
})

console.log('script end')

function* test(x) {
    let a = yield x + 1;
    console.log(a);
    let b = yield a + 2;
    console.log(b);
    return x + 3;
}
const result = test(0);
result.next(1)
console.log(result.next(1));
console.log(result.next(2));
console.log(result.next(3));
console.log(result.next(4));

result.next(2);
result.next(3);
result.next(4);

async function fn(args) {

}

//相等于

function fn(args) {
    // ...
    return spawn(function* () {

    })
}

function spawn(genF) {
    return new Promise((resolve, reject) => {
        let gen = genF();
        function step(nextF) {
            let next;
            try {
                next = nextF;
            } catch (error) {
                return reject(error)
            }
            if (next.done) {
                resolve(next.value)
            }
            Promise.resolve(next.value).then(function (v) {
                step(function () {
                    return gen.next(v)
                }, function (e) {
                    step(function () {
                        return gen.throw(e)
                    })
                })
            })
        }
        step(function () {
            return gen.next(undefined)
        })
    })
}