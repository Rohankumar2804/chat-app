const express=require('express');
const path=require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter=require('bad-words')
const {generateMessage,generateLocationMessage}=require('./utils/messages')
const{getUser,getUsersInRoom, addUser, removerUser}=require('./utils/users')
//rX3q106PQeAycT_tLmlnzA
const app=express();

const server=http.createServer(app);//ccreating server outside of express
const io=socketio(server);// our server support websocket
const port=process.env.PORT||3000
// serve up public directory
const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

//let count=0;
// server(emit) ->client(recieve) -countUpdated
//client(emit) ->server(recieve) -increment
io.on('connection',(socket)=>{
    console.log('new websocket connection');
   
     socket.on('join',({username,room},callback)=>{
         const {error,user}=addUser({id:socket.id,username,room}); 

        if(error){
            return callback(error);
        }

         socket.join(user.room);//only in same room
         socket.emit('message', generateMessage('Admin','Welcome!'));
         socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`));
         io.to(user.room).emit('roomData',{
             room:user.room,
             users:getUsersInRoom(user.room)
         })
         callback();
       //socket.emit,io.emit,socket.broadcast.emit
       //io.to.emit,socket.broadcast.to.emit
     })
    socket.on('sendMessage',(message,callback)=>{
        const filter=new Filter();
        let newBadword=['bhosdiwala','chutiya'];
        filter.addWords(...newBadword);
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        const user=getUser(socket.id);
        io.to(user.room).emit('message',generateMessage(user.username,message));
        callback();
    });
    socket.on('disconnect',()=>{
        const user=removerUser(socket.id);
        if(user){
        io.to(user.room).emit('message',generateMessage('Admin',`${user.username} left!`));
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        }
    })
    socket.on('sendLocation',(coords,callback)=>{
         const user=getUser(socket.id);
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    })
})
server.listen(port, () =>{
    console.log(`you are on port ${port}!`);
})