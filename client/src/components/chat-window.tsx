import { useEffect, useRef } from "react";
import { ChatMessage, User } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ChatWindowProps {
  messages: ChatMessage[];
  currentUser: User | null;
  typingUsers: string[];
}

export default function ChatWindow({ messages, currentUser, typingUsers }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="h-full p-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start gap-3",
              message.userId === currentUser?.id && "flex-row-reverse"
            )}
          >
            <Avatar>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                {message.username[0].toUpperCase()}
              </div>
            </Avatar>
            
            <div className={cn(
              "flex flex-col gap-1 max-w-[70%]",
              message.userId === currentUser?.id && "items-end"
            )}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{message.username}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(message.timestamp), 'HH:mm')}
                </span>
              </div>
              
              <div className={cn(
                "rounded-lg p-3",
                message.userId === currentUser?.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}>
                <p>{message.content}</p>
                {message.imageUrl && (
                  <img
                    src={message.imageUrl}
                    alt="Shared image"
                    className="mt-2 max-w-sm rounded-md"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {typingUsers.length > 0 && (
        <div className="text-sm text-muted-foreground mt-2">
          {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
        </div>
      )}
    </ScrollArea>
  );
}
