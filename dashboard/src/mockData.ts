export interface LinkedInData {
  followers: number;
  followerDelta: number;
  impressions: number;
  engagements: number;
  engagementRate: number;
  topPostTitle: string;
}

export interface InstagramData {
  followers: number;
  followerDelta: number;
  reach: number;
  impressions: number;
  avgEngagementRate: number;
  topPostCaption: string;
}

export interface WixData {
  uniqueVisitors: number;
  sessions: number;
  pageViews: number;
  topPage: string;
  blogPosts: { title: string; date: string; url: string }[];
}

export interface MonthlyReport {
  month: string;
  monthKey: string;
  linkedin: LinkedInData;
  instagram: InstagramData;
  wix: WixData;
}

export const mockData: MonthlyReport[] = [
  {
    month: "January 2026",
    monthKey: "2026-01",
    linkedin: {
      followers: 1247,
      followerDelta: 43,
      impressions: 18420,
      engagements: 892,
      engagementRate: 4.8,
      topPostTitle:
        "Excited to announce our new research paper on AI-driven consumer behavior analysis...",
    },
    instagram: {
      followers: 834,
      followerDelta: 28,
      reach: 12350,
      impressions: 15800,
      avgEngagementRate: 5.2,
      topPostCaption:
        "Behind the scenes at our latest experiment setup! #MarketingResearch #DEXLab",
    },
    wix: {
      uniqueVisitors: 2145,
      sessions: 3287,
      pageViews: 8920,
      topPage: "/research/publications",
      blogPosts: [
        {
          title: "How Digital Experiments Shape Modern Marketing",
          date: "Jan 12",
          url: "https://www.sbe-dexlab.com/post/digital-experiments",
        },
        {
          title: "5 Key Trends in Consumer Behavior for 2026",
          date: "Jan 25",
          url: "https://www.sbe-dexlab.com/post/consumer-trends-2026",
        },
      ],
    },
  },
  {
    month: "February 2026",
    monthKey: "2026-02",
    linkedin: {
      followers: 1312,
      followerDelta: 65,
      impressions: 24100,
      engagements: 1150,
      engagementRate: 4.8,
      topPostTitle:
        "Our team presented at the Winter Marketing Science Conference on experimental design...",
    },
    instagram: {
      followers: 891,
      followerDelta: 57,
      reach: 15200,
      impressions: 19500,
      avgEngagementRate: 6.1,
      topPostCaption:
        "Conference season is here! Presenting our latest findings on digital nudging. #AcademicLife",
    },
    wix: {
      uniqueVisitors: 2890,
      sessions: 4120,
      pageViews: 11300,
      topPage: "/team",
      blogPosts: [
        {
          title: "Recap: Winter Marketing Science Conference 2026",
          date: "Feb 08",
          url: "https://www.sbe-dexlab.com/post/wmsc-2026-recap",
        },
        {
          title: "New Paper Accepted at Journal of Marketing Research",
          date: "Feb 18",
          url: "https://www.sbe-dexlab.com/post/jmr-paper-accepted",
        },
        {
          title: "Understanding A/B Testing in Academic Research",
          date: "Feb 27",
          url: "https://www.sbe-dexlab.com/post/ab-testing-academia",
        },
      ],
    },
  },
  {
    month: "March 2026",
    monthKey: "2026-03",
    linkedin: {
      followers: 1389,
      followerDelta: 77,
      impressions: 28750,
      engagements: 1420,
      engagementRate: 4.9,
      topPostTitle:
        "We're hiring! Looking for a PhD candidate to join our team working on digital experimentation...",
    },
    instagram: {
      followers: 952,
      followerDelta: 61,
      reach: 17800,
      impressions: 22100,
      avgEngagementRate: 5.8,
      topPostCaption:
        "Meet our newest team member! Welcome aboard. #DEXLab #NewBeginnings #AcademicTwitter",
    },
    wix: {
      uniqueVisitors: 3450,
      sessions: 5100,
      pageViews: 14200,
      topPage: "/careers",
      blogPosts: [
        {
          title: "Open PhD Position: Digital Experimentation",
          date: "Mar 03",
          url: "https://www.sbe-dexlab.com/post/phd-position-2026",
        },
        {
          title: "The Role of AI in Marketing Experimentation",
          date: "Mar 15",
          url: "https://www.sbe-dexlab.com/post/ai-marketing-experimentation",
        },
      ],
    },
  },
];
