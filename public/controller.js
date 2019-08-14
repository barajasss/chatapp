
var form = document.getElementById('form');
var input = document.getElementById('input');
var chatArea = document.getElementById("chat-area");
var onlineDisplay = document.getElementById('online-display');
var usersDisplay = document.getElementById('list');
var statusEl = document.getElementById('status');
var socket = io();

//get the username and display it.
var username = filter(prompt('Enter your nickname: '));
username = (username!="")?username: 'Anonymous';
joinMessage("You joined the chat as '"+username+"'");
socket.emit('user_join', username);
statusEl.innerHTML = "You: "+username;


form.addEventListener("submit", function(e){
    e.preventDefault();
    var msg = '<strong>You:</strong> '+input.value;
    var msg2 = '<strong>'+username+':</strong> '+input.value;
    socket.emit('chat_message', msg2);
    //show own messages on right
    addMessage(msg);
    input.value = "";
}, false);

document.addEventListener('keydown', (e)=>{
    var msg = "'" + username + "' is typing...'";
    //if input is empty
    if(input.value == ""){
        socket.emit('remove_typing');
    }
    else{
        socket.emit('typing', msg);
    }
}, false);



//various socket event listeners

socket.on('user_joined', (username)=>{
    joinMessage((username == 'Anonymous'?'Someone':username) + ' joined the chat');
})
socket.on('show_message', (msg)=>{
    //show other's messages on the left
    addMessage(msg, 'left');
    //remove the 'someone is typing...' message
    resetStatusEl();
});
socket.on('show_typing', (msg)=>{
    console.log(msg);
    statusEl.innerHTML = msg;
});
socket.on('hide_typing', ()=>{
    resetStatusEl();
})
socket.on('update_online', (connections)=>{
    onlineDisplay.innerHTML = connections;
});
socket.on('show_users', (users)=>{
    list.innerHTML = "";
    for(var i=0; i<users.length; i++){
        var li = document.createElement('li');
        li.innerHTML = users[i];
        li.setAttribute('class', 'list-group-item');
        list.appendChild(li);
    }
})
socket.on('exit_user', (username)=>{
    var msg  = "'" + username + "' has left the chat";
    exitMessage(msg);
})
















//utility functions


function joinMessage(msg){
    addMessage(msg, 'center');
}
function exitMessage(msg){
    addMessage(msg, 'center', 1);
}

function addMessage(msg, dir = 'right', exit=0){
    var msgEl = document.createElement('p');
    msgEl.innerHTML = msg;
    if(dir == 'left'){
        msgEl.setAttribute('class', 'bg-secondary text-white p-1 rounded');
        msgEl.setAttribute('style', 'float: left; clear: both; max-width: 50%; height: auto;');
    }
    else if(dir == 'right'){
        msgEl.setAttribute('class', 'bg-primary text-white p-1 rounded');
        msgEl.setAttribute('style', 'float: right; clear: both; max-width: 50%; height: auto; margin-right: 20px');
    }
    else if(dir == 'center'){
        if(exit){
            msgEl.setAttribute('class', 'bg-danger text-center text-white p-1 rounded');
            msgEl.setAttribute('style', 'clear: both; border: 2px solid white; display: block; max-width: 70%; height: auto; margin: 0 auto; margin-bottom: 30px;');
        }
        else{
            msgEl.setAttribute('class', 'bg-success text-center text-white p-1 rounded');
            msgEl.setAttribute('style', 'clear: both; border: 2px solid white; display: block; max-width: 70%; height: auto; margin: 0 auto; margin-bottom: 30px;');
        }
    }
    chatArea.appendChild(msgEl);
}

function filter(name){
    name = name.replace(/[*<>?.,="']/, '');
    if(name.length > 10){
        name = name.substr(0, 10)+'... ';
    }
    return name;
}
function resetStatusEl(){
    statusEl.innerHTML = 'You: '+username;
}