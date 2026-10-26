import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Analysis from '@/models/Analysis';
import { mastra } from '@/src/mastra';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const ResultSchema = z.object({
  domainViabilityScore: z.coerce.number().min(1).max(100),
  seamlessRankingVerdict: z.string().min(1),
  domainMatchType: z.enum(['Exact Match', 'Partial Match', 'Branded']),
  titleTag: z.string().min(1),
  metaDescription: z.string().min(1),
  recommendations: z.array(z.string()).default([]),
  competitors: z
    .array(
      z.object({
        title: z.string().default(''),
        link: z.string().default(''),
        snippet: z.string().default(''),
      })
    )
    .default([]),
});

function normaliseDomain(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '');
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const keyword = typeof body.keyword === 'string' ? body.keyword.trim() : '';
    const domainRaw = typeof body.domain === 'string' ? body.domain : '';
    const domain = normaliseDomain(domainRaw);

    if (!keyword || !domain) {
      return NextResponse.json(
        { error: 'Both a target keyword and a proposed domain name are required.' },
        { status: 400 }
      );
    }

    if (!process.env.DEEPSEEK_API_KEY || !process.env.SERPAPI_API_KEY) {
      return NextResponse.json(
        { error: 'Missing DEEPSEEK_API_KEY or SERPAPI_API_KEY in .env.local.' },
        { status: 500 }
      );
    }

    const agent = mastra.getAgent('seoAgent');

    const prompt = `TARGET KEYWORD: ${keyword}
PROPOSED DOMAIN NAME: ${domain}

Analyse whether a new website on this domain can top Google for this keyword. Remember to call the serpTool once, then reply with the strict JSON object only.`;

    const response = await agent.generate([{ role: 'user', content: prompt }], {
      maxSteps: 5,
      structuredOutput: {
        schema: ResultSchema,
        jsonPromptInjection: 'auto',
      },
    });

    const parsed = ResultSchema.parse(response.object);

    await dbConnect();
    const saved = await Analysis.create({ keyword, domain, ...parsed });

    return NextResponse.json({ analysis: JSON.parse(JSON.stringify(saved)) });
  } catch (err) {
    console.error('[analyze] error:', err);
    const message = err instanceof Error ? err.message : 'Unexpected error while analysing.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Returns recent analyses so the UI can show past domain ideas.
export async function GET() {
  try {
    await dbConnect();
    const analyses = await Analysis.find().sort({ createdAt: -1 }).limit(12).lean();
    return NextResponse.json({ analyses: JSON.parse(JSON.stringify(analyses)) });
  } catch (err) {
    console.error('[analyze:GET] error:', err);
    const message = err instanceof Error ? err.message : 'Could not load history.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
