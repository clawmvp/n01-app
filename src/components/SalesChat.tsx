"use client";

import { useState, useEffect, useRef } from "react";
import { packages } from "@/lib/pricing";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  options?: { id: string; label: string }[];
}

// ARIA's personality and knowledge base
const ARIA_INFO = {
  name: "ARIA",
  role: "Revenue & Intake Agent",
  personality: "friendly, professional, enthusiastic about AI",
  team: [
    { name: "NOVA", role: "Orchestrator", skill: "coordinating projects" },
    { name: "ATLAS", role: "Architect", skill: "system design" },
    { name: "PIXEL", role: "Frontend Dev", skill: "beautiful UIs" },
    { name: "NEXUS", role: "Backend Dev", skill: "APIs & databases" },
    { name: "CIPHER", role: "DevOps", skill: "deployment & infrastructure" },
    { name: "VECTOR", role: "QA Engineer", skill: "testing & quality" },
    { name: "SENTINEL", role: "Security", skill: "keeping things safe" },
  ],
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const initialMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content: `${getGreeting()}! I'm ARIA, the newest member of the n01.app AI team. 👋

I work alongside NOVA (our Orchestrator), PIXEL (Frontend), NEXUS (Backend), and the rest of the crew to deliver amazing projects.

What brings you here today?`,
    options: [
      { id: "need_website", label: "I need a website or app" },
      { id: "need_content", label: "I need content creation" },
      { id: "learn_more", label: "Tell me about n01.app" },
      { id: "see_pricing", label: "Show me pricing" },
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
    service?: string;
  }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showNotification, setShowNotification] = useState(true);
  const [typingText, setTypingText] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => setShowNotification(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const simulateTyping = async (text: string, callback: () => void) => {
    setIsTyping(true);
    setTypingText("");
    
    // Simulate typing character by character for more realism
    const delay = Math.min(500 + text.length * 10, 2000);
    await new Promise((resolve) => setTimeout(resolve, delay));
    
    setIsTyping(false);
    callback();
  };

  const handleOptionClick = async (optionId: string) => {
    const option = messages[messages.length - 1]?.options?.find((o) => o.id === optionId);
    if (option) {
      addMessage({
        id: `user-${Date.now()}`,
        role: "user",
        content: option.label,
      });
    }

    const respond = (content: string, options?: Message["options"]) => {
      simulateTyping(content, () => {
        addMessage({
          id: `aria-${Date.now()}`,
          role: "assistant",
          content,
          options,
        });
      });
    };

    switch (optionId) {
      case "need_website":
        setLeadData((prev) => ({ ...prev, service: "development" }));
        respond(
          `Awesome! You've come to the right place. 🚀

Our team specializes in building modern web apps and sites. PIXEL handles the frontend magic, NEXUS builds rock-solid backends, and ATLAS designs the architecture.

What type of project do you have in mind?`,
          [
            { id: "project_landing", label: "Landing page / Marketing site" },
            { id: "project_webapp", label: "Web application / SaaS" },
            { id: "project_ecommerce", label: "E-commerce / Marketplace" },
            { id: "project_custom", label: "Something else" },
          ]
        );
        break;

      case "need_content":
        setLeadData((prev) => ({ ...prev, service: "content" }));
        respond(
          `Content creation - that's exciting! ✨

We use AI to create:
• Marketing copy & landing pages
• Social media content
• Video scripts & voiceovers
• Blog posts & articles
• Product descriptions

What type of content do you need?`,
          [
            { id: "content_social", label: "Social media content" },
            { id: "content_video", label: "Video scripts / production" },
            { id: "content_copy", label: "Marketing copy" },
            { id: "content_blog", label: "Blog / Articles" },
          ]
        );
        break;

      case "learn_more":
        respond(
          `Great question! Let me tell you about us. 🤖

**n01.app is the first autonomous AI agency.**

We're a team of 7 specialized AI agents:

• **NOVA** - Orchestrator (coordinates everything)
• **ATLAS** - Architect (designs systems)
• **PIXEL** - Frontend (makes things beautiful)
• **NEXUS** - Backend (powers the logic)
• **CIPHER** - DevOps (deploys & monitors)
• **VECTOR** - QA (ensures quality)
• **SENTINEL** - Security (keeps it safe)

And me, **ARIA** - I'm the sales & support agent! 

We work 24/7, deliver fast, and charge a fraction of traditional agencies.

Want to see what we can build for you?`,
          [
            { id: "need_website", label: "Yes, I need a project built" },
            { id: "see_pricing", label: "Show me pricing" },
            { id: "how_it_works", label: "How does it work?" },
          ]
        );
        break;

      case "how_it_works":
        respond(
          `Here's how we work - it's pretty simple:

**1. You describe your project** 📝
Tell me what you need, or fill out our form.

**2. NOVA creates a plan** 🎯
Our Orchestrator analyzes requirements and assigns tasks.

**3. The team builds it** ⚡
ATLAS designs, PIXEL & NEXUS code, VECTOR tests.

**4. CIPHER deploys** 🚀
Live on Vercel with CI/CD, GitHub repo included.

**5. You review & we iterate** 🔄
5 revision rounds included.

The whole process takes 48 hours to 10 days depending on complexity.

Ready to start?`,
          [
            { id: "need_website", label: "Yes, let's do it!" },
            { id: "see_pricing", label: "What does it cost?" },
            { id: "talk_human", label: "I have more questions" },
          ]
        );
        break;

      case "see_pricing":
        const pricingList = packages
          .map((p) => `• **${p.name}** - $${p.price} (${p.delivery})`)
          .join("\n");
        respond(
          `Here's our transparent pricing:

${pricingList}

All packages include:
✓ Source code on GitHub
✓ Vercel deployment
✓ 5 revision rounds
✓ Documentation

Plus **5% off** if you pay with crypto! 🪙

Which package fits your needs?`,
          [
            { id: "select_starter", label: `STARTER - $${packages[0].price}` },
            { id: "select_pro", label: `PRO - $${packages[1].price} ⭐` },
            { id: "select_scale", label: `SCALE - $${packages[2].price}` },
            { id: "need_custom", label: "I need custom pricing" },
          ]
        );
        break;

      case "content_social":
      case "content_video":
      case "content_copy":
      case "content_blog":
        const contentType = {
          content_social: "social media",
          content_video: "video",
          content_copy: "marketing copy",
          content_blog: "blog/article",
        }[optionId];
        setLeadData((prev) => ({ ...prev, description: `Content type: ${contentType}` }));
        respond(
          `Perfect! ${contentType} content it is.

To give you an accurate quote, I'll need a few details.

First, what's your name?`
        );
        break;

      case "project_landing":
        setLeadData((prev) => ({ ...prev, package: "STARTER" }));
        respond(
          `A landing page - PIXEL loves these! 🎨

Our **STARTER** package ($${packages[0].price}) is perfect:
• 1-3 beautifully designed pages
• Mobile responsive
• Contact forms
• SEO optimized
• **Delivered in 48 hours**

Would you like to proceed?`,
          [
            { id: "proceed_order", label: "Yes, let's start!" },
            { id: "see_examples", label: "Can I see examples?" },
            { id: "see_pricing", label: "See other options" },
          ]
        );
        break;

      case "project_webapp":
        setLeadData((prev) => ({ ...prev, package: "PRO" }));
        respond(
          `Web apps are our specialty! NEXUS and PIXEL make a great team. 💪

Our **PRO** package ($${packages[1].price}) includes:
• 5-10 pages/screens
• User authentication
• Database integration
• Custom API
• **Delivered in 5 days**

This is our most popular choice!`,
          [
            { id: "proceed_order", label: "Perfect, let's go!" },
            { id: "need_more", label: "I need more features" },
            { id: "see_pricing", label: "See all options" },
          ]
        );
        break;

      case "project_ecommerce":
      case "need_more":
        setLeadData((prev) => ({ ...prev, package: "SCALE" }));
        respond(
          `For e-commerce and complex apps, our **SCALE** package ($${packages[2].price}) has everything:

• Full application
• Payment processing
• Admin dashboard
• Mobile-ready PWA
• Advanced database
• **Delivered in 10 days**

This gives ATLAS room to design a proper architecture.`,
          [
            { id: "proceed_order", label: "This is what I need!" },
            { id: "need_custom", label: "I need even more" },
            { id: "talk_human", label: "Let's discuss first" },
          ]
        );
        break;

      case "project_custom":
      case "need_custom":
        setLeadData((prev) => ({ ...prev, package: "CUSTOM" }));
        respond(
          `Custom projects are welcome! The team loves a challenge. 🧠

Tell me about your vision - what do you want to build? I'll make sure NOVA gets all the details to create an accurate quote.`
        );
        break;

      case "see_examples":
        respond(
          `We've built some cool stuff! Check out the "Work" section on our homepage.

Recent projects include:
• Blockchain validator dashboards
• Web3 gaming platforms
• AI content generation tools
• Mobile parenting apps

Want to proceed with your landing page?`,
          [
            { id: "proceed_order", label: "Yes, I'm ready!" },
            { id: "need_website", label: "Actually, I need something else" },
          ]
        );
        break;

      case "select_starter":
        setLeadData((prev) => ({ ...prev, package: "STARTER" }));
        respond(
          `STARTER it is! Great for getting started fast.

Let me collect some details for NOVA to plan your project.

What's your name?`
        );
        break;

      case "select_pro":
        setLeadData((prev) => ({ ...prev, package: "PRO" }));
        respond(
          `PRO - excellent choice! Our most popular package. ⭐

I'll need a few details to get you started.

What's your name?`
        );
        break;

      case "select_scale":
        setLeadData((prev) => ({ ...prev, package: "SCALE" }));
        respond(
          `SCALE - you're thinking big! I like it. 🚀

Let's get you set up. The team's ready to build something amazing.

What's your name?`
        );
        break;

      case "proceed_order":
        respond(
          `Awesome! Let's make this happen. 🎉

I'll collect a few details and pass them to NOVA to get started.

What's your name?`
        );
        break;

      case "talk_human":
        respond(
          `Of course! While we're an AI team, we understand some conversations need a personal touch.

You can reach us via:
📧 **Email:** ai@n01.app
📱 **WhatsApp:** Leave your number and we'll call

Or I can take your details and have someone reach out within 1-2 hours.

What works best for you?`,
          [
            { id: "leave_details", label: "Take my details" },
            { id: "email_direct", label: "I'll email you" },
            { id: "back_to_start", label: "Back to options" },
          ]
        );
        break;

      case "leave_details":
        respond(`Great! What's your name?`);
        break;

      case "email_direct":
        respond(
          `Perfect! Drop us a line at **ai@n01.app** and mention what you're looking for.

NOVA monitors the inbox and will respond quickly.

Anything else I can help with?`,
          [
            { id: "see_pricing", label: "Show me pricing again" },
            { id: "back_to_start", label: "Start over" },
          ]
        );
        break;

      case "back_to_start":
        setMessages(initialMessages);
        setLeadData({});
        break;

      case "confirm_order":
        submitLead();
        break;

      case "pay_card":
        respond(
          `Great choice! 💳

I'm sending a secure Stripe payment link to your email right now. Check your inbox in the next minute.

Once you pay, NOVA will immediately assign the project to the team.

Thank you for choosing n01.app! We're excited to build this for you. 🚀`
        );
        submitLead("card");
        break;

      case "pay_crypto":
        respond(
          `Smart! Crypto gets you a 5% discount. 🪙

Which network do you prefer?`,
          [
            { id: "pay_solana", label: "◎ Solana (USDC) - Fast" },
            { id: "pay_ethereum", label: "Ξ Ethereum (USDC)" },
          ]
        );
        break;

      case "pay_solana":
      case "pay_ethereum":
        const network = optionId === "pay_solana" ? "Solana" : "Ethereum";
        respond(
          `${network} it is! 

I'm generating your payment link now. You'll receive an email with:
• Wallet address
• Exact amount in USDC
• Payment reference

Once the transaction confirms, CIPHER will verify it automatically and the project starts!

Thanks for choosing n01.app! 🎉`
        );
        submitLead(optionId === "pay_solana" ? "solana" : "ethereum");
        break;

      default:
        break;
    }
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

    const respond = (content: string, options?: Message["options"]) => {
      simulateTyping(content, () => {
        addMessage({
          id: `aria-${Date.now()}`,
          role: "assistant",
          content,
          options,
        });
      });
    };

    // Handle different states
    if (!leadData.name) {
      setLeadData((prev) => ({ ...prev, name: userMessage }));
      respond(
        `Nice to meet you, ${userMessage}! 👋

I'll make sure NOVA and the team know who they're building for.

What's your email address?`
      );
    } else if (!leadData.email) {
      if (userMessage.includes("@")) {
        setLeadData((prev) => ({ ...prev, email: userMessage }));
        respond(
          `Got it! And your phone number? 

We'll use this for WhatsApp updates - CIPHER set up a nice notification system. 📱`
        );
      } else {
        respond(`Hmm, that doesn't look like an email. Could you try again?`);
      }
    } else if (!leadData.phone) {
      setLeadData((prev) => ({ ...prev, phone: userMessage }));
      if (!leadData.description && (leadData.package === "CUSTOM" || leadData.service === "content")) {
        respond(
          `Perfect! Now, tell me about your project.

What do you want to build? The more details, the better ATLAS can design the solution.`
        );
      } else {
        showOrderSummary(userMessage);
      }
    } else if (!leadData.description && (leadData.package === "CUSTOM" || leadData.service === "content")) {
      setLeadData((prev) => ({ ...prev, description: userMessage }));
      showOrderSummary(undefined, userMessage);
    } else {
      // Generic AI-like response
      const responses = [
        `Interesting! Let me think about that... Actually, I'd recommend checking our packages to find the best fit.`,
        `Great question! The team and I can definitely help with that. Shall we look at our options?`,
        `I hear you! NOVA would love to take on something like that. Want me to set up a project?`,
      ];
      respond(responses[Math.floor(Math.random() * responses.length)], [
        { id: "see_pricing", label: "See packages" },
        { id: "need_website", label: "Start a project" },
        { id: "talk_human", label: "Talk to someone" },
      ]);
    }
  };

  const showOrderSummary = (phone?: string, description?: string) => {
    const finalPhone = phone || leadData.phone;
    const finalDesc = description || leadData.description;
    const pkg = packages.find((p) => p.name === leadData.package);
    const price = pkg?.price || "Custom";

    simulateTyping("summary", () => {
      addMessage({
        id: `aria-${Date.now()}`,
        role: "assistant",
        content: `Perfect! Here's what I've got:

👤 **Name:** ${leadData.name}
📧 **Email:** ${leadData.email}
📱 **Phone:** ${finalPhone}
📦 **Package:** ${leadData.package || "Custom"}
💰 **Price:** ${typeof price === "number" ? `$${price}` : "Custom quote"}
${finalDesc ? `\n📝 **Project:** ${finalDesc}` : ""}

I'll pass this to NOVA right now. How would you like to pay?

💡 *Tip: Crypto saves you 5%!*`,
        options: [
          { id: "pay_card", label: "💳 Pay with Card" },
          { id: "pay_crypto", label: "🪙 Pay with Crypto (-5%)" },
          { id: "talk_human", label: "📞 Call me first" },
        ],
      });
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
          projectDescription: leadData.description || `Package: ${leadData.package}, Service: ${leadData.service || "development"}`,
          preferredContact: "whatsapp",
          selectedPackage: leadData.package || "CUSTOM",
          paymentMethod,
          source: "ARIA chatbot",
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
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 ${
          isOpen 
            ? "bg-gray-700 rotate-0" 
            : "bg-gradient-to-br from-accent to-purple-600 animate-pulse"
        }`}
        style={{ animationDuration: "2s" }}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl">🤖</span>
        )}
      </button>

      {/* Notification Badge */}
      {showNotification && !isOpen && (
        <div className="fixed bottom-24 right-6 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 max-w-[280px] border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <span className="text-2xl">👋</span>
            <div>
              <p className="text-sm font-medium">Hey! I'm ARIA</p>
              <p className="text-xs text-muted mt-1">Need a website, app, or content? Let's chat!</p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[550px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-accent to-purple-600 text-white p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
              🤖
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">ARIA</h3>
              <p className="text-xs text-white/80">AI Sales Agent • Part of the n01 team</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-xs">Online</span>
            </div>
          </div>

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
                  <div 
                    className="text-sm whitespace-pre-line"
                    dangerouslySetInnerHTML={{ 
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    }}
                  />
                  {message.options && (
                    <div className="mt-3 space-y-2">
                      {message.options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleOptionClick(option.id)}
                          className="w-full text-left px-3 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 font-medium"
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
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                    <span className="text-xs text-muted">ARIA is typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center hover:bg-accent/90 disabled:opacity-50 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-center text-muted mt-2">
              Powered by n01.app AI Team
            </p>
          </div>
        </div>
      )}
    </>
  );
}
