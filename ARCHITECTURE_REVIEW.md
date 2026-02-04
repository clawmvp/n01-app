# 🏗️ Architecture Review - n01.app

**Review Date:** 2026-02-04  
**Reviewer:** @architect ATLAS  
**Project:** n01-app  
**Tech Stack:** Next.js 16.1.6, React 19, TypeScript, Tailwind CSS 4, Prisma, Stripe, Solana Pay

---

## Executive Summary

Proiectul urmează în general best practices Next.js App Router, dar prezintă **vulnerabilități critice de securitate** și **probleme de scalabilitate** care trebuie rezolvate înainte de production.

**Status:** ⚠️ **Necesită îmbunătățiri critice pentru production**

---

## 1. Structura de Foldere ✅

### Structura Actuală
```
src/
├── app/                    # ✅ App Router pages
│   ├── api/               # ✅ API routes
│   ├── admin/             # ⚠️ Admin dashboard (fără protecție)
│   ├── auth/              # ✅ Auth pages
│   └── [feature]/         # ✅ Feature pages
├── components/            # ✅ Reusable components
├── lib/                   # ✅ Utilities & integrations
└── ...
```

### Evaluare
- ✅ Urmează Next.js 15+ App Router structure
- ✅ Separare clară între pages, API routes, components
- ✅ `lib/` folder pentru business logic
- ⚠️ Lipsă `types/` folder dedicat (types sunt în `lib/`)
- ⚠️ Lipsă `hooks/` folder pentru custom React hooks
- ⚠️ Lipsă `middleware.ts` pentru route protection

### Recomandări
```typescript
src/
├── types/                 # Adaugă pentru TypeScript types
├── hooks/                 # Adaugă pentru custom hooks
└── middleware.ts          # CRITIC: Adaugă pentru auth
```

---

## 2. Configurări

### 2.1 `next.config.ts` ⚠️

**Status:** Minimal, necesită îmbunătățiri

**Current:**
```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/photos/**',
      },
    ],
  },
};
```

**Probleme:**
- ❌ Lipsă configurare pentru production optimizations
- ❌ Lipsă security headers
- ❌ Lipsă rate limiting configuration
- ❌ Lipsă environment variable validation

**Recomandări:**
```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/photos/**',
      },
    ],
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Security headers (via headers() in middleware)
  // Rate limiting (via middleware sau Vercel Edge Config)
  
  // Environment validation
  env: {
    // Validate required env vars at build time
  },
};
```

### 2.2 `tsconfig.json` ✅

**Status:** Bun, urmează best practices

**Observații:**
- ✅ `strict: true` activat
- ✅ Path aliases configurate (`@/*`)
- ✅ Module resolution corect (`bundler`)
- ✅ Incremental compilation activat

**Minor improvements:**
```json
{
  "compilerOptions": {
    // Adaugă pentru mai bună type safety
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

### 2.3 `prisma/schema.prisma` ✅

**Status:** Excelent design, bine structurat

**Puncte forte:**
- ✅ Schema clară cu enums pentru status
- ✅ Relații bine definite (Lead → Project → Delivery/Task)
- ✅ Timestamps automate (`@default(now())`, `@updatedAt`)
- ✅ Text fields pentru descrieri lungi (`@db.Text`)

**Observații:**
- ⚠️ Lipsă indexes pentru queries frecvente
- ⚠️ Lipsă soft delete pattern (dacă e necesar)
- ⚠️ `Settings` model cu `id` hardcoded - consideră UUID

**Recomandări:**
```prisma
model Lead {
  // ... existing fields
  
  // Adaugă indexes pentru performance
  @@index([status])
  @@index([paymentStatus])
  @@index([createdAt])
  @@index([email]) // Pentru lookup rapid
}

model Project {
  // ... existing fields
  
  @@index([status])
  @@index([leadId])
  @@index([createdAt])
}
```

---

## 3. API Routes & Endpoints

### 3.1 Structura API Routes ✅

**Routes existente:**
```
/api/
├── admin/              # ⚠️ CRITIC: Fără autentificare server-side
│   ├── deliver/
│   ├── leads/
│   ├── projects/
│   └── send-payment/
├── auth/youtube/callback/
├── chat/              # ✅ OpenAI integration
├── contact/
├── quote/
├── solana-pay/        # ✅ Crypto payments
├── stripe/            # ✅ Payment processing
│   ├── checkout/
│   └── webhook/
└── verify-payment/
```

### 3.2 Probleme Critice de Securitate 🔴

#### 🔴 CRITIC: Admin Routes Fără Autentificare Server-Side

**Problema:**
```typescript
// src/app/admin/page.tsx
const authenticate = () => {
  if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === "n01admin2024") {
    setAuthenticated(true);
    localStorage.setItem("admin_auth", "true"); // ⚠️ Client-side only!
  }
};
```

**Vulnerabilități:**
1. ❌ Autentificare doar client-side (localStorage)
2. ❌ Admin routes (`/api/admin/*`) accesibile public
3. ❌ Password hardcoded în cod (`"n01admin2024"`)
4. ❌ `NEXT_PUBLIC_ADMIN_PASSWORD` expus în bundle client
5. ❌ Nu există middleware pentru protecție

**Impact:** 🔴 **CRITIC** - Orice utilizator poate accesa/modifica leads, projects, trimite plăți

**Soluție:**
```typescript
// middleware.ts (CREEAZĂ ACEST FIȘIER)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    // Verify JWT sau session token
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }
  
  // Protect admin page
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const session = request.cookies.get('admin_session');
    if (!session || !verifySession(session.value)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
```

#### ⚠️ Rate Limiting Lipsă

**Problema:** Nu există rate limiting pentru:
- `/api/chat` - Poate fi abuzat pentru costuri OpenAI
- `/api/contact` - Poate fi spammed
- `/api/quote` - Poate fi abuzat

**Soluție:** Implementează rate limiting (Vercel Edge Config, Upstash Redis, sau middleware)

#### ⚠️ Input Validation

**Problema:** Multe endpoints nu validează input-ul cu Zod sau similar

**Exemplu:**
```typescript
// src/app/api/stripe/checkout/route.ts
const { quoteId, customerEmail, packageName, upfrontAmount } = body;
// ⚠️ Nu validează tipurile, format email, amount > 0, etc.
```

**Soluție:** Adaugă Zod validation:
```typescript
import { z } from 'zod';

const checkoutSchema = z.object({
  quoteId: z.string().min(1),
  customerEmail: z.string().email(),
  packageName: z.string().min(1),
  upfrontAmount: z.number().positive(),
  projectDescription: z.string().optional(),
});

const validated = checkoutSchema.parse(body);
```

### 3.3 Webhook Security ✅

**Status:** Bine implementat pentru Stripe

```typescript
// src/app/api/stripe/webhook/route.ts
const signature = request.headers.get("stripe-signature");
event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
```

✅ Verificare semnătură Stripe corectă  
⚠️ Consideră adăugarea de idempotency pentru webhook-uri duplicate

---

## 4. Integrări Externe

### 4.1 Stripe ✅

**Status:** Bine implementat

**Puncte forte:**
- ✅ Lazy initialization pattern
- ✅ Checkout sessions pentru upfront payment
- ✅ Payment links pentru final payment
- ✅ Webhook handling corect

**Observații:**
- ⚠️ API version hardcoded (`"2026-01-28.clover"`) - consideră variabilă env
- ⚠️ Lipsă error handling pentru failed payments
- ⚠️ Lipsă retry logic pentru API calls

### 4.2 Solana Pay ⚠️

**Status:** Implementare basică, necesită îmbunătățiri

**Probleme:**
```typescript
// src/lib/solana-pay.ts
const TREASURY_WALLET = new PublicKey(
  process.env.SOLANA_TREASURY_WALLET || "11111111111111111111111111111111"
);
```

- ⚠️ Default wallet este system program (nesigur)
- ⚠️ Verificare payment basică - nu verifică amount exact
- ⚠️ Nu verifică dacă payment-ul este pentru quote-ul corect
- ⚠️ Lipsă handling pentru failed transactions

**Recomandări:**
```typescript
export async function verifyPayment(
  signature: string,
  expectedAmount: number,
  expectedQuoteId: string
): Promise<{ verified: boolean; amount?: number; memo?: string }> {
  const transaction = await connection.getTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });

  if (!transaction || transaction.meta?.err) {
    return { verified: false };
  }

  // Verifică recipient (treasury wallet)
  // Verifică amount exact
  // Verifică memo pentru quoteId
  // Verifică token (USDC)
  
  return { verified: true, amount: actualAmount, memo: quoteId };
}
```

### 4.3 OpenAI ✅

**Status:** Bine implementat pentru chat

**Observații:**
- ✅ System prompt bine structurat
- ✅ Context injection pentru lead data
- ⚠️ Lipsă rate limiting (costuri pot exploda)
- ⚠️ Lipsă token usage tracking
- ⚠️ Model hardcoded (`gpt-4o-mini`) - consideră env variable

### 4.4 Database (Prisma) ⚠️

**Status:** Implementare problematică pentru production

**Problema majoră:**
```typescript
// src/lib/db.ts
export const prisma = new Proxy({} as any, {
  get(target, prop) {
    return async (...args: any[]) => {
      const client = await getPrisma();
      if (!client) {
        throw new Error("Database not configured");
      }
      // ...
    };
  },
});
```

**Probleme:**
- ⚠️ Proxy pattern complicat și ineficient
- ⚠️ Lazy initialization poate cauza race conditions
- ⚠️ Nu folosește Prisma connection pooling corect

**Soluție:**
```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Problema CRITICĂ: In-Memory Storage**

```typescript
// src/lib/leads.ts
const memoryStore: Map<string, Lead> = new Map();
```

- 🔴 **CRITIC:** Leads și Projects stocate în memorie
- 🔴 Datele se pierd la restart
- 🔴 Nu scalează (nu funcționează cu multiple instances)
- 🔴 Nu persistă între deployments

**Soluție:** Elimină complet in-memory storage, folosește doar Prisma:

```typescript
export async function saveLead(lead: Lead): Promise<void> {
  if (!isDatabaseConfigured()) {
    throw new Error("Database is required for production");
  }
  
  await prisma.lead.upsert({
    where: { id: lead.id },
    update: mapLeadToPrisma(lead),
    create: mapLeadToPrisma(lead),
  });
}
```

---

## 5. Potențiale Îmbunătățiri pentru Production

### 5.1 Security 🔴

**Priorități critice:**

1. **Autentificare Admin** (CRITIC)
   - Implementează NextAuth.js sau JWT
   - Protejează `/api/admin/*` cu middleware
   - Elimină password hardcoded

2. **Rate Limiting**
   - Implementează pentru `/api/chat`, `/api/contact`, `/api/quote`
   - Folosește Vercel Edge Config sau Upstash Redis

3. **Input Validation**
   - Adaugă Zod pentru toate API endpoints
   - Validează email, phone, amounts, etc.

4. **CORS Configuration**
   - Configurează CORS pentru API routes dacă e necesar

5. **Security Headers**
   - Adaugă în `next.config.ts` sau middleware:
     - `X-Frame-Options`
     - `X-Content-Type-Options`
     - `Referrer-Policy`
     - `Content-Security-Policy`

### 5.2 Scalability ⚠️

**Probleme:**

1. **In-Memory Storage** (CRITIC)
   - Elimină complet `memoryStore`
   - Folosește doar Prisma/PostgreSQL

2. **Database Connection**
   - Fix Prisma client initialization
   - Configurează connection pooling

3. **Caching**
   - Consideră Redis pentru:
     - Rate limiting
     - Session storage
     - Cache pentru pricing/static data

4. **Background Jobs**
   - Consideră queue system (BullMQ) pentru:
     - Email sending
     - Payment verification
     - Project status updates

### 5.3 Error Handling ⚠️

**Probleme:**
- Lipsă error boundaries în React
- Error handling inconsistent în API routes
- Lipsă logging structurat

**Soluție:**
```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
  }
}

// În API routes
try {
  // ...
} catch (error) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  
  // Log error (Sentry, etc.)
  console.error('Unexpected error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### 5.4 Monitoring & Observability ⚠️

**Lipsă:**
- Error tracking (Sentry)
- Analytics (Vercel Analytics sau Plausible)
- Logging structurat
- Performance monitoring

**Recomandări:**
- Adaugă Sentry pentru error tracking
- Configurează Vercel Analytics
- Implementează structured logging (Pino, Winston)

### 5.5 Environment Variables ⚠️

**Probleme:**
- `NEXT_PUBLIC_ADMIN_PASSWORD` expus în client bundle
- Lipsă validare la startup
- Lipsă `.env.example` complet

**Soluție:**
```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string(),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  SOLANA_TREASURY_WALLET: z.string().length(44),
  SOLANA_RPC_URL: z.string().url().optional(),
  RESEND_API_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  // Admin password NU în NEXT_PUBLIC_*
  ADMIN_PASSWORD_HASH: z.string(), // Hash, nu plain text
});

export const env = envSchema.parse(process.env);
```

### 5.6 Testing ⚠️

**Lipsă complet:**
- Unit tests
- Integration tests
- E2E tests

**Recomandări:**
- Adaugă Vitest pentru unit tests
- Adaugă Playwright pentru E2E
- Testează payment flows (Stripe test mode)

---

## 6. Checklist pentru Production

### Critical (Must Fix) 🔴
- [ ] Elimină in-memory storage, folosește doar Prisma
- [ ] Implementează autentificare server-side pentru admin
- [ ] Protejează `/api/admin/*` cu middleware
- [ ] Elimină password hardcoded și `NEXT_PUBLIC_ADMIN_PASSWORD`
- [ ] Fix Prisma client initialization
- [ ] Adaugă input validation (Zod) pentru toate API endpoints
- [ ] Implementează rate limiting pentru chat/contact/quote

### High Priority ⚠️
- [ ] Adaugă error tracking (Sentry)
- [ ] Implementează structured logging
- [ ] Adaugă security headers
- [ ] Îmbunătățește Solana payment verification
- [ ] Adaugă environment variable validation
- [ ] Configurează CORS dacă e necesar

### Medium Priority
- [ ] Adaugă database indexes
- [ ] Implementează caching (Redis)
- [ ] Adaugă background jobs pentru emails
- [ ] Îmbunătățește error handling
- [ ] Adaugă monitoring & analytics

### Nice to Have
- [ ] Adaugă unit tests
- [ ] Adaugă E2E tests
- [ ] Documentează API endpoints
- [ ] Adaugă API versioning dacă e necesar

---

## 7. Concluzie

### Puncte Forte ✅
- Structură proiect clară și organizată
- Schema Prisma bine proiectată
- Integrări externe (Stripe, Solana, OpenAI) funcționale
- TypeScript strict mode activat
- Next.js 16 cu App Router

### Probleme Critice 🔴
1. **Securitate:** Admin routes neprotejate
2. **Scalabilitate:** In-memory storage
3. **Production Ready:** Nu este gata pentru production în starea actuală

### Recomandare Finală

**Status:** ⚠️ **NU este gata pentru production**

**Acțiuni imediate:**
1. Fix securitatea admin routes (1-2 zile)
2. Elimină in-memory storage (1 zi)
3. Adaugă input validation (1 zi)
4. Implementează rate limiting (1 zi)

**Timeline estimat pentru production-ready:** 1 săptămână de lucru focused

---

**Next Steps:**
1. Prioritizează fix-urile critice
2. Creează branch pentru security fixes
3. Testează thoroughly înainte de deploy
4. Consideră staging environment pentru testing

---

*Raport generat de @architect ATLAS*  
*Pentru întrebări sau clarificări, contactează echipa de dezvoltare.*
