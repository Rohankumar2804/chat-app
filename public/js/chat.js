const socket=io()
//elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput=$messageForm.querySelector('input');
const $messageFormButton=$messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages =document.querySelector('#messages');
// Templates
const messageTemplate=document.querySelector('#message-template').innerHTML;
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML
// console.log(messageTemplate);
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true});
console.log(username,room);
const autoscroll=()=>{
    // ne message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight >= scrollOffset-1) {
    $messages.scrollTop = $messages.scrollHeight;
    console.log(1);
  }
}

socket.on('message',(message)=>{
  //  console.log(message);
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    });
  $messages.insertAdjacentHTML("beforeend",html);
  autoscroll();
})


socket.on('locationMessage',(message)=>{
 //console.log(url);
 const html=Mustache.render(locationMessageTemplate,{
     username:message.username,
     url:message.url,
     createdAt:moment(message.createdAt).format('h:mm a')
 });
 $messages.insertAdjacentHTML('beforeend',html);
 autoscroll();
})

socket.on('roomData',({room,users})=>{
   const html=Mustache.render(sidebarTemplate,{
       room,
       users
   })
   console.log(users);
   document.querySelector('#sidebar').innerHTML = html;
})



$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();
 //   const message=document.querySelector('input').value;
 $messageFormButton.setAttribute('disabled','disabled');
 const message=e.target.elements.message.value;
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value='';
        $messageFormInput.focus();
        if(error){
            return console.log(error);
        }
        console.log('message was delivered');
    });
})



$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
            return alert('Geolocation doesn\'t support your browser');
    }
    $sendLocationButton.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position);
        const {latitude,longitude}=position.coords;
       // console.log('latitude is -> ',latitude ,'and longitude -> ',longitude);
       socket.emit('sendLocation',{
           latitude,
           longitude
       },()=>{
           $sendLocationButton.removeAttribute('disabled');
           console.log('location shared!');
       })
    })
})

socket.emit('join',{username,room},(error)=>{
   if(error){
       alert(error);
       location.href='/'
   }

});
