require('dotenv').config();

global.argv = process.argv.slice(2);
global.listeningPort = global.argv[0] || process.env.PORT;
if(!global.listeningPort){
    console.log('Port is not defined. argv = ', global.argv);
    process.exit(128);
}

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(http);
const {util} = require('./lib')

app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, "Public"), {}));

app.use('/',require('./routes/index'));

http.listen(global.listeningPort,() => {
    console.log(`Listening on port ${global.listeningPort}`);
});

io.on('connection',(socket) => {
    console.log('connected');
    socket.on('joinRoom',({username,room}) => {
        const user = util.userJoin(socket.id, username, room);
        socket.join(user.room);
        socket.emit('welcome-user','Welcome to chatter');

        socket.to(user.room).emit("new-user",`${user.username} has joined the room`);

        io.to(user.room).emit("roomUsers",{
            room: user.room,
            users: util.getRoomUsers(user.room)
        });

        socket.on('typing',(msg) => {
            socket.broadcast.to(user.room).emit('typing', msg);
        })

        socket.on('typing-stopped',() => {
            socket.broadcast.to(user.room).emit('typing-stopped');
        })
        socket.on('message', (msg,cb) => {
            socket.broadcast.to(user.room).emit('message', msg);
            cb('message received at server side');
        });
    
        socket.on('disconnect', ()=>{
            console.log('disconnected....');
            const user = util.userLeave(socket.id);

            socket.broadcast.to(user.room).emit('disconnect-message',`${user.username} has left the chat`);

            io.to(user.username).emit("roomUsers",{
                room: user.room,
                users: util.getRoomUsers(user.room)
            })
        });
    })   
})