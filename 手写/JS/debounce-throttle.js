
Function.prototype.debounce = function (fn, wait = 1000) {
    let timer;
    return function () {
        if (timer) {
            clearTimeout(timer)
            timer = null
        }
        timer = setTimeout(() => {
            fn.apply(this, arguments)
        }, wait);
    }
}

Function.prototype.throttle = function (fn, wait) {
    let prev = new Date()
    return function () {
        let now = new Date()
        if (now - prev > wait) {
            fn.apply(this, arguments)
            prev = new Date()
        }
    }
}