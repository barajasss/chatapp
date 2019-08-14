var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var connections = 0;
var users = [];

app.use(express.static(__dirname+'/public'));

app.get('/', (req, res)=>{
    res.sendFile('/index.html');
});


//socket connection

io.on('connection', (socket)=>{
    connections++;
    socket.on('user_join', (username)=>{
        users.push({
            'username': username,
            'socketId': socket.id
        });
        //show the users
        io.emit('show_users', users.map(val=>val.username));
        socket.broadcast.emit('user_joined', username);
        io.emit('update_online', connections);
    });
    socket.on('chat_message', (msg)=>{
        socket.broadcast.emit('show_message', msg);
    })
    socket.on('typing', (msg)=>{
        console.log(msg);
        socket.broadcast.emit('show_typing', msg);
    })
    socket.on('remove_typing', ()=>{
        socket.broadcast.emit('hide_typing');
    })
    socket.on('disconnect', ()=>{
        connections--;
        io.emit('update_online', connections);
        //find the username who exited
        //this filter functions returns an array with one element if true
        var username = users.filter(val=>{
            if(val.socketId == socket.id){
                return true;
            }
        })
        //if there is an element in array
        if(username.length > 0){
            username = username[0].username;
        }

        //now remove the username and socket id of that user
        users = users.filter(val=>{
            if(val.socketId != socket.id){
                return true;
            }
        });
        //update the view
        io.emit('show_users', users.map(val=>val.username));

        console.log('users.length: '+users.length);
        socket.broadcast.emit('exit_user', username);
    })
})


http.listen(process.env.PORT||3000, ()=>{
    console.log('listening at http://localhost:3000');
});