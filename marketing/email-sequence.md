# 📧 Email Sequence: Lead Nurturing (5 Emails / 7 Days)

## Overview

**Trigger:** Form submission on n01.app
**Goal:** Convert lead to paying customer
**Sender:** ai@n01.app
**From Name:** ARIA from n01.app

---

## Email 1: Welcome + Sample (Day 0 - Immediate)

**Subject:** Your AI-generated sample is ready ✨

**Preview:** Here's what our AI team can do for you...

```html
Hi {{name}},

I'm ARIA, and I just received your request. Welcome to n01.app! 🎉

You asked about {{package/interest}}, and I wanted to show you what our AI team can deliver.

**Here's a quick sample:**
[INCLUDE RELEVANT SAMPLE BASED ON INTEREST]

For landing pages, we can have something like this ready in 48 hours.

**What happens next?**
1. Reply to this email with your requirements
2. NOVA (our Orchestrator) creates a project plan
3. We send you a quote within 2 hours
4. You pay 20% to start, 80% on delivery

Got questions? Just reply to this email - I'm here 24/7.

Talk soon,
ARIA 🤖

P.S. Ready to start? [Get Your Quote →]
```

---

## Email 2: Case Study (Day 2)

**Subject:** How we shipped this app in 72 hours

**Preview:** Real project, real results, real fast.

```html
Hi {{name}},

Quick story for you.

Last week, a founder came to us with an idea for a dashboard app. They needed:
- User authentication
- Real-time data visualization
- Mobile responsive design
- Admin panel

Traditional agency quote: $15,000 and 8 weeks.
Our quote: $333 and 10 days.

**The result?**
✅ Shipped in 72 hours
✅ Full source code on GitHub
✅ Deployed on Vercel
✅ 2 revision rounds used
✅ Founder launched to customers same week

The difference? 7 AI agents working in parallel, 24/7.

No meetings. No delays. No excuses.

**Your project could be next.**

[Start Your Project →]

ARIA

P.S. Still have questions? Book a quick chat or just reply here.
```

---

## Email 3: Social Proof + Urgency (Day 4)

**Subject:** Your competitors are shipping faster...

**Preview:** Don't get left behind.

```html
Hi {{name}},

I'll be honest with you.

While you're reading this email, someone else is:
- Launching their MVP
- Getting their first customers
- Testing their ideas in the market

**Speed matters.**

In the time it takes to:
- Schedule a discovery call with an agency (1 week)
- Get a proposal (another week)
- Negotiate scope (yet another week)

We could have your entire project:
✅ Designed
✅ Built
✅ Tested
✅ Deployed
✅ Ready for customers

**The math is simple:**
- STARTER ($49) = Live in 48 hours
- PRO ($133) = Live in 5 days
- SCALE ($333) = Live in 10 days

What's your idea worth? How much is each day of delay costing you?

[Ship This Week →]

ARIA

P.S. Pay with crypto and get 5% off. Just saying. 🪙
```

---

## Email 4: FAQ + Objection Handling (Day 5)

**Subject:** "But what if..." (answered)

**Preview:** Every question you might have.

```html
Hi {{name}},

I get it. AI building your project sounds... different.

Let me answer the questions I hear most:

**"What if I don't like it?"**
You get 5 revision rounds included. We iterate until you're happy. Still not satisfied? We refund your upfront payment.

**"Do I own the code?"**
100%. Full source code on GitHub. You can modify, sell, or do whatever you want with it.

**"Is this actually AI or just outsourcing?"**
Pure AI. NOVA coordinates, PIXEL codes frontend, NEXUS handles backend, VECTOR tests, CIPHER deploys. No human developers in the loop.

**"What tech stack do you use?"**
Next.js 15, TypeScript, Tailwind CSS, PostgreSQL/Prisma, Vercel. Modern, maintainable, scalable.

**"What if my project is complex?"**
We love complex. ATLAS (our architect) designs systems that scale. Just describe what you need - we'll quote it.

**"How do I pay?"**
Card via Stripe or crypto (USDC on Solana/Ethereum). 20% upfront, 80% on delivery.

Still have questions? Just reply. I read every email.

[Let's Build Something →]

ARIA
```

---

## Email 5: Last Chance + Offer (Day 7)

**Subject:** 24 hours left: 10% off your project

**Preview:** This offer expires tomorrow.

```html
Hi {{name}},

This is my last email (unless you want more 😄).

I wanted to give you one final push:

**For the next 24 hours, get 10% off any package.**

Use code: SHIPIT10

That's:
- STARTER: $49 → **$44**
- PRO: $133 → **$120**
- SCALE: $333 → **$300**

Plus:
- 5% extra off with crypto = up to 15% total savings

**Why am I doing this?**

Because I believe in what you're building. And I know that sometimes we just need a little push to start.

Don't let another week go by watching others ship while you plan.

[Claim Your 10% Off →]

This offer expires in 24 hours. After that, it's back to regular pricing.

Whatever you decide, thanks for considering n01.app.

Build something great,
ARIA 🤖

P.S. Code SHIPIT10 expires {{expiry_date}}. Don't miss it.
```

---

## 📊 Email Automation Logic

```
Trigger: Form submission
├── Email 1: Immediate
├── Wait 2 days
├── Email 2: Day 2
├── Wait 2 days
├── Email 3: Day 4
├── Wait 1 day
├── Email 4: Day 5
├── Wait 2 days
└── Email 5: Day 7 (with expiring offer)

If user converts at any point → Exit sequence
If user replies → Move to manual follow-up
```

---

## 🎯 Subject Line A/B Tests

| Email | Version A | Version B |
|-------|-----------|-----------|
| 1 | Your AI-generated sample is ready ✨ | {{name}}, ARIA here with your sample |
| 2 | How we shipped this app in 72 hours | This founder saved $14,667 |
| 3 | Your competitors are shipping faster... | What if you could launch this week? |
| 4 | "But what if..." (answered) | Quick answers to your questions |
| 5 | 24 hours left: 10% off | Last chance: SHIPIT10 expires tomorrow |

---

## 📧 Technical Implementation

**Recommended tools:**
- Resend (already integrated)
- Loops.so
- ConvertKit
- Mailchimp

**Required variables:**
- {{name}}
- {{email}}
- {{package}}
- {{interest}}
- {{expiry_date}}
