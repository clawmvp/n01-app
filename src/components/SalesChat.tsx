"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface LeadData {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  package?: string;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// Email regex
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
// Phone regex (international format)
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;
// Name pattern (2+ words starting with capital)
const NAME_REGEX = /^[A-Z][a-z]+ [A-Z][a-z]+/;

export default function SalesChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [leadData, setLeadData] = useState<LeadData>({});
  const [leadSaved, setLeadSaved] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show notification after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowNotification(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send initial greeting when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = `${getGreeting()}! 👋 I'm ARIA, the AI Sales Agent at n01.app.

I work alongside our AI team - NOVA coordinates projects, PIXEL builds beautiful UIs & logos, NEXUS handles backends, and the rest of the crew.

How can I help you today? Looking to build something?`;
      
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: greeting,
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // Save lead when we have enough info (with debounce to prevent duplicates)
  useEffect(() => {
    if (leadSaved) return;
    if (!leadData.email) return;
    
    // Debounce to prevent multiple saves
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch("/api/chat/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...leadData,
            source: "chatbot",
            conversation: messages.map(m => `${m.role}: ${m.content}`).join("\n\n"),
          }),
        });
        
        const data = await response.json();
        if (data.success) {
          setLeadSaved(true);
          console.log("Lead saved:", data.leadId);
        }
      } catch (error) {
        console.error("Failed to save lead:", error);
      }
    }, 1000); // Wait 1 second before saving

    return () => clearTimeout(timeoutId);
  }, [leadData.email]); // Only trigger on email change, not every message

  // Extract contact info from message
  const extractContactInfo = (text: string): Partial<LeadData> => {
    const extracted: Partial<LeadData> = {};
    
    // Extract email
    const emailMatch = text.match(EMAIL_REGEX);
    if (emailMatch) {
      extracted.email = emailMatch[0].toLowerCase();
    }
    
    // Extract phone
    const phoneMatch = text.match(PHONE_REGEX);
    if (phoneMatch) {
      extracted.phone = phoneMatch[0].replace(/[^\d+]/g, "");
    }
    
    // Extract name (if message looks like a name)
    if (NAME_REGEX.test(text) && text.split(" ").length <= 4) {
      extracted.name = text.split(" ").slice(0, 3).join(" ");
    }
    
    return extracted;
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
    };
    setMessages((prev) => [...prev, userMsg]);

    // Extract contact info
    const extracted = extractContactInfo(userMessage);
    if (Object.keys(extracted).length > 0) {
      setLeadData((prev) => ({ ...prev, ...extracted }));
    }

    // Detect package interest
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes("starter") || lowerMessage.includes("$49")) {
      setLeadData((prev) => ({ ...prev, package: "Starter" }));
    } else if (lowerMessage.includes("pro") || lowerMessage.includes("$133")) {
      setLeadData((prev) => ({ ...prev, package: "Pro" }));
    } else if (lowerMessage.includes("scale") || lowerMessage.includes("$333")) {
      setLeadData((prev) => ({ ...prev, package: "Scale" }));
    }

    // Detect service interest
    if (lowerMessage.includes("logo")) {
      setLeadData((prev) => ({ ...prev, service: "Logo Design" }));
    } else if (lowerMessage.includes("website") || lowerMessage.includes("landing")) {
      setLeadData((prev) => ({ ...prev, service: "Website" }));
    } else if (lowerMessage.includes("app")) {
      setLeadData((prev) => ({ ...prev, service: "Web App" }));
    } else if (lowerMessage.includes("banner") || lowerMessage.includes("graphic")) {
      setLeadData((prev) => ({ ...prev, service: "Graphics" }));
    }

    setIsTyping(true);

    try {
      // Call OpenAI API with lead data
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          leadData: { ...leadData, ...extracted },
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Check if ARIA is sending a payment link
      if (data.paymentLinkSent) {
        console.log("Payment link sent to:", leadData.email);
      }

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.response,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I'm having a moment. Could you try that again? 🙏",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Bubble */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowNotification(false);
        }}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 overflow-hidden ${
          isOpen
            ? "bg-gray-700"
            : "bg-gradient-to-br from-pink-500 to-purple-600 ring-4 ring-white/20"
        }`}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <Image
            src="/team/avatar-aria.png"
            alt="ARIA"
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        )}
      </button>

      {/* Notification Badge */}
      {showNotification && !isOpen && (
        <div className="fixed bottom-24 right-6 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 max-w-[280px] border border-gray-200 dark:border-gray-700 animate-bounce">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image src="/team/avatar-aria.png" alt="ARIA" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-medium">Hey! I&apos;m ARIA 👋</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Need a website, app, logo, or content? Let&apos;s chat!
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNotification(false);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[550px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/30">
              <Image src="/team/avatar-aria.png" alt="ARIA" width={48} height={48} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">ARIA</h3>
              <p className="text-xs text-white/80">AI Assistant • Powered by GPT-4</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-xs">Online</span>
            </div>
          </div>

          {/* Lead indicator */}
          {leadData.email && (
            <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
              <p className="text-xs text-green-700 dark:text-green-400">
                ✓ Connected as {leadData.name || leadData.email}
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-accent text-white rounded-br-md"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm rounded-bl-md"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex flex-wrap gap-2">
                {["I need a website", "I need a logo", "Show me pricing"].map((text) => (
                  <button
                    key={text}
                    onClick={() => {
                      setInput(text);
                      setTimeout(() => sendMessage(), 100);
                    }}
                    className="text-xs px-3 py-1.5 bg-accent/10 text-accent rounded-full hover:bg-accent/20 transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isTyping}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className="px-4 py-3 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-2">
              Powered by n01.app AI Team
            </p>
          </div>
        </div>
      )}
    </>
  );
}
