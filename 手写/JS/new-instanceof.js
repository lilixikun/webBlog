
Function.prototype.myNew = function (fn, ...args) {
    const obj = Object.create(fn.prototype)
    const res = fn.apply(obj, args)
    return typeof res === 'object' ? res : obj
}


Function.prototype._instanceof = function (L, R) {
    let l = L.__propto__;
    let r = R.prototype
    while (true) {
        if (l === null) return false
        if (l === r) return true
        l = l.__propto__
    }
}