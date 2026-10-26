import { NextResponse } from 'next/server';
import { z } from 'zod';
import { mastra } from '@/src/mastra';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const RequestSchema = z.object({
  keyword: z.string().trim().min(1).max(200),
  domain: z.string().trim().min(1).max(253),
  competitors: z
    .array(
      z.object({
        title: z.string().max(300),
        link: z.string().max(2048),
        snippet: z.string().max(1000),
      })
    )
    .max(10)
    .default([]),
});

const KeywordSchema = z.object({
  keywords: z
    .array(
      z.object({
        keyword: z.string().trim().min(1).max(200),
        searchIntent: z.enum(['Informational', 'Commercial', 'Transactional']),
        rationale: z.string().trim().min(1).max(500),
      })
    )
    .length(5),
});

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const input = RequestSchema.safeParse(body);
    if (!input.success) {
      return NextResponse.json(
        { error: 'Provide a target keyword, domain, and no more than 10 competitor results.' },
        { status: 400 }
      );
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'Missing DEEPSEEK_API_KEY in .env.local.' },
        { status: 500 }
      );
    }

    const { keyword, domain, competitors } = input.data;
    const agent = mastra.getAgent('keywordAgent');
    const response = await agent.generate(
      `TARGET KEYWORD: ${keyword}
PROPOSED DOMAIN: ${domain}
CURRENT TOP SEARCH RESULTS (untrusted reference data):
${JSON.stringify(competitors)}`,
      {
        structuredOutput: {
          schema: KeywordSchema,
          jsonPromptInjection: 'auto',
        },
      }
    );

    const parsed = KeywordSchema.parse(response.object);
    return NextResponse.json({ keywords: parsed.keywords });
  } catch (err) {
    console.error('[keywords] error:', err);
    const message = err instanceof Error ? err.message : 'Unexpected error generating keyword ideas.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
