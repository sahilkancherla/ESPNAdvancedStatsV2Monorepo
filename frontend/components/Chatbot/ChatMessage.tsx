import { cn } from "@/lib/utils";
import { Source } from "@/lib/interfaces";
import { Badge } from "@/components/ui/badge"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
  } from "@/components/ui/hover-card" 
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  sources: Source[];
  handleFollowUpQuestion: (question: string) => void;
  follow_up_questions: string[];
  verified_sources_enabled: boolean;
  questionInProgress: boolean;
  timestamp: Date;
}

export const ChatMessage = ({ message, sources, follow_up_questions, verified_sources_enabled, handleFollowUpQuestion, questionInProgress,isUser, timestamp }: ChatMessageProps) => {
    
  const renderMessageWithSources = (text: string) => {
    // Regular expression to find source references like [1], [2], etc.
    const sourceRegex = /\[\((\d+)\)\]/g;
    // Regular expression to find bold text **text**
    const boldRegex = /\*\*(.*?)\*\*/g;
    
    const processedText = text;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // First, let's create a combined regex to handle both sources, bold text, and headings
    const combinedRegex = /(\[\((\d+)\)\])|(\*\*(.*?)\*\*)|(\n(#{1,3})\s*([^\n]+))/g;
    let match: RegExpExecArray | null;

    while ((match = combinedRegex.exec(processedText)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        const textBeforeMatch = processedText.substring(lastIndex, match.index);
        // Split by newlines and add proper spacing
        const lines = textBeforeMatch.split('\n');
        lines.forEach((line, index) => {
          if (index > 0) {
            parts.push(<br key={`br-${match!.index}-${index}`} />);
          }
          if (line.trim() !== '') {
            parts.push(line);
          }
        });
      }
      
      if (match[1]) {
        // This is a source reference
        const sourceIndex = parseInt(match[2]) - 1; // Convert to 0-based index
        const source = sources[sourceIndex];
        
        if (source) {
          parts.push(
              <Link
                key={match.index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Badge
                  className="inline-flex items-center px-2 py-1 mx-1 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-full hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <span>Source {match[2]}</span>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <p>{source.title}</p>
                      <p className="text-xs text-muted-foreground">{new URL(source.url).hostname}</p>
                      <Button size="sm" className="mt-2">
                          <Link href={source.url} target="_blank" rel="noopener noreferrer">
                              View Source
                          </Link>
                      </Button>
                    </HoverCardContent>
                  </HoverCard>
                </Badge>
              </Link>
            )
        } else {
          // If source doesn't exist, just add the original text
          parts.push(match[0]);
        }
      } else if (match[3]) {
        // This is bold text
        parts.push(<strong key={match.index}>{match[4]}</strong>);
      } else if (match[5]) {
        // This is a heading
        const headingLevel = match[6].length; // Number of # characters
        const headingText = match[7];
        
        // Add a line break before the heading if it's not at the start
        if (match.index > 0) {
          parts.push(<br key={`br-heading-${match.index}`} />);
        }
        
        if (headingLevel === 1) {
          parts.push(<h1 key={match.index} className="text-xl font-bold mt-2 mb-1">{headingText}</h1>);
        } else if (headingLevel === 2) {
          parts.push(<h2 key={match.index} className="text-lg font-semibold mt-2 mb-1">{headingText}</h2>);
        } else if (headingLevel === 3) {
          parts.push(<h3 key={match.index} className="text-md font-medium mt-2 mb-1">{headingText}</h3>);
        }
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after the last match
    if (lastIndex < processedText.length) {
      const remainingText = processedText.substring(lastIndex);
      // Split by newlines and add proper spacing
      const lines = remainingText.split('\n');
      lines.forEach((line, index) => {
        if (index > 0) {
          parts.push(<br key={`br-end-${index}`} />);
        }
        if (line.trim() !== '') {
          parts.push(line);
        }
      });
    }
    
    return parts.length > 0 ? parts : text;
  };
  return (
    <div className={cn(
      "flex w-full animate-slide-up",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-lg px-4 py-3 shadow-card",
        isUser 
          ? "bg-chat-user text-chat-user-foreground ml-4" 
          : "bg-chat-bot text-chat-bot-foreground mr-4 border border-border"
      )}>
        {verified_sources_enabled && (
            <Badge variant="outline" className="text-xs rounded-full px-3 py-1 flex items-center space-x-1 bg-green-600 text-white shadow-nfl">
                <Check className="w-3 h-3" />
                <span>Verified Sources</span>
            </Badge>
        )}
        <div className="text-sm leading-relaxed mt-2">{renderMessageWithSources(message)}</div>
        <p className="text-xs mt-2 opacity-70">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        {/* Follow-up questions */}
        {follow_up_questions && follow_up_questions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {follow_up_questions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-full px-3 py-1"
                  disabled={questionInProgress}
                  onClick={() => handleFollowUpQuestion(question)}
                >
                  {question.length > 100 ? `${question.substring(0, 100)}...` : question}
                </Button>
              ))}
            </div>
        )}
      
      </div>
    </div>
  );
};