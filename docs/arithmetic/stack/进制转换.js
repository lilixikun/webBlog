// 实现一个十进制转换为二进制

function declimaToBinary(num) {
    const stack = new Stack();
    let rem;
    while (num > 0) {
        rem = Math.floor(num % 2);
        stack.push(rem)
        num = Math.floor(num / 2)
    }
    let binaryString = ''
    while (!stack.isEmpty()) {
        binaryString += stack.pop().toString()
    }
    return binaryString
}

console.log(declimaToBinary(10));
console.log(declimaToBinary(5));
console.log(declimaToBinary(100));

function baseConverter(num, base) {
    if (!(base >= 2 && base <= 36)) {
        return ''
    }
    const stack = new Stack()
    const digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let rem;
    let baseString = '';
    while (num > 0) {
        rem = Math.floor(num % base)
        stack.push(rem);
        num = Math.floor(num / base);
    }
    while (!stack.isEmpty()) {
        baseString += digits[stack.pop()]
    }
    return baseString;
}

console.log(baseConverter(31, 16));