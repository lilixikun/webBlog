let numbers = [0, 1, 2, 3, 4, 5]
numbers[numbers.length] = 6

numbers.push(7, 8)

// 开头插入元素

Array.prototype.insertFirstPosition = function (value) {
    for (let i = this.length; i >= 0; i--) {
        this[i] = this[i - 1]
    }
    this[0] = value
}

numbers.insertFirstPosition(-1)

numbers.unshift(-2)

numbers.pop();


// 删除 undefined 元素
Array.prototype.reIndex = function (myArray) {
    const newArray = []
    for (let i = 0; i < myArray.length; i++) {
        if (myArray[i] != undefined) {
            newArray.push(myArray[i])
        }
    }
    return newArray
}

// 手动移除第一个元素
Array.prototype.removeFirstPosition = function () {
    for (let i = 0; i < this.length; i++) {
        this[i] = this[i + 1]
    }
    return this.reIndex(this)
}

numbers.removeFirstPosition()

console.log(numbers);


let averageTemp = [];
averageTemp[0] = [72, 75, 79, 79, 81, 81];
averageTemp[1] = [81, 79, 75, 75, 73, 73];

console.log(averageTemp)

function printMatrix(myMatrix) {
    for (let i = 0; i < myMatrix.length; i++) {
        for (let j = 0; j < myMatrix[i].length; j++) {
            console.log(myMatrix[i][j]);
        }
    }
}
printMatrix(averageTemp)

for (const item of numbers) {
    console.log(item);
}

let iterator = numbers[Symbol.iterator]()
console.log(iterator.next().value);
console.log(iterator.next().value);
console.log(iterator.next().value);
console.log(iterator.next().value);

for (const item of iterator) {
    console.log(item);
}

console.log('-------------------------------------')

let copyArray = [1, 2, 3, 4, 5, 6];
copyArray.copyWithin(0, 3)


console.log(copyArray);
