/**
 * Created by alpersan on 28.06.2017.
 */

$(document).ready(function () {
    var ua = navigator.userAgent;

    if (/Android|webOS|iPad|iPod|BlackBerry|IEMobile|Opera Mini|CriOS & Chrome/i.test(ua)) {
        if (window.confirm("Mobile 'chrome' detected , our product does not work properly on this browser. Please use your phone's default browser.")) {
            window.location.href = '/';
        }
        else {
            alert("Our product does not work properly on this browser , have fun.");
        }
    }
    else if (/Chrome/i.test(ua)) {
        window.onbeforeunload = function () {
            return "You work will be lost.";
        };
    }
    else {
        window.onbeforeunload = function () {
            return "You work will be lost.";
        };
    }
});
var socket = io();
var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");
var strokeColor = "#000";
var strokeWidth = 1;

$(function () {
    $('[data-toggle="popover"]').popover();
});
$(".colorButton").click(function () {  //style button things here---start
    var id = $(this).attr('id');
    strokeColor = id;
    $("#styleButton").css({'background-color': strokeColor});
    if (strokeColor == "#fff" || strokeColor == "#ffff32") {
        $("#styleButton").css({'color': "#343434"});
    } else {
        $("#styleButton").css({'color': "#fff"});
    }
});

$(".strokeWidth").click(function () {
    var px = $(this).attr('id');
    var new_px = px.replace('px', '');
    socket.emit('strokeWidth', new_px);
    console.log("id: " + new_px);
});
socket.on('strokeWidth', function (strokeW) {
    strokeWidth = strokeW;
});

//style button things here---end
var layer = document.getElementById("layer");
var Lcontext = layer.getContext("2d");
mousePressed = false;
var lastX, lastY;
context.textAlign = "center";
guessX = 0; //store user's click on canvas--X
guessY = 0; //store user's click on canvas--Y
var LineLen = 0; // destination between two points--
var panCheck = true;
var rectCheck = false;
var circleCheck = false;
var textCheck = false;
var rectX = 0;
var rectY = 0;
var RStart = false;
var CStart = false;
var TStart = false;
var eraser = false;
var pencil = true;
$(document).bind('touchmove', false);

socket.on('activeUser', function (userNum) {
    $("#activeUser").text("Active User: " + userNum[0]);
});
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(),
        scaleX = canvas.width / rect.width,
        scaleY = canvas.height / rect.height;
    return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
    };
}

$("#pan").click(function () {
    $(document).unbind('touchmove', false);
    panCheck = false;
    rectCheck = false;
    eraser = false;
    circleCheck = false;
    textCheck = false;
    pencil = false;
    RStart = false;
    CStart = false;
    TStart = false;
    $("#canvasContainer").addClass("dragscroll");
    dragscroll.reset();
    $("#myCanvas").css({'cursor': 'url(/images/move.png), default'});
    $('#text').popover('destroy');
});
$("#pencil").click(function () {
    $(document).bind('touchmove', false);
    panCheck = true;
    rectCheck = false;
    eraser = false;
    circleCheck = false;
    textCheck = false;
    pencil = true;
    RStart = false;
    CStart = false;
    TStart = false;
    $("#canvasContainer").removeClass("dragscroll");
    dragscroll.reset();
    $("#myCanvas").css({'cursor': 'url(/images/pencil.png), default'});
    $('#text').popover('destroy');
});
$("#rect").click(function () {
    $(document).bind('touchmove', false);
    rectCheck = true;
    panCheck = true;
    eraser = false;
    circleCheck = false;
    textCheck = false;
    pencil = false;
    RStart = false;
    CStart = false;
    TStart = false;
    $("#canvasContainer").removeClass("dragscroll");
    dragscroll.reset();
    $("#myCanvas").css({'cursor': 'url(/images/rect.png), default'});
    $('#text').popover('destroy');
});
$("#circle").click(function () {
    $(document).bind('touchmove', false);
    rectCheck = false;
    panCheck = true;
    eraser = false;
    circleCheck = true;
    textCheck = false;
    pencil = false;
    RStart = false;
    CStart = false;
    TStart = false;
    $("#canvasContainer").removeClass("dragscroll");
    dragscroll.reset();
    $("#myCanvas").css({'cursor': 'url(/images/circle.png), default'});
    $('#text').popover('destroy');
});
$("#text").click(function () {
    $(document).bind('touchmove', false);
    rectCheck = false;
    panCheck = true;
    eraser = false;
    circleCheck = false;
    textCheck = true;
    pencil = false;
    RStart = false;
    CStart = false;
    TStart = false;
    $("#canvasContainer").removeClass("dragscroll");
    dragscroll.reset();
    $("#myCanvas").css({'cursor': 'url(/images/textPen.png), default'});
    $('#text').popover('show');
});
$("#eraser").click(function () {
    $(document).bind('touchmove', false);
    eraser = true;
    panCheck = true;
    rectCheck = false;
    circleCheck = false;
    textCheck = false;
    pencil = false;
    RStart = false;
    CStart = false;
    TStart = false;
    $("#canvasContainer").removeClass("dragscroll");
    dragscroll.reset();
    $("#myCanvas").css({'cursor': 'url(/images/eraser.png), default'});
    $('#text').popover('destroy');
});


$('#myCanvas').mousedown(function (e) {
    if (panCheck) {
        mousePressed = true;
        var pos = getMousePos(canvas, e);
        if (pencil) {
            dragStart(pos.x, pos.y, false);
        } else if (circleCheck) {
            circleStart(pos.x, pos.y, false);
        } else if (rectCheck) {
            rectStart(pos.x, pos.y, false);
        } else if (textCheck) {
            textStart(pos.x, pos.y, false);
        }
    }
});

$('#myCanvas').mousemove(function (e) {
    if (mousePressed) {
        var pos = getMousePos(canvas, e);
        if (!rectCheck && !circleCheck && !textCheck) {
            dragStart(pos.x, pos.y, true);
            socket.emit('draw', [guessX, guessY, guessX, guessY, ' Drawing']);
        }
    } else if (RStart || CStart) {
        updateLine();
    }
});

$('#myCanvas').mouseup(function (e) {
    mousePressed = false;
});
$('#myCanvas').mouseleave(function (e) {
    mousePressed = false;
});


canvas.addEventListener("touchstart", function (e) {
    mousePos = getTouchPos(canvas, e);
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    if (rectCheck) {
        rectStart(mousePos.x, mousePos.y, false);
    } else if (circleCheck) {
        circleStart(mousePos.x, mousePos.y, false);
    }
    canvas.dispatchEvent(mouseEvent);
}, false);
canvas.addEventListener("touchend", function (e) {
    var mouseEvent = new MouseEvent("mouseup", {});
    canvas.dispatchEvent(mouseEvent);
}, false);
canvas.addEventListener("touchmove", function (e) {
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}, false);
function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY - rect.top
    };
}


var line = new Array();
function updateLine() {  // Updates layer line ---- important!
    Lcontext.beginPath();
    Lcontext.globalCompositeOperation = "destination-out";
    Lcontext.lineWidth = 3;
    Lcontext.moveTo(line[0], line[1]);
    Lcontext.lineTo(line[2], line[3]);
    Lcontext.closePath();
    Lcontext.stroke();

    Lcontext.beginPath();
    Lcontext.globalCompositeOperation = "source-over";
    Lcontext.lineWidth = 1;
    Lcontext.moveTo(rectX, rectY);
    Lcontext.lineTo(guessX, guessY);
    Lcontext.closePath();
    line[0] = rectX;
    line[1] = rectY;
    line[2] = guessX;
    line[3] = guessY;
    Lcontext.stroke();
}

function rectStart(x, y, move) {

    if (!move) {
        if (RStart) {
            socket.emit('rect', [0, 0, 0, 0]);
            context.strokeStyle = strokeColor;
            context.lineWidth = strokeWidth;
            context.rect(rectX, rectY, x - rectX, y - rectY);
            socket.emit('rect', [rectX, rectY, x - rectX, y - rectY, strokeColor, strokeWidth]);
            context.stroke();
            rectX = 0;
            rectY = 0;
            RStart = false;

            Lcontext.beginPath();
            Lcontext.globalCompositeOperation = "destination-out";
            Lcontext.lineWidth = 3;
            Lcontext.moveTo(line[0], line[1]);
            Lcontext.lineTo(line[2], line[3]);
            Lcontext.closePath();
            Lcontext.stroke();
        } else {
            rectX = x;
            rectY = y;
            RStart = true;
        }
    }
}

function circleStart(x, y, move) {
    if (!move) {
        if (CStart) {
            context.beginPath();
            socket.emit('circle', [0, 0, 0]);
            context.strokeStyle = strokeColor;
            context.lineWidth = strokeWidth;
            LineLen = Math.sqrt(Math.pow(rectX - x, 2) + Math.pow(rectY - y, 2));
            context.arc((rectX + x) / 2, (rectY + y) / 2, LineLen / 2, 0, 2 * Math.PI);
            socket.emit('circle', [(rectX + x) / 2, (rectY + y) / 2, LineLen / 2, strokeColor, strokeWidth]);
            context.closePath();
            context.stroke();
            rectX = 0;
            rectY = 0;
            CStart = false;

            Lcontext.beginPath();
            Lcontext.globalCompositeOperation = "destination-out";
            Lcontext.lineWidth = 3;
            Lcontext.moveTo(line[0], line[1]);
            Lcontext.lineTo(line[2], line[3]);
            Lcontext.closePath();
            Lcontext.stroke();
        } else {
            rectX = x;
            rectY = y;
            CStart = true;
        }
    }
}


function textStart(x, y, move) {
    if (!move) {
    if(TStart){
        socket.emit('text', [0, 0,"",""]);
        context.beginPath();
        context.font = "30px Arial";
        context.fillStyle = strokeColor;
        var getText = $("#textInput").val();
        var text = "";
        if(getText=="" || getText==undefined){
            text = "ApDraw v2.0";
        }else{
            text = getText;
        }

        context.fillText(text,rectX,rectY);
        socket.emit('text',[rectX,rectY,text,strokeColor]);
        context.closePath();
        context.stroke();

        rectX = 0;
        rectY = 0;
        TStart = false;
    }else {
        rectX = x;
        rectY = y;
        TStart = true;
    }
    }
}
function textInfo() {
   $("#textInfo").text("Now click somewhere twice!.");
}

function dragStart(x, y, isDown) {
    var socket = io();
    if (isDown) {
        if (eraser) {
            socket.emit('erase', [0, 0]);
            context.globalCompositeOperation = "destination-out";
            context.beginPath();
            context.arc(guessX, guessY, 8, 0, Math.PI * 2);
            context.fill();
            context.closePath();
            socket.emit('erase', [guessX, guessY]);
        } else {
            socket.emit('draw', [0, 0, 0, 0, ""]);
            context.globalCompositeOperation = "source-over";
            context.strokeStyle = strokeColor;
            context.lineWidth = strokeWidth;
            context.beginPath();
            context.lineJoin = "round";
            context.moveTo(lastX, lastY);
            context.lineTo(x, y);

            socket.emit('draw', [lastX, lastY, x, y, strokeColor, strokeWidth]);
            context.closePath();
            context.stroke();
        }
    }
    lastX = x;
    lastY = y;

}
socket.on('erase', function (coor) {
    var lastXE = coor[1];
    var lastYE = coor[2];
    context.globalCompositeOperation = "destination-out";
    context.arc(lastXE, lastYE, 8, 0, Math.PI * 2);
    context.fill();
});
socket.on('draw', function (msg) {
    var guestX = msg[0];
    var guestY = msg[1];
    var guestXX = msg[2];
    var guestYY = msg[3];
    var guestColor = msg[4];
    var guestWidth = msg[5];

    context.beginPath();
    context.globalCompositeOperation = "source-over";
    context.strokeStyle = guestColor;
    context.lineWidth = guestWidth;
    context.lineJoin = "round";
    context.moveTo(guestX, guestY);
    context.lineTo(guestXX, guestYY);
    context.closePath();
    context.stroke();
});
socket.on('rect', function (coor) {

    var x1 = coor[0];
    var y1 = coor[1];
    var xh = coor[2];
    var yw = coor[3];
    var guestColor = coor[4];
    var guestWidth = coor[5];

    context.beginPath();
    context.strokeStyle = guestColor;
    context.lineWidth = guestWidth;
    context.rect(x1, y1, xh, yw);
    context.closePath();
    context.stroke();

});
socket.on('circle', function (coor) {

    var x1 = coor[0];
    var y1 = coor[1];
    var len = coor[2];
    var guestColor = coor[3];
    var guestWidth = coor[4];

    context.beginPath();
    context.strokeStyle = guestColor;
    context.lineWidth = guestWidth;
    context.arc(x1, y1, len, 0, 2 * Math.PI);
    context.closePath();
    context.stroke();

});
socket.on('text',function (coor) {
var c1 = coor[0];
var c2 = coor[1];
var guestText = coor[2];
var guestColor = coor[3];
context.beginPath();
context.font = "30px Arial";
context.fillStyle = guestColor;
context.fillText(guestText,c1,c2);
context.closePath();
context.stroke();
});

function storeGuess(e) {
    var pos = getMousePos(canvas, e);
    var x = pos.x;
    var y = pos.y;
    guessX = Math.floor(x);
    guessY = Math.floor(y);
    document.getElementById("xCoor").innerHTML = "X: " + guessX;
    document.getElementById("yCoor").innerHTML = "Y: " + guessY;
    var socket = io();
    socket.emit('draw', [guessX, guessY, guessX, guessY, 'moving']);
}

$("#clearCanvas").click(function () {
    var socket = io();
    socket.emit('clearCanvas', "Canvas is cleared!");
});

socket.on('clearCanvas', function (clear) {

    if (clear[1] <= 2) {
        if (clear[1] == 0) {
            $("#CTimer").text("");
            console.log(clear[0] + "--" + clear[1]);
        } else {
            $("#CTimer").text("- " + clear[1]);
            console.log(clear[0] + "--" + clear[1]);
        }
    } else {
        $("#CTimer").text("- " + clear[1]);
        context.clearRect(0, 0, canvas.width, canvas.height);
        $("#clcInfo").text(clear[0]).fadeIn().fadeOut(4000);
        console.log(clear[0] + "--" + clear[1]);
    }
});


// DRAG SCROLL
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.dragscroll = {}));
    }
}(this, function (exports) {
    var _window = window;
    var _document = document;
    var mousemove = 'mousemove';
    var mouseup = 'mouseup';
    var mousedown = 'mousedown';
    var EventListener = 'EventListener';
    var addEventListener = 'add' + EventListener;
    var removeEventListener = 'remove' + EventListener;
    var newScrollX, newScrollY;

    var dragged = [];
    var reset = function (i, el) {
        for (i = 0; i < dragged.length;) {
            el = dragged[i++];
            el = el.container || el;
            el[removeEventListener](mousedown, el.md, 0);
            _window[removeEventListener](mouseup, el.mu, 0);
            _window[removeEventListener](mousemove, el.mm, 0);
        }

        // cloning into array since HTMLCollection is updated dynamically
        dragged = [].slice.call(_document.getElementsByClassName('dragscroll'));
        for (i = 0; i < dragged.length;) {
            (function (el, lastClientX, lastClientY, pushed, scroller, cont) {
                (cont = el.container || el)[addEventListener](
                    mousedown,
                    cont.md = function (e) {
                        if (!el.hasAttribute('nochilddrag') ||
                            _document.elementFromPoint(
                                e.pageX, e.pageY
                            ) == cont
                        ) {
                            pushed = 1;
                            lastClientX = e.clientX;
                            lastClientY = e.clientY;

                            e.preventDefault();
                        }
                    }, 0
                );

                _window[addEventListener](
                    mouseup, cont.mu = function () {
                        pushed = 0;
                    }, 0
                );

                _window[addEventListener](
                    mousemove,
                    cont.mm = function (e) {
                        if (pushed) {
                            (scroller = el.scroller || el).scrollLeft -=
                                newScrollX = (-lastClientX + (lastClientX = e.clientX));
                            scroller.scrollTop -=
                                newScrollY = (-lastClientY + (lastClientY = e.clientY));
                            if (el == _document.body) {
                                (scroller = _document.documentElement).scrollLeft -= newScrollX;
                                scroller.scrollTop -= newScrollY;
                            }
                        }
                    }, 0
                );
            })(dragged[i++]);
        }
    };


    if (_document.readyState == 'complete') {
        reset();
    } else {
        _window[addEventListener]('load', reset, 0);
    }

    exports.reset = reset;
}));