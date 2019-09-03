$(document).ready(() => {
    const API_URL = 'https://alpharecognizer-backend.herokuapp.com';
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    addBgToCanvas();

    let paint = false;
    let clickX = [];
    let clickY = [];
    let clickDrag = [];

    let sent = false;
    // send image to server every 5 seconds if something is on the canvas
    setInterval(() => {
        if (!isCanvasBlank() && !sent && !paint) {
            updateResult('Analyzing...');
            console.log(canvas.toDataURL());
            sendImageToServer();
            sent = true;
        }
    }, 5000)

    $('#canvas').mousedown((e) => {
        sent = false;
        paint = true;
        addClick(e.offsetX, e.offsetY, false);
        redraw();
    });

    $('#canvas').mousemove((e) => {
        if (paint) {
            addClick(e.offsetX, e.offsetY, true);
            redraw();
        }
    });

    $('#canvas').mouseup((_) => {
        paint = false;
    });

    $('#canvas').mouseleave((_) => {
        paint = false;
    });

    function isCanvasBlank() {
        return !ctx.getImageData(0, 0, canvas.width, canvas.height).data
                .some((channel, index) => {
                    if (index % 4 !== 3) return channel !== 0;
                    return false;
                });
    }

    function addClick(x, y, dragging) {
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
    }

    function redraw() {
        ctx.strokeStyle = "#ffffff";
        ctx.lineJoin = "round";
        ctx.lineWidth = 5;

        for (let i = 0; i < clickX.length; i++) {
            ctx.beginPath();
            if (clickDrag[i] && i) {
                ctx.moveTo(clickX[i - 1], clickY[i - 1]);
            }
            else {
                ctx.moveTo(clickX[i] - 1, clickY[i]);
            }
            ctx.lineTo(clickX[i], clickY[i]);
            ctx.closePath();
            ctx.stroke();
        }
    }

    function addBgToCanvas() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, $('#canvas').width(), $('#canvas').height());
    }

    $('#clear').click((_) => {
        addBgToCanvas();
        clickX = [];
        clickY = [];
        clickDrag = [];
    });

    function sendImageToServer() {
        const dataUrl = canvas.toDataURL();
        axios({
            method: 'post',
            url: API_URL + '/predict',
            data: {
                image: dataUrl
            },
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((resp) => {
            console.log(resp);
            const letter = resp.data['class']
            updateResult("Letter Drawn: " + letter)
        }).catch((e) => {
            updateResult("Error with server. Try again later.");
            console.log(e);
        })
    }

    function updateResult(text) {
        $('#res').text(text);
    }
});