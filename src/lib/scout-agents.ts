/**
 * AI Marketing Agents System
 * 
 * SCOUT - Monitors Reddit/Twitter for potential leads
 * QUALIFIER - Analyzes and scores leads (1-10)
 * WRITER - Generates personalized outreach messages
 * OUTREACH - Sends messages and tracks responses
 */

import Anthropic from "@anthropic-ai/sdk";
import { kv } from "@vercel/kv";

// ============================================
// TYPES
// ============================================

export interface ScoutLead {
  id: string;
  platform: "reddit" | "twitter";
  postId: string;
  postUrl: string;
  author: string;
  authorUrl?: string;
  content: string;
  title?: string;
  subreddit?: string;
  createdAt: string;
  discoveredAt: string;
  
  // Qualification
  score?: number; // 1-10
  qualifiedAt?: string;
  qualificationReason?: string;
  intent?: "high" | "medium" | "low";
  budget?: "unknown" | "low" | "medium" | "high";
  projectType?: string;
  
  // Outreach
  status: "new" | "qualified" | "outreach_pending" | "outreach_sent" | "replied" | "converted" | "ignored";
  outreachMessage?: string;
  outreachSentAt?: string;
  responseReceived?: string;
  
  // Metadata
  keywords: string[];
  confidence: number;
}

export interface ScoutConfig {
  enabled: boolean;
  platforms: {
    reddit: {
      enabled: boolean;
      subreddits: string[];
      keywords: string[];
      minScore: number;
      maxPostsPerScan: number;
    };
    twitter: {
      enabled: boolean;
      keywords: string[];
      minScore: number;
      maxPostsPerScan: number;
    };
  };
  autoOutreach: boolean;
  minQualificationScore: number;
  scanIntervalMinutes: number;
  lastScanAt?: string;
}

export interface ScanResult {
  platform: string;
  postsScanned: number;
  leadsFound: number;
  leadsQualified: number;
  errors: string[];
}

// ============================================
// DEFAULT CONFIG
// ============================================

export const DEFAULT_SCOUT_CONFIG: ScoutConfig = {
  enabled: true,
  platforms: {
    reddit: {
      enabled: true,
      subreddits: [
        "startups",
        "SaaS", 
        "Entrepreneur",
        "smallbusiness",
        "webdev",
        "web_design",
        "freelance",
        "sideproject",
        "indiehackers",
        "artificial",
        "ChatGPT",
        "OpenAI",
      ],
      keywords: [
        "need a website",
        "looking for developer",
        "need someone to build",
        "anyone know a good agency",
        "looking for agency",
        "need web developer",
        "build my website",
        "create a landing page",
        "need an app",
        "need ai solution",
        "ai for my business",
        "automate my",
        "looking to automate",
        "need saas built",
        "mvp development",
        "looking for tech partner",
        "budget for website",
        "cost of building",
        "how much to build",
      ],
      minScore: 5,
      maxPostsPerScan: 50,
    },
    twitter: {
      enabled: true,
      keywords: [
        "need a website built",
        "looking for web developer",
        "need someone to build my app",
        "anyone know a good agency",
        "looking for ai developer",
        "need mvp built",
        "startup looking for developer",
      ],
      minScore: 5,
      maxPostsPerScan: 30,
    },
  },
  autoOutreach: false, // Start with manual approval
  minQualificationScore: 6,
  scanIntervalMinutes: 30,
};

// ============================================
// STORAGE HELPERS
// ============================================

const SCOUT_LEADS_KEY = "scout:leads";
const SCOUT_CONFIG_KEY = "scout:config";
const SCOUT_STATS_KEY = "scout:stats";

export async function getScoutConfig(): Promise<ScoutConfig> {
  try {
    const config = await kv.get<ScoutConfig>(SCOUT_CONFIG_KEY);
    return config || DEFAULT_SCOUT_CONFIG;
  } catch {
    return DEFAULT_SCOUT_CONFIG;
  }
}

export async function saveScoutConfig(config: ScoutConfig): Promise<void> {
  await kv.set(SCOUT_CONFIG_KEY, config);
}

export async function getScoutLeads(): Promise<ScoutLead[]> {
  try {
    const leads = await kv.get<ScoutLead[]>(SCOUT_LEADS_KEY);
    return leads || [];
  } catch {
    return [];
  }
}

export async function saveScoutLead(lead: ScoutLead): Promise<void> {
  const leads = await getScoutLeads();
  const existingIndex = leads.findIndex(l => l.id === lead.id);
  
  if (existingIndex >= 0) {
    leads[existingIndex] = lead;
  } else {
    leads.unshift(lead); // Add to beginning
  }
  
  // Keep only last 500 leads
  const trimmed = leads.slice(0, 500);
  await kv.set(SCOUT_LEADS_KEY, trimmed);
}

export async function updateScoutStats(stats: Partial<{
  totalScans: number;
  totalLeadsFound: number;
  totalQualified: number;
  totalOutreachSent: number;
  totalReplies: number;
  totalConverted: number;
  lastScanAt: string;
}>): Promise<void> {
  const current = await kv.get<any>(SCOUT_STATS_KEY) || {};
  await kv.set(SCOUT_STATS_KEY, { ...current, ...stats });
}

export async function getScoutStats() {
  return await kv.get<any>(SCOUT_STATS_KEY) || {
    totalScans: 0,
    totalLeadsFound: 0,
    totalQualified: 0,
    totalOutreachSent: 0,
    totalReplies: 0,
    totalConverted: 0,
  };
}

// ============================================
// SCOUT AGENT - Platform Monitoring
// ============================================

/**
 * Scan Reddit for potential leads
 */
export async function scanReddit(config: ScoutConfig): Promise<ScanResult> {
  const result: ScanResult = {
    platform: "reddit",
    postsScanned: 0,
    leadsFound: 0,
    leadsQualified: 0,
    errors: [],
  };

  // Check if Reddit credentials exist
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret) {
    result.errors.push("Reddit API credentials not configured");
    return result;
  }

  try {
    // Get Reddit access token
    const tokenResponse = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "n01.app:scout:v1.0 (by /u/n01app)",
      },
      body: username && password 
        ? `grant_type=password&username=${username}&password=${password}`
        : "grant_type=client_credentials",
    });

    if (!tokenResponse.ok) {
      result.errors.push(`Reddit auth failed: ${tokenResponse.status}`);
      return result;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Search each subreddit
    for (const subreddit of config.platforms.reddit.subreddits) {
      try {
        const searchUrl = `https://oauth.reddit.com/r/${subreddit}/new.json?limit=${config.platforms.reddit.maxPostsPerScan}`;
        
        const searchResponse = await fetch(searchUrl, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "User-Agent": "n01.app:scout:v1.0 (by /u/n01app)",
          },
        });

        if (!searchResponse.ok) continue;

        const searchData = await searchResponse.json();
        const posts = searchData.data?.children || [];
        result.postsScanned += posts.length;

        for (const post of posts) {
          const { data } = post;
          const combinedText = `${data.title || ""} ${data.selftext || ""}`.toLowerCase();
          
          // Check if post matches any keywords
          const matchedKeywords = config.platforms.reddit.keywords.filter(kw => 
            combinedText.includes(kw.toLowerCase())
          );

          if (matchedKeywords.length > 0) {
            // Found a potential lead!
            const lead: ScoutLead = {
              id: `reddit_${data.id}`,
              platform: "reddit",
              postId: data.id,
              postUrl: `https://reddit.com${data.permalink}`,
              author: data.author,
              authorUrl: `https://reddit.com/u/${data.author}`,
              content: data.selftext || data.title,
              title: data.title,
              subreddit: subreddit,
              createdAt: new Date(data.created_utc * 1000).toISOString(),
              discoveredAt: new Date().toISOString(),
              status: "new",
              keywords: matchedKeywords,
              confidence: Math.min(matchedKeywords.length * 0.3, 1),
            };

            // Check if we already have this lead
            const existingLeads = await getScoutLeads();
            const exists = existingLeads.some(l => l.id === lead.id);
            
            if (!exists) {
              // Qualify the lead
              const qualifiedLead = await qualifyLead(lead);
              await saveScoutLead(qualifiedLead);
              result.leadsFound++;
              
              if (qualifiedLead.score && qualifiedLead.score >= config.minQualificationScore) {
                result.leadsQualified++;
              }
            }
          }
        }

        // Rate limiting: wait between subreddits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (err: any) {
        result.errors.push(`Error scanning r/${subreddit}: ${err.message}`);
      }
    }

  } catch (err: any) {
    result.errors.push(`Reddit scan error: ${err.message}`);
  }

  return result;
}

/**
 * Scan Twitter/X for potential leads
 */
export async function scanTwitter(config: ScoutConfig): Promise<ScanResult> {
  const result: ScanResult = {
    platform: "twitter",
    postsScanned: 0,
    leadsFound: 0,
    leadsQualified: 0,
    errors: [],
  };

  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  
  if (!bearerToken) {
    result.errors.push("Twitter API credentials not configured");
    return result;
  }

  try {
    for (const keyword of config.platforms.twitter.keywords.slice(0, 5)) { // Limit queries
      try {
        // Twitter API v2 recent search
        const searchUrl = new URL("https://api.twitter.com/2/tweets/search/recent");
        searchUrl.searchParams.set("query", `"${keyword}" -is:retweet lang:en`);
        searchUrl.searchParams.set("max_results", "10");
        searchUrl.searchParams.set("tweet.fields", "created_at,author_id,text");
        searchUrl.searchParams.set("expansions", "author_id");
        searchUrl.searchParams.set("user.fields", "username,name");

        const response = await fetch(searchUrl.toString(), {
          headers: {
            "Authorization": `Bearer ${bearerToken}`,
          },
        });

        if (!response.ok) {
          if (response.status === 429) {
            result.errors.push("Twitter rate limit reached");
            break;
          }
          continue;
        }

        const data = await response.json();
        const tweets = data.data || [];
        const users = data.includes?.users || [];
        result.postsScanned += tweets.length;

        for (const tweet of tweets) {
          const author = users.find((u: any) => u.id === tweet.author_id);
          
          const lead: ScoutLead = {
            id: `twitter_${tweet.id}`,
            platform: "twitter",
            postId: tweet.id,
            postUrl: `https://twitter.com/${author?.username || "i"}/status/${tweet.id}`,
            author: author?.username || "unknown",
            authorUrl: author ? `https://twitter.com/${author.username}` : undefined,
            content: tweet.text,
            createdAt: tweet.created_at,
            discoveredAt: new Date().toISOString(),
            status: "new",
            keywords: [keyword],
            confidence: 0.5,
          };

          // Check if we already have this lead
          const existingLeads = await getScoutLeads();
          const exists = existingLeads.some(l => l.id === lead.id);
          
          if (!exists) {
            const qualifiedLead = await qualifyLead(lead);
            await saveScoutLead(qualifiedLead);
            result.leadsFound++;
            
            if (qualifiedLead.score && qualifiedLead.score >= config.minQualificationScore) {
              result.leadsQualified++;
            }
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (err: any) {
        result.errors.push(`Error searching "${keyword}": ${err.message}`);
      }
    }

  } catch (err: any) {
    result.errors.push(`Twitter scan error: ${err.message}`);
  }

  return result;
}

// ============================================
// QUALIFIER AGENT - Lead Scoring
// ============================================

/**
 * Use Claude to analyze and score a lead
 */
export async function qualifyLead(lead: ScoutLead): Promise<ScoutLead> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    // Fallback to basic scoring
    return {
      ...lead,
      score: lead.keywords.length >= 2 ? 6 : 4,
      intent: lead.keywords.length >= 2 ? "medium" : "low",
      budget: "unknown",
      qualifiedAt: new Date().toISOString(),
      qualificationReason: "Basic keyword matching (Claude not available)",
    };
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const prompt = `Analyze this social media post and determine if this person is a potential client for an AI/web development agency.

POST DETAILS:
Platform: ${lead.platform}
${lead.subreddit ? `Subreddit: r/${lead.subreddit}` : ""}
Author: ${lead.author}
${lead.title ? `Title: ${lead.title}` : ""}
Content: ${lead.content}
Keywords matched: ${lead.keywords.join(", ")}

Respond in JSON format:
{
  "score": <1-10, where 10 is perfect lead>,
  "intent": "<high|medium|low>",
  "budget": "<unknown|low|medium|high>",
  "projectType": "<website|webapp|mobile|saas|ai|other>",
  "reason": "<brief explanation>",
  "shouldContact": <true|false>
}

Scoring guide:
- 9-10: Clear need, mentions budget, ready to hire
- 7-8: Strong interest, specific project in mind
- 5-6: General interest, might need convincing
- 3-4: Vague interest, probably just exploring
- 1-2: Not a real lead, spam, or wrong fit`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = response.content[0].type === "text" ? response.content[0].text : "";
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      
      return {
        ...lead,
        score: analysis.score,
        intent: analysis.intent,
        budget: analysis.budget,
        projectType: analysis.projectType,
        qualifiedAt: new Date().toISOString(),
        qualificationReason: analysis.reason,
        status: analysis.score >= 6 ? "qualified" : "new",
      };
    }
  } catch (err: any) {
    console.error("Qualification error:", err);
  }

  // Fallback
  return {
    ...lead,
    score: 5,
    intent: "medium",
    budget: "unknown",
    qualifiedAt: new Date().toISOString(),
    qualificationReason: "Unable to analyze with AI",
  };
}

// ============================================
// WRITER AGENT - Message Generation
// ============================================

/**
 * Generate personalized outreach message for a lead
 */
export async function generateOutreachMessage(lead: ScoutLead): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return getDefaultOutreachMessage(lead);
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const prompt = `Generate a helpful, non-salesy reply to this ${lead.platform} post. The reply should:

1. Acknowledge their specific need/question
2. Briefly mention you work with an AI agency (n01.app) that could help
3. Offer value first (tip, insight, or relevant experience)
4. Be casual and authentic, not corporate
5. Be SHORT (2-4 sentences max for Twitter, 3-5 for Reddit)
6. NOT be pushy or salesy
7. End with a soft CTA (like "happy to share more if useful")

POST DETAILS:
Platform: ${lead.platform}
${lead.subreddit ? `Subreddit: r/${lead.subreddit}` : ""}
${lead.title ? `Title: ${lead.title}` : ""}
Content: ${lead.content}
Project type detected: ${lead.projectType || "web/software development"}

IMPORTANT: This should feel like a helpful community member, not an ad. The goal is to start a conversation, not close a sale.

Reply only with the message text, no quotes or explanation.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const message = response.content[0].type === "text" ? response.content[0].text.trim() : "";
    return message || getDefaultOutreachMessage(lead);

  } catch (err: any) {
    console.error("Message generation error:", err);
    return getDefaultOutreachMessage(lead);
  }
}

function getDefaultOutreachMessage(lead: ScoutLead): string {
  if (lead.platform === "twitter") {
    return `Interesting problem! We've helped a few startups with similar ${lead.projectType || "projects"}. Happy to share what worked if useful 🙂`;
  }
  
  return `Hey! I work with a small AI dev agency and we've tackled similar ${lead.projectType || "projects"} before. 

If you'd like, I can share some insights on approach/cost/timeline based on what we've seen. No pressure either way - just happy to help if useful!`;
}

// ============================================
// OUTREACH AGENT - Message Sending
// ============================================

/**
 * Send outreach message (Reddit comment or Twitter reply)
 * Returns true if sent successfully
 */
export async function sendOutreach(lead: ScoutLead): Promise<{ success: boolean; error?: string }> {
  // Generate message if not already generated
  if (!lead.outreachMessage) {
    lead.outreachMessage = await generateOutreachMessage(lead);
  }

  if (lead.platform === "reddit") {
    return sendRedditComment(lead);
  } else if (lead.platform === "twitter") {
    return sendTwitterReply(lead);
  }

  return { success: false, error: "Unknown platform" };
}

async function sendRedditComment(lead: ScoutLead): Promise<{ success: boolean; error?: string }> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    return { success: false, error: "Reddit credentials not configured for posting" };
  }

  try {
    // Get access token
    const tokenResponse = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "n01.app:scout:v1.0 (by /u/n01app)",
      },
      body: `grant_type=password&username=${username}&password=${password}`,
    });

    if (!tokenResponse.ok) {
      return { success: false, error: "Reddit auth failed" };
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Post comment
    const commentResponse = await fetch("https://oauth.reddit.com/api/comment", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "n01.app:scout:v1.0 (by /u/n01app)",
      },
      body: `thing_id=t3_${lead.postId}&text=${encodeURIComponent(lead.outreachMessage || "")}`,
    });

    if (!commentResponse.ok) {
      const error = await commentResponse.text();
      return { success: false, error: `Comment failed: ${error}` };
    }

    // Update lead status
    lead.status = "outreach_sent";
    lead.outreachSentAt = new Date().toISOString();
    await saveScoutLead(lead);

    return { success: true };

  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function sendTwitterReply(lead: ScoutLead): Promise<{ success: boolean; error?: string }> {
  // Twitter requires OAuth 1.0a for posting, which is more complex
  // For now, return instructions for manual posting
  
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    // Mark as pending manual action
    lead.status = "outreach_pending";
    await saveScoutLead(lead);
    return { 
      success: false, 
      error: "Twitter OAuth not configured. Message ready for manual posting." 
    };
  }

  try {
    // OAuth 1.0a signing would go here
    // For MVP, we'll mark as ready for manual posting
    lead.status = "outreach_pending";
    await saveScoutLead(lead);
    
    return { 
      success: false, 
      error: "Twitter auto-reply not implemented yet. Message ready for manual posting." 
    };

  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ============================================
// MAIN SCAN FUNCTION
// ============================================

export async function runFullScan(): Promise<{
  success: boolean;
  results: ScanResult[];
  summary: {
    totalScanned: number;
    totalLeadsFound: number;
    totalQualified: number;
    duration: number;
  };
}> {
  const startTime = Date.now();
  const config = await getScoutConfig();
  const results: ScanResult[] = [];

  if (!config.enabled) {
    return {
      success: false,
      results: [],
      summary: { totalScanned: 0, totalLeadsFound: 0, totalQualified: 0, duration: 0 },
    };
  }

  // Scan Reddit
  if (config.platforms.reddit.enabled) {
    const redditResult = await scanReddit(config);
    results.push(redditResult);
  }

  // Scan Twitter
  if (config.platforms.twitter.enabled) {
    const twitterResult = await scanTwitter(config);
    results.push(twitterResult);
  }

  // Update config with last scan time
  config.lastScanAt = new Date().toISOString();
  await saveScoutConfig(config);

  // Update stats
  const stats = await getScoutStats();
  await updateScoutStats({
    totalScans: (stats.totalScans || 0) + 1,
    totalLeadsFound: (stats.totalLeadsFound || 0) + results.reduce((a, r) => a + r.leadsFound, 0),
    totalQualified: (stats.totalQualified || 0) + results.reduce((a, r) => a + r.leadsQualified, 0),
    lastScanAt: new Date().toISOString(),
  });

  return {
    success: true,
    results,
    summary: {
      totalScanned: results.reduce((a, r) => a + r.postsScanned, 0),
      totalLeadsFound: results.reduce((a, r) => a + r.leadsFound, 0),
      totalQualified: results.reduce((a, r) => a + r.leadsQualified, 0),
      duration: Date.now() - startTime,
    },
  };
}
