import { Server } from "socket.io";

let io;

export function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("socket is connected:", socket.id);

        socket.on("chatMessage", (msg) => {
            console.log("Message received:", msg);
            io.emit("chatMessage", msg);
        });

        socket.on("disconnect", (reason) => {
            console.log("Client disconnected:", socket.id, "Reason:", reason);
        });

        socket.on("error", (error) => {
            console.error("Socket.IO error:", error);
        });
    });

    console.log("Socket.IO initialized");
    return io;
}

export function getSocket() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}