import mongoose from 'mongoose';

const CompetitorSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    link: { type: String, default: '' },
    snippet: { type: String, default: '' },
  },
  { _id: false }
);

const AnalysisSchema = new mongoose.Schema(
  {
    keyword: { type: String, required: true, trim: true, index: true },
    domain: { type: String, required: true, trim: true, lowercase: true, index: true },
    domainViabilityScore: { type: Number, required: true, min: 1, max: 100 },
    seamlessRankingVerdict: { type: String, required: true },
    domainMatchType: {
      type: String,
      required: true,
      enum: ['Exact Match', 'Partial Match', 'Branded'],
    },
    titleTag: { type: String, required: true },
    metaDescription: { type: String, required: true },
    recommendations: { type: [String], default: [] },
    competitors: { type: [CompetitorSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Analysis || mongoose.model('Analysis', AnalysisSchema);
