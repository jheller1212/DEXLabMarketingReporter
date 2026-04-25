// Types matching the real LinkedIn data from data/snapshots/*.json

export interface FollowerData {
  total: number;
  by_function: Record<string, number>;
  by_seniority: Record<string, number>;
  by_industry: Record<string, number>;
}

export interface EngagementData {
  impressions: number;
  unique_impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  engagement_rate: number;
}

export interface PageViewData {
  total: number;
  desktop: number;
  mobile: number;
  overview: number;
  about: number;
  careers: number;
  jobs: number;
  people: number;
}

export interface LinkedInSnapshot {
  followers: FollowerData;
  engagement: EngagementData;
  page_views: PageViewData;
}

export interface Snapshot {
  date: string;
  org_urn: string;
  linkedin: LinkedInSnapshot;
}

export interface SnapshotIndex {
  snapshots: string[];
}

// Human-readable label maps for LinkedIn URNs
export const FUNCTION_LABELS: Record<string, string> = {
  "urn:li:function:1": "Accounting",
  "urn:li:function:2": "Administrative",
  "urn:li:function:3": "Arts & Design",
  "urn:li:function:4": "Business Development",
  "urn:li:function:5": "Community & Social Services",
  "urn:li:function:6": "Consulting",
  "urn:li:function:7": "Education",
  "urn:li:function:8": "Engineering",
  "urn:li:function:9": "Entrepreneurship",
  "urn:li:function:10": "Finance",
  "urn:li:function:11": "Healthcare Services",
  "urn:li:function:12": "Human Resources",
  "urn:li:function:13": "Information Technology",
  "urn:li:function:14": "Legal",
  "urn:li:function:15": "Marketing",
  "urn:li:function:16": "Media & Communication",
  "urn:li:function:17": "Military & Protective Services",
  "urn:li:function:18": "Operations",
  "urn:li:function:19": "Product Management",
  "urn:li:function:20": "Program & Project Management",
  "urn:li:function:21": "Purchasing",
  "urn:li:function:22": "Quality Assurance",
  "urn:li:function:23": "Real Estate",
  "urn:li:function:24": "Research",
  "urn:li:function:25": "Sales",
  "urn:li:function:26": "Support",
};

export const SENIORITY_LABELS: Record<string, string> = {
  "urn:li:seniority:1": "Unpaid",
  "urn:li:seniority:2": "Training",
  "urn:li:seniority:3": "Entry",
  "urn:li:seniority:4": "Senior",
  "urn:li:seniority:5": "Manager",
  "urn:li:seniority:6": "Director",
  "urn:li:seniority:7": "VP",
  "urn:li:seniority:8": "CXO",
  "urn:li:seniority:9": "Partner",
  "urn:li:seniority:10": "Owner",
};

export const INDUSTRY_LABELS: Record<string, string> = {
  "urn:li:industry:4": "Computer Software",
  "urn:li:industry:6": "Computer Hardware",
  "urn:li:industry:7": "Computer Networking",
  "urn:li:industry:8": "Internet",
  "urn:li:industry:9": "Semiconductors",
  "urn:li:industry:10": "Telecommunications",
  "urn:li:industry:11": "Financial Services",
  "urn:li:industry:12": "Banking",
  "urn:li:industry:13": "Insurance",
  "urn:li:industry:14": "Real Estate",
  "urn:li:industry:15": "Investment Banking",
  "urn:li:industry:17": "Accounting",
  "urn:li:industry:19": "Venture Capital & Private Equity",
  "urn:li:industry:22": "Biotechnology",
  "urn:li:industry:23": "Medical Devices",
  "urn:li:industry:24": "Health, Wellness & Fitness",
  "urn:li:industry:25": "Hospital & Health Care",
  "urn:li:industry:27": "Information Technology & Services",
  "urn:li:industry:28": "Defense & Space",
  "urn:li:industry:30": "Aviation & Aerospace",
  "urn:li:industry:31": "Automotive",
  "urn:li:industry:33": "Chemicals",
  "urn:li:industry:34": "Industrial Automation",
  "urn:li:industry:36": "Mechanical / Industrial Engineering",
  "urn:li:industry:41": "Civil Engineering",
  "urn:li:industry:42": "Construction",
  "urn:li:industry:43": "Management Consulting",
  "urn:li:industry:44": "Architecture & Planning",
  "urn:li:industry:45": "Electrical / Electronic Manufacturing",
  "urn:li:industry:46": "Consumer Electronics",
  "urn:li:industry:47": "Oil & Energy",
  "urn:li:industry:48": "Mining & Metals",
  "urn:li:industry:49": "Utilities",
  "urn:li:industry:52": "Plastics",
  "urn:li:industry:53": "Food & Beverages",
  "urn:li:industry:54": "Consumer Goods",
  "urn:li:industry:55": "Cosmetics",
  "urn:li:industry:56": "Textiles",
  "urn:li:industry:57": "Apparel & Fashion",
  "urn:li:industry:67": "Luxury Goods & Jewelry",
  "urn:li:industry:68": "Higher Education",
  "urn:li:industry:69": "Education Management",
  "urn:li:industry:70": "Research",
  "urn:li:industry:71": "E-Learning",
  "urn:li:industry:75": "Government Administration",
  "urn:li:industry:78": "Nonprofit Organization Management",
  "urn:li:industry:79": "Philanthropy",
  "urn:li:industry:80": "International Affairs",
  "urn:li:industry:82": "Law Practice",
  "urn:li:industry:84": "Retail",
  "urn:li:industry:87": "Publishing",
  "urn:li:industry:90": "Entertainment",
  "urn:li:industry:92": "Broadcast Media",
  "urn:li:industry:94": "Renewables & Environment",
  "urn:li:industry:96": "Marketing & Advertising",
  "urn:li:industry:97": "Online Media",
  "urn:li:industry:98": "Design",
  "urn:li:industry:99": "Graphic Design",
  "urn:li:industry:100": "Human Resources",
  "urn:li:industry:102": "Staffing & Recruiting",
  "urn:li:industry:104": "Professional Training & Coaching",
  "urn:li:industry:105": "Public Relations & Communications",
  "urn:li:industry:106": "Market Research",
  "urn:li:industry:110": "Environmental Services",
  "urn:li:industry:112": "Events Services",
  "urn:li:industry:116": "Logistics & Supply Chain",
  "urn:li:industry:118": "Transportation / Trucking / Railroad",
  "urn:li:industry:124": "Import & Export",
  "urn:li:industry:126": "Pharmaceuticals",
  "urn:li:industry:132": "Media Production",
  "urn:li:industry:133": "Animation",
  "urn:li:industry:135": "Executive Office",
  "urn:li:industry:136": "Package / Freight Delivery",
  "urn:li:industry:137": "Warehousing",
  "urn:li:industry:139": "Sporting Goods",
  "urn:li:industry:141": "Leisure, Travel & Tourism",
  "urn:li:industry:143": "Hospitality",
  "urn:li:industry:147": "Facilities Services",
  "urn:li:industry:495": "Outsourcing / Offshoring",
  "urn:li:industry:622": "Think Tanks",
  "urn:li:industry:709": "Political Organization",
  "urn:li:industry:722": "Fine Art",
  "urn:li:industry:727": "Performing Arts",
  "urn:li:industry:983": "Writing & Editing",
  "urn:li:industry:1042": "Fund-Raising",
  "urn:li:industry:1257": "Libraries",
  "urn:li:industry:1285": "Museums & Institutions",
  "urn:li:industry:1339": "Photography",
  "urn:li:industry:1594": "Wine & Spirits",
  "urn:li:industry:1673": "Civic & Social Organization",
  "urn:li:industry:1862": "Nanotechnology",
  "urn:li:industry:1911": "Program Development",
  "urn:li:industry:1999": "Government Relations",
  "urn:li:industry:2375": "Religious Institutions",
  "urn:li:industry:3124": "Arts & Crafts",
  "urn:li:industry:3126": "Glass, Ceramics & Concrete",
  "urn:li:industry:3127": "Paper & Forest Products",
  "urn:li:industry:3129": "Ranching",
  "urn:li:industry:3132": "Gambling & Casinos",
  "urn:li:industry:3241": "Music",
};
