import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MessageInputProps {
  onSend: (content: string, imageUrl?: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export default function MessageInput({ onSend, onTyping }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const typingTimeout = useRef<NodeJS.Timeout>();

  const handleTyping = () => {
    onTyping(true);
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    typingTimeout.current = setTimeout(() => onTyping(false), 1000);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    onSend(content);
    setContent("");
    onTyping(false);
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "MAUUUUUUUUUYL:ES",
        description: " ESAYLIFGDVYUIPSREDYUIPVHGBEHRUIPSDGVBUIPHESDU{IOPHGIOHJ{SDG",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setIsUploading(true);
      const res = await apiRequest("POST", "/api/upload", formData);
      const { imageUrl } = await res.json();
      onSend("Shared an image", imageUrl);
    } catch (error) {
      toast({
        title: "Error",
        description: "TU ASMgnseo-gnrsdiogbnrsb",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Type a message..."
          className="min-h-[80px]"
        />
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <ImagePlus className="h-5 w-5" />
          </Button>
          <Button size="icon" onClick={handleSubmit}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
