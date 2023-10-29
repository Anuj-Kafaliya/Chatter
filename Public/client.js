const socket = io();

const params = new URLSearchParams(window.location.search)
const username = params.get('username');
const room = params.get('room');

const textMessage = document.querySelector('.text-message');
const inbox = document.querySelector('.inbox');
const profile = document.querySelector('.profile');
const chatBox = document.querySelector('.chat-box');
const popup = document.querySelector('.popup');
const popupText = document.querySelector('.popup-text');
const roomName = document.querySelector('.room-name');
const leaveRoomBtn = document.querySelector('.leave-button');
const sendBtn = document.querySelector('.send-button');
const typingText = document.querySelector('.typing-text');

roomName.innerText= room;
profile.innerText = 'Hi ' + username;

socket.emit('joinRoom',{username, room});

textMessage.addEventListener('keydown',(event) =>{
   const message = event.target.value.trim();
   if(event.key !== 'Enter'){
      socket.emit('typing', `${username} is typing...`);
   }
   else if(event.key === 'Enter' && message.length != 0){
      sendMessage(message);
      socket.emit('typing-stopped');
      textMessage.value = "";
      scrollToBottom();
   }
});

sendBtn.addEventListener('click',() =>{
   const message = textMessage.value.trim();
   if(message.length != 0){
      sendMessage(message);
      socket.emit('typing-stopped');
      textMessage.value = "";
      scrollToBottom();
   }
});

const sendMessage = (message) => {
   const msg = {
      user: username,
      message: message
   }

   appendMessage(msg, 'outgoing');

   socket.emit('message', msg, (response) => {
      console.log(response);
   });
}

const appendMessage = (msg, type) => {
   const addMessageBox = document.createElement('div');
   const className = type;
   addMessageBox.classList.add(`${className}-message`,'message');
   const helperTextMsg = type === 'incoming'? 'received' : 'sent';

   const markup = `
      <h4>${msg.user}</h4>
      <p>${msg.message}</p>
      <p class="helper-text">${helperTextMsg}</p>
   `
   addMessageBox.innerHTML = markup;
   inbox.appendChild(addMessageBox);
}

popup.addEventListener('click',(event) => {
   popup.classList.toggle("show");
})

socket.on('users',(msg)=>{
   popupText.innerText = msg;
   console.log(msg);
})

//Get room users
socket.on('roomUsers',(users) => {
   outputUsers(users)
})

//typing message
socket.on('typing',(msg) => {
   typingText.innerText = msg;
})

socket.on('typing-stopped',() =>{
   typingText.innerText = "";
})
//leave the room
leaveRoomBtn.addEventListener('click',() => {
   const leaveRoom = confirm('Are you sure you want to leave the chatroom??');
   if(leaveRoom){
      window.location = '/'
   }
})

function outputUsers(users) {
   console.log(users);
   users.users.forEach((user) => {
     console.log(user)
     const li = document.createElement('li');
     li.innerText = user.username;
     popupText.appendChild(li);
   });
 }

//Receiving message 
socket.on('message',(msg) => {
   appendMessage(msg, 'incoming');
   scrollToBottom();
})

//welcome user
socket.on('welcome-user',(msg) => {
   console.log(msg);
})

//new user
socket.on('new-user',(msg)=> {
   console.log(msg);
})

//Disconnection message
socket.on('disconnect-message', (msg)=>{
   console.log(msg);
})


const scrollToBottom = () =>{
   chatBox.scrollTop = chatBox.scrollHeight;
}

