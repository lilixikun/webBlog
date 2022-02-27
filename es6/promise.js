// 红灯三秒亮一次，绿灯一秒亮一次，黄灯2秒亮一次，意思就是3秒，执行一次 red 函数，2秒执行一次 green 函数，1秒执行一次 yellow 函数，不断交替重复亮灯，
// 意思就是按照这个顺序一直执行这3个函数，这步可以就利用递归来实现。


function red() {
  console.log('red');
}
function green() {
  console.log('green');
}
function yellow() {
  console.log('yellow');
}

function sleep(fn, timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      fn()
      resolve()
    }, timeout);
  })
}

function start() {
  return Promise.resolve().then(() => {
    return sleep(red, 1000)
  }).then(() => {
    return sleep(green, 2000)
  }).then(() => {
    return sleep(yellow, 3000)
  }).then(() => {
    start()
  })
}

start()