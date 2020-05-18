
interface Person {
    name: string,

    [propName: string]: string | number
}

let tom: Person = {
    name: 'Tom',
    age: 25,
    gender: 'male'
}

let arr: number[] = [1, 2, 33]

let arr1: Array<number | string> = [1, 2, 3, '5']


// 上边是声明
function add(arg1: string, arg2: string): string
function add(arg1: number, arg2: number): number
// 因为我们在下边有具体函数的实现，所以这里并不需要添加 declare 关键字

// 下边是实现
function add(arg1: string | number, arg2: string | number) {
    // 在实现上我们要注意严格判断两个参数的类型是否相等，而不能简单的写一个 arg1 + arg2
    if (typeof arg1 === 'string' && typeof arg2 === 'string') {
        return arg1 + arg2
    } else if (typeof arg1 === 'number' && typeof arg2 === 'number') {
        return arg1 + arg2
    }
}