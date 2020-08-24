```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <div>
        <video id="video"></video>
    </div>
    <script type="module">
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
                width: { min: 1024, ideal: 1280, max: 1920 },
                height: { min: 576, ideal: 720, max: 1080 },
                frameRate: { max: 30 }
            }
        }).then(stream => {
            console.log(stream);
            var video = document.querySelector('video')
            video.srcObject = stream
            video.onloadedmetadata = function (e) {
                console.log(e);
                video.play();
            }
        })
    </script>
</body>

</html>
```