
// ES9 新特性

// async await


// Promise.finally()

// 创建一个迭代器

const createIterator = (items) => {
    const keys = Object.keys(items)
    const len = keys.length
    let index = 0

    return {
        next() {
            const done = index >= len;
            const value = !done ? items[keys[index++]] : undefined
            return {
                value,
                done
            }
        }
    }
}

let arr = [1, 2, 3]

const its = createIterator(arr)
console.log(its.next());
console.log(its.next());
console.log(its.next());
console.log(its.next());


let objI = {
    name: 'lili',
    age: 22,
    // [Symbol.iterator]: function () {
    //     let selef = this
    //     let keys = Object.keys(this)
    //     index = 0

    //     return {
    //         next() {
    //             const done = index >= keys.length;
    //             const value = !done ? selef[keys[index++]] : undefined
    //             return {
    //                 value,
    //                 done
    //             }
    //         }
    //     }
    // }
    *[Symbol.iterator]() {
        const self = this;
        const keys = Object.keys(self);
        for (let i = 0; i < keys.length; i++) {
            yield self[keys[i]]
        }
    }
}

for (const item of objI) {
    console.log(item);

}



// 生成器

// Generator  yield 表达式 *

function* test() {
    yield 1
}

console.log(test().next());


// const
//     reDate = /(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})/,
//     match = reDate.exec('2018-04-30'),
//     year = match.groups.year,  // 2018
//     month = match.groups.month, // 04
//     day = match.groups.day;   // 30
// console.log(match, year, month, day);


const
    reDate = /(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})/,
    d = '2018-04-30',
    usDate = d.replace(reDate, '$<month>-$<day>-$<year>');
console.log(reDate, d, usDate);