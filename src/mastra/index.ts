import { Mastra } from '@mastra/core/mastra';
import { keywordAgent } from './agents/keywordAgent';
import { seoAgent } from './agents/seoAgent';

export const mastra = new Mastra({
  agents: { seoAgent, keywordAgent },
});
