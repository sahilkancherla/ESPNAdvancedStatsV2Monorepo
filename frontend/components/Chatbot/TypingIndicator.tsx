export const TypingIndicator = () => {
    return (
      <div className="flex justify-start w-full">
        <div className="bg-chat-bot text-chat-bot-foreground max-w-[80%] rounded-lg px-4 py-3 mr-4 border border-border">
          <div className="flex items-center space-x-1">
            <span className="text-sm">Fantasy AI is thinking</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-typing"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  };