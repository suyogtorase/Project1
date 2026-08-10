import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:4000", {
    query: { userId: "6a4fa041a263b13ef1d7cf19" } // Swaraj
});

socket.on("connect", () => {
    console.log("Connected to socket");
    socket.emit("joinClassroom", "6a4a68a9de32657148e1bf94");
    console.log("Joined room 6a4a68a9de32657148e1bf94");
    
    // Simulate someone sending a message via API after joining
    setTimeout(async () => {
        try {
            console.log("Sending message via API...");
            // We can't easily auth via axios here, but we can see if the socket event triggers if we can hit the API.
            // Actually, we don't have the auth cookie. Let's just create a quick test route or mock it.
        } catch (e) {
            console.log(e.message);
        }
    }, 1000);
});

socket.on("newClassroomMessage", (msg) => {
    console.log("Received newClassroomMessage:", JSON.stringify(msg, null, 2));
    process.exit(0);
});
