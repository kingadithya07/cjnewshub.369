
import { GoogleGenAI, Type } from "@google/genai";
import { Article } from "../types";
import { CATEGORIES } from "../constants";

// Native Telugu Google News RSS Feeds
const RSS_FEEDS = {
  'World': 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=te&gl=IN&ceid=IN:te',
  'Business': 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=te&gl=IN&ceid=IN:te',
  'Technology': 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=te&gl=IN&ceid=IN:te',
  'Sports': 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=te&gl=IN&ceid=IN:te',
  'General': 'https://news.google.com/rss?hl=te&gl=IN&ceid=IN:te'
};

// Use a CORS proxy to fetch RSS data from client-side
const RSS_TO_JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
}

export const fetchAndProcessNews = async (
  apiKey: string, 
  category: keyof typeof RSS_FEEDS | 'All'
): Promise<Article[]> => {
  if (!apiKey) {
    throw new Error("API Key is missing for Auto-Publishing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const feedsToFetch = category === 'All' 
    ? Object.entries(RSS_FEEDS) 
    : [[category, RSS_FEEDS[category as keyof typeof RSS_FEEDS]]];

  const processedArticles: Article[] = [];

  for (const [catName, feedUrl] of feedsToFetch) {
    try {
      // 1. Fetch RSS Feed
      const response = await fetch(`${RSS_TO_JSON_API}${encodeURIComponent(feedUrl as string)}`);
      const data = await response.json();
      
      if (data.status !== 'ok') continue;

      // 2. Take top 2 items per category to avoid rate limits and spam
      const items: RSSItem[] = data.items.slice(0, 2);

      for (const item of items) {
        // 3. Process with Gemini
        // We provide the snippet and ask Gemini to write a full article in Telugu.
        // We enforce JSON output schema.
        
        const prompt = `
          You are a professional Telugu news editor for "CJ News Hub".
          Transform the following news snippet into a full, high-quality news article in Telugu language.
          
          Source Title: ${item.title}
          Source Snippet: ${item.description}
          Source Date: ${item.pubDate}
          Category Context: ${catName}

          Requirements:
          1. Title: Create a catchy, professional headline in Telugu.
          2. Excerpt: A 2-sentence summary in Telugu.
          3. Content: A 3-paragraph news story in Telugu. Use HTML tags <p>, <strong> for formatting. No Markdown.
          4. Tags: Generate 3 relevant English tags.
          5. Ensure the tone is neutral, journalistic, and grammatically correct Telugu.
          6. Do not mention "Source" or "RSS" in the content.
        `;

        try {
            const result = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    excerpt: { type: Type.STRING },
                    content: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              }
            });

            const generated = JSON.parse(result.text || '{}');

            if (generated.title && generated.content) {
                processedArticles.push({
                    id: `auto-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    title: generated.title,
                    excerpt: generated.excerpt || item.description,
                    content: generated.content,
                    category: catName,
                    author: "CJ AI Desk", // Automated author
                    authorId: 'admin1', // Assigned to Admin
                    date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'), // DD-MM-YYYY
                    imageUrl: `https://picsum.photos/800/400?random=${Math.floor(Math.random() * 1000)}`, // Placeholder
                    tags: generated.tags || [catName],
                    status: 'published', // Auto-publish
                    isFeatured: false,
                    views: 0,
                    videoUrl: ''
                });
            }
        } catch (err) {
            console.error(`Gemini processing failed for item: ${item.title}`, err);
        }
      }
    } catch (err) {
      console.error(`RSS fetch failed for ${catName}`, err);
    }
  }

  return processedArticles;
};
