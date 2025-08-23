import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-card border-t border-border">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask about fantasy football, player stats, trades..."
        disabled={disabled}
        className="flex-1 bg-input border-border focus:ring-primary"
      />
      <Button 
        type="submit" 
        disabled={!message.trim() || disabled}
        className="bg-green-600 hover:bg-green-700 text-white shadow-nfl disabled:bg-gray-400 disabled:hover:bg-gray-400"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
};