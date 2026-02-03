"use client";

import { useState, useEffect, useRef } from "react";
import { packages } from "@/lib/pricing";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  options?: { id: string; label: string }[];
}

const ARIA_AVATAR = "🤖";

const initialMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "Hi! I'm ARIA, your AI sales assistant at n01.app. 👋\n\nI can help you:\n• Get a quote for your project\n• Explain our packages\n• Start your order right away\n\nWhat would you like to do?",
    options: [
      { id: "get_quote", label: "Get a quote" },
      { id: "see_packages", label: "See packages" },
      { id: "talk_human", label: "Talk to a human" },
    ],
  },
];

export default function SalesChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [leadData, setLeadData] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    package?: string;
    description?: string;
  }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showNotification, setShowNotification] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Hide notification after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowNotification(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const simulateTyping = async (callback: () => void) => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));
    setIsTyping(false);
    callback();
  };

  const handleOptionClick = async (optionId: string) => {
    // Add user's choice as a message
    const option = messages[messages.length - 1]?.options?.find((o) => o.id === optionId);
    if (option) {
      addMessage({
        id: `user-${Date.now()}`,
        role: "user",
        content: option.label,
      });
    }

    await simulateTyping(() => {
      switch (optionId) {
        case "get_quote":
          addMessage({
            id: `aria-${Date.now()}`,
            role: "assistant",
            content: "Great! Let me help you get a quote. First, what type of project are you looking to build?",
            options: [
              { id: "project_landing", label: "Landing page / Website" },
              { id: "project_webapp", label: "Web application" },
              { id: "project_mobile", label: "Mobile app" },
              { id: "project_custom", label: "Something custom" },
            ],
          });
          break;

        case "see_packages":
          const packageList = packages
            .map((p) => `**${p.name}** - $${p.price}\n${p.description}`)
            .join("\n\n");
          addMessage({
            id: `aria-${Date.now()}`,
            role: "assistant",
            content: `Here are our packages:\n\n${packageList}\n\nWhich one interests you?`,
            options: [
              ...packages.map((p) => ({ id: `select_${p.id}`, label: `${p.name} - $${p.price}` })),
              { id: "need_custom", label: "I need something custom" },
            ],
          });
          break;

        case "talk_human":
          addMessage({
            id: `aria-${Date.now()}`,
            role: "assistant",
            content: "Of course! You can reach our team via:\n\n📧 Email: ai@n01.app\n📱 WhatsApp: Leave your number and we'll contact you\n\nOr leave your details and we'll get back to you within 1-2 hours.",
            options: [
              { id: "leave_details", label: "Leave my details" },
              { id: "back_to_start", label: "Back to options" },
            ],
          });
          break;

        case "project_landing":
          setLeadData((prev) => ({ ...prev, package: "STARTER" }));
          addMessage({
            id: `aria-${Date.now()}`,
            role: "assistant",
            content: "Perfect! For landing pages, our **STARTER** package ($49) is ideal.\n\nIt includes:\n• 1-3 pages\n• Responsive design\n• Contact form\n• SEO setup\n• Delivery in 48 hours\n\nWould you like to proceed with this package?",
            options: [
              { id: "proceed_starter", label: "Yes, let's go!" },
              { id: "see_packages", label: "See other options" },
              { id: "need_custom", label: "I need more pages" },
            ],
          });
          break;

        case "project_webapp":
          setLeadData((prev) => ({ ...prev, package: "PRO" }));
          addMessage({
            id: `aria-${Date.now()}`,
            role: "assistant",
            content: "For web applications, I recommend our **PRO** package ($133).\n\nIt includes:\n• 5-10 pages\n• User authentication\n• Database integration\n• Custom design\n• Delivery in 5 days\n\nShall we proceed?",
            options: [
              { id: "proceed_pro", label: "Yes, let's go!" },
              { id: "see_packages", label: "See other options" },
              { id: "need_custom", label: "I need more features" },
            ],
          });
          break;

        case "project_mobile":
        case "project_custom":
          setLeadData((prev) => ({ ...prev, package: "SCALE" }));
          addMessage({
            id: `aria-${Date.now()}`,
            role: "assistant",
            content: "For mobile apps and complex projects, our **SCALE** package ($333) is perfect.\n\nIt includes:\n• Full application\n• Mobile-ready PWA\n• Advanced features\n• Payment integration\n• Admin dashboard\n• Delivery in 10 days\n\nInterested?",
            options: [
              { id: "proceed_scale", label: "Yes, let's go!" },
              { id: "need_custom", label: "I need a custom quote" },
              { id: "see_packages", label: "See all packages" },
            ],
          });
          break;

        case "select_starter":
          setLeadData((prev) => ({ ...prev, package: "STARTER" }));
          addMessage({
            id: `aria-${Date.now()}`,
            role: "assistant",
            content: "Excellent choice! The STARTER package is great for getting started quickly.\n\nTo proceed, I'll need a few details. What's your name?",
          });
          break;

        case "select_pro":
          setLeadData((prev) => ({ ...prev, package: "PRO" }));
          addMessage({
            id: `aria-${Date.now()}`,
            role: "assistant",
            content: "Great choice! PRO is our most popular package.\n\nLet me get your details. What's your name?",
          });
          break;

        case "select_scale":
          setLeadData((prev) => ({ ...prev, package: "SCALE" }));
          addMessage({
            id: `aria-${Date.now()}`,
            role: "assistant",
            content: "Excellent! SCALE gives you everything you need for a serious project.\n\nLet's get started. What's your name?",
          });
          break;

        case "proceed_starter":
        case "proceed_pro":
        case "proceed_scale":
          addMessage({
            id: `aria-${Date.now()}`,
            role: "assistant",
            content: "Perfect! Let me get your details to start the project.\n\nWhat's your name?",
          });
          break;

        case "need_custom":
          addMessage({
            id: `aria-${Date.now()}`,
            role: "assistant",
            content: "No problem! For custom projects, I'll need to understand your requirements.\n\nCould you briefly describe what you want to build?",
          });
          setLeadData((prev) => ({ ...prev, package: "CUSTOM" }));
          break;

        case "leave_details":
          addMessage({
            id: `aria-${Date.now()}`,
            role: "assistant",
            content: "Great! What's your name?",
          });
          break;

        case "back_to_start":
          setMessages(initialMessages);
          setLeadData({});
          break;

        case "confirm_order":
          submitLead();
          break;

        case "pay_card":
          addMessage({
            id: `aria-${Date.now()}`,
            role: "assistant",
            content: "I'll send you a secure payment link to your email. You'll receive it within a few minutes.\n\nThank you for choosing n01.app! 🚀",
          });
          submitLead("card");
          break;

        case "pay_crypto":
          addMessage({
            id: `aria-${Date.now()}`,
            role: "assistant",
            content: "Great choice! You get a 5% discount with crypto.\n\nPlease choose your preferred network:",
            options: [
              { id: "pay_solana", label: "Solana (USDC)" },
              { id: "pay_ethereum", label: "Ethereum (USDC)" },
            ],
          });
          break;

        case "pay_solana":
        case "pay_ethereum":
          addMessage({
            id: `aria-${Date.now()}`,
            role: "assistant",
            content: `Perfect! I'll send you the ${optionId === "pay_solana" ? "Solana" : "Ethereum"} payment details to your email.\n\nThank you for choosing n01.app! 🚀`,
          });
          submitLead(optionId === "pay_solana" ? "solana" : "ethereum");
          break;

        default:
          break;
      }
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    addMessage({
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
    });

    await simulateTyping(() => {
      // Handle different states based on what data we're collecting
      if (!leadData.name) {
        setLeadData((prev) => ({ ...prev, name: userMessage }));
        addMessage({
          id: `aria-${Date.now()}`,
          role: "assistant",
          content: `Nice to meet you, ${userMessage}! 👋\n\nWhat's your email address?`,
        });
      } else if (!leadData.email) {
        if (userMessage.includes("@")) {
          setLeadData((prev) => ({ ...prev, email: userMessage }));
          addMessage({
            id: `aria-${Date.now()}`,
            role: "assistant",
            content: "Got it! And your phone number? (for WhatsApp contact)",
          });
        } else {
          addMessage({
            id: `aria-${Date.now()}`,
            role: "assistant",
            content: "That doesn't look like a valid email. Could you please enter your email address?",
          });
        }
      } else if (!leadData.phone) {
        setLeadData((prev) => ({ ...prev, phone: userMessage }));
        if (!leadData.description && leadData.package === "CUSTOM") {
          addMessage({
            id: `aria-${Date.now()}`,
            role: "assistant",
            content: "Thanks! Now, please describe your project briefly:",
          });
        } else {
          showOrderSummary(userMessage);
        }
      } else if (!leadData.description && leadData.package === "CUSTOM") {
        setLeadData((prev) => ({ ...prev, description: userMessage }));
        showOrderSummary(undefined, userMessage);
      } else {
        // Generic response
        addMessage({
          id: `aria-${Date.now()}`,
          role: "assistant",
          content: "Thanks for the info! Is there anything else you'd like to know?",
          options: [
            { id: "see_packages", label: "See packages" },
            { id: "get_quote", label: "Get a quote" },
            { id: "talk_human", label: "Talk to human" },
          ],
        });
      }
    });
  };

  const showOrderSummary = (phone?: string, description?: string) => {
    const finalPhone = phone || leadData.phone;
    const finalDesc = description || leadData.description;
    const pkg = packages.find((p) => p.name === leadData.package);
    const price = pkg?.price || "Custom quote";

    addMessage({
      id: `aria-${Date.now()}`,
      role: "assistant",
      content: `Perfect! Here's your order summary:\n\n👤 **Name:** ${leadData.name}\n📧 **Email:** ${leadData.email}\n📱 **Phone:** ${finalPhone}\n📦 **Package:** ${leadData.package}\n💰 **Price:** ${typeof price === "number" ? `$${price}` : price}${finalDesc ? `\n📝 **Project:** ${finalDesc}` : ""}\n\nHow would you like to proceed?`,
      options: [
        { id: "pay_card", label: "💳 Pay with Card" },
        { id: "pay_crypto", label: "🪙 Pay with Crypto (-5%)" },
        { id: "talk_human", label: "Talk to human first" },
      ],
    });
  };

  const submitLead = async (paymentMethod?: string) => {
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          projectDescription: leadData.description || `Package: ${leadData.package}`,
          preferredContact: "whatsapp",
          selectedPackage: leadData.package || "CUSTOM",
          paymentMethod,
          source: "chatbot",
        }),
      });
    } catch (error) {
      console.error("Failed to submit lead:", error);
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
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 ${
          isOpen ? "bg-gray-700" : "bg-accent"
        }`}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Notification Badge */}
      {showNotification && !isOpen && (
        <div className="fixed bottom-24 right-6 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 max-w-xs animate-bounce">
          <p className="text-sm">👋 Hi! Need help with your project?</p>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[32rem] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-accent text-white p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
              {ARIA_AVATAR}
            </div>
            <div>
              <h3 className="font-semibold">ARIA</h3>
              <p className="text-xs text-white/80">AI Sales Assistant • Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-accent text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  {message.options && (
                    <div className="mt-3 space-y-2">
                      {message.options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleOptionClick(option.id)}
                          className="w-full text-left px-3 py-2 bg-white dark:bg-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
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

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center hover:bg-accent/90 disabled:opacity-50 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
