'use client';

import { useEffect, useState } from 'react';

const AUTHORITY_GIANTS = [
  'wikipedia.org', 'amazon.', 'forbes.com', 'nytimes.com', 'youtube.com', 'reddit.com',
  'healthline.com', 'webmd.com', 'nih.gov', 'cdc.gov', 'gov', 'edu', 'bbc.', 'cnn.com',
  'investopedia.com', 'ebay.com', 'walmart.com', 'pinterest.com', 'facebook.com',
  'linkedin.com', 'quora.com', 'medium.com', 'shopify.com', 'hubspot.com', 'nerdwallet.com',
  'tripadvisor.com', 'yelp.com', 'imdb.com', 'github.com', 'stackoverflow.com',
];

function isGiant(link) {
  try {
    const host = new URL(link).hostname.replace(/^www\./, '');
    return AUTHORITY_GIANTS.some((g) => host.includes(g));
  } catch {
    return false;
  }
}

function hostOf(link) {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return link;
  }
}

function verdictTone(verdict = '') {
  const v = verdict.toLowerCase();
  if (v.includes('seamless')) return { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', text: 'text-emerald-600' };
  if (v.includes('possible')) return { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 ring-amber-200', text: 'text-amber-600' };
  return { bar: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 ring-rose-200', text: 'text-rose-600' };
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
      className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function ScoreRing({ score, className }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="10" className="stroke-slate-100" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${className} transition-all duration-700`}
          stroke="currentColor"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tracking-tight text-slate-900">{score}</span>
        <span className="text-[11px] uppercase tracking-wider text-slate-400">out of 100</span>
      </div>
    </div>
  );
}

function Report({ a }) {
  const tone = verdictTone(a.seamlessRankingVerdict);
  const giants = (a.competitors || []).filter((c) => isGiant(c.link)).length;
  const total = (a.competitors || []).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className={tone.text}>
            <ScoreRing score={a.domainViabilityScore} className={tone.text} />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${tone.badge}`}>
                {a.seamlessRankingVerdict}
              </span>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200">
                {a.domainMatchType}
              </span>
            </div>
            <p className="truncate text-lg font-semibold text-slate-900">{a.domain}</p>
            <p className="text-sm text-slate-500">
              Target keyword: <span className="font-medium text-slate-700">{a.keyword}</span>
            </p>
            <p className="text-sm text-slate-500">
              {giants} of {total} top results look like authority giants.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Optimised metadata
        </h3>
        <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="truncate text-xs text-slate-500">https://{a.domain}</p>
          <p className="mt-1 text-lg leading-snug text-blue-700">{a.titleTag}</p>
          <p className="mt-1 text-sm text-slate-600">{a.metaDescription}</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">
                Title tag ({a.titleTag.length} chars)
              </p>
              <p className="text-sm text-slate-800">{a.titleTag}</p>
            </div>
            <CopyButton value={a.titleTag} />
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">
                Meta description ({a.metaDescription.length} chars)
              </p>
              <p className="text-sm text-slate-800">{a.metaDescription}</p>
            </div>
            <CopyButton value={a.metaDescription} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Roadmap to #1
        </h3>
        <ol className="space-y-3">
          {(a.recommendations || []).map((r, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-slate-700">{r}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Live competitor barriers
        </h3>
        <ul className="divide-y divide-slate-100">
          {(a.competitors || []).map((c, i) => {
            const giant = isGiant(c.link);
            return (
              <li key={i} className="flex gap-3 py-3">
                <span className="w-5 shrink-0 pt-0.5 text-sm font-medium text-slate-400">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={c.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-sm font-medium text-slate-900 hover:underline"
                    >
                      {c.title || hostOf(c.link)}
                    </a>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        giant ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {giant ? 'Authority giant' : 'Beatable?'}
                    </span>
                  </div>
                  <p className="truncate text-xs text-slate-400">{hostOf(c.link)}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{c.snippet}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [keywordSuggestions, setKeywordSuggestions] = useState([]);
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [keywordError, setKeywordError] = useState('');
  const [history, setHistory] = useState([]);

  async function loadHistory() {
    try {
      const res = await fetch('/api/analyze');
      const data = await res.json();
      if (res.ok) setHistory(data.analyses || []);
    } catch {}
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setKeywordSuggestions([]);
    setKeywordError('');
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, domain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed.');
      setResult(data.analysis);
      loadHistory();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateKeywords() {
    if (!result) return;

    setKeywordError('');
    setKeywordSuggestions([]);
    setKeywordLoading(true);
    try {
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: result.keyword,
          domain: result.domain,
          competitors: result.competitors,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not generate keyword ideas.');
      setKeywordSuggestions(data.keywords || []);
    } catch (err) {
      setKeywordError(err.message || 'Could not generate keyword ideas.');
    } finally {
      setKeywordLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <header className="mb-10 text-center">
          <span className="inline-block rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
            AI SEO Domain Analyzer
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Will this domain actually rank?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Enter a keyword and a domain idea. We check live Google results and predict whether
            you can reach #1 or will hit an authority wall.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Target keyword</span>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. best standing desk"
                required
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Proposed domain</span>
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. beststandingdesk.com"
                required
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
              </svg>
            )}
            {loading ? 'Analysing live SERPs…' : 'Analyse domain'}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-8 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/70" />
            ))}
          </div>
        )}

        {result && !loading && (
          <section className="mt-8">
            <Report a={result} />
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Find easier keyword opportunities
                  </h2>
                  <p className="mt-1 max-w-xl text-sm text-slate-500">
                    Get specific, long-tail ideas based on this analysis and its competitors.
                    Suggestions are estimates, not guaranteed rankings or search-volume data.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateKeywords}
                  disabled={keywordLoading}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {keywordLoading ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.64 5.64l2.12 2.12m8.48 8.48 2.12 2.12m0-12.72-2.12 2.12m-8.48 8.48-2.12 2.12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  )}
                  {keywordLoading ? 'Finding keyword ideas…' : 'Generate keyword ideas'}
                </button>
              </div>

              {keywordError && (
                <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {keywordError}
                </p>
              )}

              {keywordSuggestions.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                    Keyword opportunities to validate
                  </p>
                  <ul className="divide-y divide-slate-100">
                    {keywordSuggestions.map((suggestion, i) => (
                      <li key={`${suggestion.keyword}-${i}`} className="flex items-start justify-between gap-4 py-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">{suggestion.keyword}</p>
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                              {suggestion.searchIntent}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600">{suggestion.rationale}</p>
                        </div>
                        <CopyButton value={suggestion.keyword} />
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-slate-400">
                    Check each idea against live search results and keyword-volume data before prioritising it.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {history.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Past domain ideas
            </h2>
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {history.map((h) => (
                <li key={h._id}>
                  <button
                    type="button"
                    onClick={() => {
                      setResult(h);
                      setKeyword(h.keyword);
                      setDomain(h.domain);
                      setKeywordSuggestions([]);
                      setKeywordError('');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{h.domain}</p>
                      <p className="truncate text-xs text-slate-500">
                        {h.keyword} · {h.seamlessRankingVerdict}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {h.domainViabilityScore}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
