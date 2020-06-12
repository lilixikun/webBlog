function bubbleSort(array) {
    const { length } = array
    for (let i = 0; i < length; i++) {
        for (let j = 0; j < length - 1; j++) {
            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]]
            }
        }
    }
    return array
}

function modifiedBubbleSort(array) {
    const { length } = array
    for (let i = 0; i < length; i++) {
        for (let j = 0; j < length - 1 - i; j++) {
            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]]
            }
        }
    }
    return array
}

function createNonSortedArray(size) {
    const array = [];
    for (let i = size; i > 0; i--) {
        array.push(i);
    }
    return array;
}

// 选择排序
function selectionSort(array) {
    const { length } = array
    let indexMin
    for (let i = 0; i < length; i++) {
        indexMin = i
        for (let j = i + 1; j < length; j++) {
            if (array[indexMin] > array[j]) {
                indexMin = j
            }
        }
        if (i !== indexMin) {
            [array[i], array[indexMin]] = [array[indexMin], array[i]]
        }
    }
    return array
}


// 插入排序
function insertionSort(array) {
    const { length } = array
    for (let i = 1; i < length; i++) {
        let j = i
        let tem = array[i]
        while (j > 0 && array[j - 1] > tem) {
            array[j] = array[j - 1]
            j--
        }
        array[j] = tem
    }
    return array
}


// 归并排序
function mergeSort(array) {
    const { length } = array
    if (length <= 1) {
        return array
    }
    const middle = Math.floor(length / 2)
    const left = mergeSort(array.slice(0, middle))
    const right = mergeSort(array.slice(middle, right))

    array = merge(left, right)
    return array
}

function merge(left, right) {
    let i = 0, j = 0;
    const result = []
    while (i < left.length && j < right.length) {
        result.push(left[i] < right[i] ? left[i] : right[i])
    }
    return result.concat(i < left.length ? left.slice(i) : right.slice(j))
}


// 快速排序
function quickSort(arr) {
    if (arr.length <= 1) {
        return arr
    }
    var mind = Math.floor(arr.length / 2)
    var mid = arr.splice(mind, 1)
    var left = []
    var right = []
    for (var i = 0; i < arr.length; i++) {
        var cur = arr[i]
        if (cur < mid) {
            left.push(cur)
        } else {
            right.push(cur)
        }
    }
    return quickSort(left).concat(mid, quickSort(right))
}

let array = createNonSortedArray(5);
console.log(array.join());
// array = bubbleSort(array);
// console.log(array);
// console.log(modifiedBubbleSort(array));
console.log(selectionSort(array));
console.log(quickSort(array));

