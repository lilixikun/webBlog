
class Functor {
    constructor(val) {
        this.val = val
    }
    map(f) {
        console.log(111);

        return new Functor(f(this.val))
    }
}

Functor.of = function (val) {
    return new Functor(val)
}

// Functor.of(2).map(function (tow) {
//     return tow + 2
// })

// Functor.of(null).map(function (s) {
//     return s.toUpperCase()
// })

class Maybe extends Functor {

    map(f) {
        return this.val ? Maybe.of(f(this.val)) : Maybe.of(null)
    }
}

Maybe.of = function (val) {
    return new Maybe(val)
}

Maybe.of(null).map(function (s) {
    return s.toUpperCase()
})


// Either 错误处理
class Either extends Functor {
    constructor(left, right) {
        super()
        this.left = left;
        this.right = right
    }

    map(f) {
        return this.right ? Either.of(this.left, f(this.right)) : Either.of(f(this.left), this.right)
    }
}

Either.of = function (left, right) {
    return new Either(left, right)
}

var addOne = x => x + 1
var eith = Either.of(5, 6).map(addOne)  // Either { val: undefined, left: 5, right: 7 }

Either.of(1, null)
