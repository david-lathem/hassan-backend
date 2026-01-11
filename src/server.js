import "./discord/client.js";
import app from "./app.js";
import mongoose from "mongoose";

const { PORT = 3000 } = process.env;

console.log("Connecting to db");

await mongoose.connect(process.env.MONGO_URI);

console.log("DB connected!");

const server = app.listen(PORT, () => {
  console.log(`Server is running at port http://localhost:${PORT}`);
});

// give some time to server to process requests before shutting down

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
