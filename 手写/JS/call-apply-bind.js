

Function.prototype.myCall = function (thisArg, ...args) {
    if (typeof this !== 'function') {
        throw new TypeError("error")
    }
    const fn = new Symbol()
    thisArg = thisArg || window

    thisArg[fn] = this

    const res = thisArg[fn](...args)
    delete thisArg[fn]

    return res
}

Function.prototype.myApply = function (thisArg) {
    if (typeof this !== 'function') {
        throw new TypeError("error")
    }
    const fn = new Symbol()
    thisArg = thisArg || window

    thisArg[fn] = this
    const res = thisArg[fn](...arguments[1])

    delete thisArg[fn]
    return res
}

