import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: process.env.WEBSOCKET_PORT || 8080 });

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });
});

export default wss;
