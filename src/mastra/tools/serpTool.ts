import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

function hostnameOf(link: string): string {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export const serpTool = createTool({
  id: 'serp-google-organic',
  description:
    'Fetches the live top Google organic search results (title, link, domain, snippet) for a target keyword using SerpApi. Call this exactly once with the target keyword before judging competitor authority.',
  inputSchema: z.object({
    keyword: z.string().min(1).describe('The target keyword to search on Google'),
    country: z
      .string()
      .optional()
      .describe('Two-letter Google country code, e.g. "us" or "ng". Defaults to "us".'),
  }),
  outputSchema: z.object({
    keyword: z.string(),
    competitors: z.array(
      z.object({
        position: z.number(),
        title: z.string(),
        link: z.string(),
        domain: z.string(),
        snippet: z.string(),
      })
    ),
  }),
  // Works with both the older ({ context }) and newer (inputData) Mastra execute signatures.
  execute: async (args: any) => {
    const input = args?.context ?? args?.inputData ?? args;
    const keyword: string = input.keyword;
    const country: string = input.country || 'us';

    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing SERPAPI_API_KEY. Add it to .env.local');
    }

    const params = new URLSearchParams({
      engine: 'google',
      q: keyword,
      api_key: apiKey,
      num: '10',
      hl: 'en',
      gl: country,
    });

    const res = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`SerpApi request failed (${res.status}): ${body.slice(0, 200)}`);
    }

    const data: any = await res.json();
    if (data?.error) {
      throw new Error(`SerpApi error: ${data.error}`);
    }

    const organic: any[] = Array.isArray(data?.organic_results) ? data.organic_results : [];

    const competitors = organic.slice(0, 10).map((r, i) => ({
      position: typeof r.position === 'number' ? r.position : i + 1,
      title: String(r.title ?? ''),
      link: String(r.link ?? ''),
      domain: hostnameOf(String(r.link ?? '')),
      snippet: String(r.snippet ?? ''),
    }));

    return { keyword, competitors };
  },
});
