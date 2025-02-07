import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { storage } from "./storage";
import { ChatMessage } from "@shared/schema";

interface Client {
  ws: WebSocket;
  userId: number;
  username: string;
  isTyping: boolean;
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const clients = new Set<Client>();

  wss.on('connection', (ws: WebSocket) => {
    let client: Client | undefined;

    ws.on('message', async (data: string) => {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'auth':
          const user = await storage.getUser(message.userId);
          if (user) {
            client = { ws, userId: user.id, username: user.username, isTyping: false };
            clients.add(client);
            
            // Send existing messages
            const messages = await storage.getMessages();
            ws.send(JSON.stringify({ type: 'history', messages }));
            
            // Broadcast user joined
            broadcast({ type: 'status', content: `${user.username} joined` });
          }
          break;

        case 'message':
          if (client) {
            const chatMessage = await storage.addMessage({
              content: message.content,
              userId: client.userId,
              username: client.username,
              imageUrl: message.imageUrl,
              timestamp: new Date(),
            });
            broadcast({ type: 'message', message: chatMessage });
          }
          break;

        case 'typing':
          if (client) {
            client.isTyping = message.isTyping;
            broadcast({ 
              type: 'typing',
              users: Array.from(clients)
                .filter(c => c.isTyping)
                .map(c => c.username)
            });
          }
          break;
      }
    });

    ws.on('close', () => {
      if (client) {
        clients.delete(client);
        broadcast({ type: 'status', content: `${client.username} left` });
      }
    });
  });

  function broadcast(message: any) {
    const data = JSON.stringify(message);
    for (const client of clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  }
}
