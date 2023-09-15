const express =  require('express')
const app = express()
const http = require('http')
const { Server } = require('socket.io')

const cors = require('cors')

app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "https://v2v-translation.netlify.app",
        methods: ["GET", "POST"],
    },
})

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`)

    // i want to broadcast to everyone connected to server
    socket.on("send_message", (data) => {
        console.log(data)
        socket.broadcast.emit("receive_message", data);
    })
})

server.listen(3001, () => {
    console.log("Server running at: http://localhost:3001")
})