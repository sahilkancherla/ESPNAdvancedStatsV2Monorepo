'use client'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from "@/components/ui/switch"
import { ChatMessage } from "@/components/Chatbot/ChatMessage";
import { ChatInput } from "@/components/Chatbot/ChatInput";
import { TypingIndicator } from "@/components/Chatbot/TypingIndicator";
import { SuggestedQuestions } from "@/components/Chatbot/SuggestedQuestions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, Source } from '@/lib/interfaces';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

// Function to get response from backend
const getAIResponse = async (question: string, messages: Message[], useVerifiedSources: boolean): Promise<{ answer: string, sources: Source[], follow_up_questions: string[], verified_sources_enabled: boolean }> => {
  try {

    // Build conversation history from message pairs, excluding the welcome message
    // Each pair consists of a user question followed by an AI response
    const conversationHistory = [];
    
    // Start from index 1 to skip the welcome message, and process pairs
    for (let i = 1; i < messages.length - 1; i += 2) {
      const userMessage = messages[i];
      const aiMessage = messages[i + 1];
      
      // Only add complete pairs (user question + AI response)
      if (userMessage && userMessage.isUser && aiMessage && !aiMessage.isUser) {
        conversationHistory.push({
          question: userMessage.text,
          answer: aiMessage.text
        });
      }
    }

    const response = await fetch(`${BACKEND_URL}/chatbot/askChatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, conversationHistory: conversationHistory, verifiedSources: useVerifiedSources }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from backend');
    }

    const data = await response.json();
    return {
      answer: data.answer || "Sorry, I couldn't generate a response. Please try again.",
      sources: data.sources_found || [],
      follow_up_questions: data.follow_up_questions || [],
      verified_sources_enabled: data.verified_sources
    };
  } catch (error) {
    console.error('Error fetching AI response:', error);
    return {
      answer: "Sorry, I'm having trouble connecting to the server. Please try again later.",
      sources: [],
      follow_up_questions: [],
      verified_sources_enabled: false
    };
  }
};

export function ChatbotContent() {
    const [messages, setMessages] = useState<Message[]>([
        {
          id: "1",
          text: "Welcome to your Fantasy Football AI Assistant! I can help you with lineup decisions, trade analysis, waiver wire pickups, and more. What would you like to know?",
          sources: [],
          follow_up_questions: [],
          verified_sources_enabled: false,
          isUser: false,
          timestamp: new Date()
        }
      ]);
      const [isTyping, setIsTyping] = useState(false);
      const [useVerifiedSources, setUseVerifiedSources] = useState(false);
    
      const handleFollowUpQuestion = (question: string) => {
        handleSendMessage(question)
      }
    
      const handleSendMessage = async (text: string) => {
        const userMessage: Message = {
          id: Date.now().toString(),
          text,
          sources: [],
          follow_up_questions: [],
          verified_sources_enabled: false,
          isUser: true,
          timestamp: new Date()
        };
    
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);
    
        try {
          const aiResponse = await getAIResponse(text, messages, useVerifiedSources);
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: aiResponse.answer,
            sources: aiResponse.sources,
            follow_up_questions: aiResponse.follow_up_questions,
            verified_sources_enabled: aiResponse.verified_sources_enabled,
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
        } catch (error) {
          console.error('Error fetching AI response:', error);
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "Sorry, I encountered an error while processing your request. Please try again.",
            sources: [],
            follow_up_questions: [],
            verified_sources_enabled: false,
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsTyping(false);
        }
      };
  return (
    <div className="p-6 space-y-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Assistant</h1>
          <p className="text-muted-foreground">Your smart fantasy assistant</p>
        </div>
      </div>

      {/* Draft Table */}
      <Card className="h-[85%]">
        
        <CardContent className="p-0 h-full max-h-[calc(100vh-200px)] overflow-hidden">
        <div className="bg-gradient-hero h-full flex flex-col">
            <div className="container mx-auto max-w-4xl h-full flex flex-col">

            {/* Settings Toggle */}
            <div className="flex justify-end p-4 bg-card/50 backdrop-blur-sm border-b border-border flex-shrink-0">
                <div className="flex items-center gap-2">
                <Switch checked={useVerifiedSources} onCheckedChange={setUseVerifiedSources} />
                <p className="text-sm text-muted-foreground">Use verified sources</p>
                </div>
            </div>

            {/* Chat Messages - Scrollable Area */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {/* Suggested Questions - only show when no user messages */}
                {messages.filter(m => m.isUser).length === 0 ? (
                <div className="h-full overflow-y-auto">
                    <SuggestedQuestions onSelectQuestion={handleSendMessage} />
                </div>
                ) : (
                <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                    {messages.map((message) => (
                        <ChatMessage
                        key={message.id}
                        message={message.text}
                        sources={message.sources}
                        follow_up_questions={message.follow_up_questions}
                        verified_sources_enabled={message.verified_sources_enabled}
                        handleFollowUpQuestion={handleFollowUpQuestion}
                        questionInProgress={isTyping}
                        isUser={message.isUser}
                        timestamp={message.timestamp}
                        />
                    ))}
                    {isTyping && <TypingIndicator />}
                    </div>
                </ScrollArea>
                )}
            </div>

            {/* Chat Input - Always visible at bottom */}
            <div className="border-t border-border flex-shrink-0">
                <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
            </div>
            </div>
        </div>
        </CardContent>
      </Card>
    </div>
  )
}