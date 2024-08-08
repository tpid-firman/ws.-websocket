const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let products = []; 
const userTotalPrices = {};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  io.emit("update_products", products);

  socket.on('add_to_cart', (product) => {
    products.push(product);
  
    io.emit('update_products', products);
  });

  socket.on('grand_total_updated', (userId, newTotalPrice) => {
    userTotalPrices[userId] = userTotalPrices[userId] || 0;
    userTotalPrices[userId] += newTotalPrice;

    const grandTotal = Object.values(userTotalPrices).reduce((acc, value) => acc + value, 0);
    
    io.emit('grand_total_updated', grandTotal);
  });

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
