var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var express = require('express');
var path = require('path');
var fs = require('fs');
var activeUser = 0;
var maxActiveUser = 0;
var canvasCleaned=0;
var clearTimer = -1;
var clearTimerSec = 3;

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', function (socket) {

     var tmr;
    var hh=0;
    var mm=0;
    var ss=0;
    var allT;
    socket.on('timer',function (time) {
        if(time=="stop"){
            clearInterval(tmr);
        }else{
            allT = time*60;
            tmr =  setInterval(function () {
                if(allT>0){
                    ss = allT%60;
                    mm = Math.floor(allT/60);
                    hh = Math.floor(allT/3600);
                    if(mm==60){mm=0;}else if(mm>60){
                        mm = Math.floor(allT/60) - hh*60 ;
                    }
                    allT--;
                }else if(ss==0 && mm==0 && hh ==0){
                    clearInterval(tmr);
                    control=0;
                }
                io.emit('timer', [hh,mm,ss]);
            },1000);
        }
    });
     socket.on('clearCanvas' , function (clear) {
            if(clearTimer==-1){
                canvasCleaned++;
                io.emit('clearCanvas' , [clear,3,canvasCleaned]);
                clearTimer=3000;
                clearTimerSec=3;
            }

            if(clearTimer==3000){
                clearTimer=clearTimer-1;
                var CTInterval= setInterval(function () {
                    if(clearTimer>0){
                        clearTimerSec--;
                        clearTimer=clearTimer-1000;
                        console.log(clearTimerSec + " --  " + clearTimer);
                        io.emit('clearCanvas' , ["",clearTimerSec,canvasCleaned]);
                    }else if(clearTimerSec==0){
                        clearInterval(CTInterval);
                    }
                },clearTimer);
            }
        });
           socket.on('strokeWidth', function (strokeWidth) {
        if(strokeWidth=="1" || strokeWidth=="4" || strokeWidth=="6" || strokeWidth=="10"){
            io.emit('strokeWidth' , strokeWidth);
        }else{
            console.log("+Log: ---- Someone is trying to change stroke width!!");
        }
    });
       socket.on('draw' , function (msg) {
    io.emit('draw' , msg);
    });
      socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });


    socket.on('rect', function (coor) {
        io.emit('rect',coor);
    });
     socket.on('circle', function (coor) {
        io.emit('circle',coor);
    });
    socket.on('text', function (coor) {
        io.emit('text',coor);
    });
    socket.on('erase' , function (coor) {
        io.emit('erase' , coor);
    });
    // active user
    activeUser++;
    if(activeUser>maxActiveUser){
        maxActiveUser=activeUser;
    }
    console.log("+-a user connected!" + "--"+activeUser);
    io.emit('activeUser',[activeUser,maxActiveUser]);
    socket.on('disconnect',function () {
        activeUser--;
        io.emit('activeUser',[activeUser,maxActiveUser]);
        console.log("+-a user disconnected" + "--"+activeUser);
    });
    // active user
    socket.on('sInfo',function (sInfo) {
        io.emit('sInfo',[port,canvasCleaned]);
    });



});



// io.on('connection',function (socket) {
//     socket.on('fanControl',function (fan) {
//     fs.writeFile('/home/pi/Desktop/ApDrawServer/ControlFan',fan,function (err) {
//         if(err){
//             return console.log(err);
//         }
//     });
//     });
// });
// io.on('connection',function (socket) {
//     socket.on('emergency',function (fan) {
//         fs.writeFile('/home/pi/Desktop/ApDrawServer/Emergency',fan,function (err) {
//             if(err){
//                 return console.log(err);
//             }
//         });
//     });
// });
// io.on('connection', function (socket) {
// setInterval(function () {
//     fs.readFile('/sys/class/thermal/thermal_zone0/temp','utf8',function (err,data) {
//         if(err){
//             console.log(err);
//         }else {
//             var temp= Math.round((data/1000)*100)/100;
//             io.emit('CPUTemp',temp);
//         }
//     });
//     fs.readFile('/home/pi/Desktop/ApDrawServer/ApDrawLog','utf8',function (err,log) {
//         if(err){
//             console.log(err);
//         }else {
//             io.emit('AdminLog',log);
//         }
//     });
//     fs.readFile('/home/pi/Desktop/ApDrawServer/cpu','utf8',function (err,cpu) {
//         if(err){
//             console.log(err);
//         }else {
//             io.emit('cpu',cpu);
//         }
//     });
//     fs.readFile('/home/pi/Desktop/ApDrawServer/FanStat','utf8',function (err,stat) {
//         if(err){
//             console.log(err);
//         }else {
//             io.emit('fanStat',stat);
//         }
//     });
//     fs.readFile('/home/pi/Desktop/ApDrawServer/FanSpeed','utf8',function (err,speed) {
//         if(err){
//             console.log(err);
//         }else {
//             io.emit('fanSpeed',speed);
//         }
//     });
// },1000);
// });

http.listen(port, function(){
  console.log('ApDraw is listening on *:' + port);
});
