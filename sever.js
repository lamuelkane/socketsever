const app = require('express')();
// const cors = require('cors');

const io = require('socket.io')(process.env.PORT || 5001, {
      cors:{
        // origin:'http://localhost:3000',
        origin: 'https://advancedshopping.herokuapp.com',
      }
})

    
// app.use(cors())

// app.get('/', (req, res) => {
//   res.send("webrtc server started....")
// })
let users = []
const adduser = (socketid, userid) => {
  users.find(user => user.userid === userid)?users.find(user => user.userid === userid).socketid = socketid : users.push({socketid, userid})
}

let onlineUsers = []

const addonlineuser = (socketid, userid) => {
  onlineUsers.find(user => user.userid === userid)?onlineUsers.find(user => user.userid === userid).socketid = socketid : onlineUsers.push({socketid, userid})
}

const removeuser = (socketid) => {
  users.filter(user => user.socketid !== socketid)
}
io.on('connection', (socket) => {
  console.log(`user conneted.......... ${socket.id}`)
  io.emit('newuser', socket.id);
  socket.on('adduser', (userid) => {
    adduser(socket.id, userid)
    addonlineuser(socket.id, userid)
    io.emit('getusers', onlineUsers)
})

  // send message to admin
socket.on('sendMessge', msg => {
    console.log('sending message to ..... admin ....')
    io.emit('getusermessage', msg)
})

  socket.on('usermessagestatus', senderid => {
    let receiver = users.find(user => user.userid === senderid)
    console.log(senderid, receiver)
    io.to(receiver.socketid).emit('getmessagestatus', {senderid, users})
  })

  socket.on('messagestatus', msg => {
    io.emit('getusermessagestatus', msg)
  })

  // send to user 
  socket.on('sendtouser', msg => {
    let receiver = users.find(user => user.userid == msg.senderid)
    console.log(`sending message to ${msg.senderid} ..... ${receiver.socketid} ... ${users}`)
    io.to(receiver.socketid).emit('getmessage', {...msg, users})
  })

  socket.on('disconnect', (reason) => {
    console.log(`user disconneted ${socket.id}`)
   onlineUsers = onlineUsers.filter(user => user.socketid !== socket.id)
 // removeuser(socket.id)
   io.emit('removeuser', onlineUsers)
  })

})

app.get('/', (req, res) => {
  re.send("socket server started")
})

// const port = process.env.PORT || 5001

// app.listen(port, ()=> console.log(`server listening on port ${port}`))