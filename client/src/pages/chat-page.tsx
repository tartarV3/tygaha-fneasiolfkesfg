import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import ChatWindow from "@/components/chat-window";
import MessageInput from "@/components/message-input";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@shared/schema";
import { LogOut } from "lucide-react";

export default function ChatPage() {
  const { user, logoutMutation } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', userId: user.id }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'history':
          setMessages(data.messages);
          break;
        case 'message':
          setMessages(prev => [...prev, data.message]);
          break;
        case 'typing':
          setTypingUsers(data.users);
          break;
        case 'status':
          // Could show join/leave messages
          break;
      }
    };

    setSocket(ws);
    return () => ws.close();
  }, [user]);

  const sendMessage = (content: string, imageUrl?: string) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'message', content, imageUrl }));
    }
  };

  const setTyping = (isTyping: boolean) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'typing', isTyping }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">ChatApp</h1>
        <div className="flex items-center gap-4">
          <span>Logged in as {user?.username}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      <div className="flex-1 overflow-hidden">
        <ChatWindow
          messages={messages}
          currentUser={user}
          typingUsers={typingUsers}
        />
      </div>
      
      <MessageInput
        onSend={sendMessage}
        onTyping={setTyping}
      />
    </div>
  );
}
