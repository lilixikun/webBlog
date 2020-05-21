const worker = new Worker('./worker.js')

worker.postMessage('hello I am worker')
worker.onmessage = function (e) {
    console.log(e.data);
}