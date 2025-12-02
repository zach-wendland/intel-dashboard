// Left-Wing / Progressive News Sources Configuration

export interface SourceItem {
  id: number | string;
  name: string;
  category: string;
  tier?: string;
  focus?: string;
  url: string;
  topic_map?: string;
}

// Live RSS Feeds for Left-Wing Perspective
export const LEFT_LIVE_FEEDS: SourceItem[] = [
  {
    id: 'jacobin',
    name: 'Jacobin Magazine',
    url: 'https://jacobin.com/feed/',
    category: 'INTELLECTUALS',
    topic_map: 'Socialism'
  },
  {
    id: 'thenation',
    name: 'The Nation',
    url: 'https://www.thenation.com/feed/',
    category: 'INTELLECTUALS',
    topic_map: 'Progressive Politics'
  },
  {
    id: 'commondreams',
    name: 'Common Dreams',
    url: 'https://www.commondreams.org/feed',
    category: 'BROADCAST',
    topic_map: 'Social Justice'
  },
  {
    id: 'democracynow',
    name: 'Democracy Now!',
    url: 'https://www.democracynow.org/democracynow.rss',
    category: 'BROADCAST',
    topic_map: 'Independent News'
  },
  {
    id: 'inthesetimes',
    name: 'In These Times',
    url: 'https://inthesetimes.com/feed',
    category: 'LABOR',
    topic_map: 'Workers Rights'
  },
  {
    id: 'truthout',
    name: 'Truthout',
    url: 'https://truthout.org/feed/',
    category: 'BROADCAST',
    topic_map: 'Investigative'
  }
];

export const LEFT_SOURCE_CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  INTELLECTUALS: { label: "Progressive Think Tanks", icon: "BookOpen", color: "text-blue-400" },
  BROADCAST: { label: "Independent Media", icon: "Radio", color: "text-purple-400" },
  LABOR: { label: "Labor & Economic Justice", icon: "Users", color: "text-orange-400" },
  ENVIRONMENT: { label: "Environmental & Climate", icon: "Globe", color: "text-green-400" },
  SOCIAL_JUSTICE: { label: "Social Justice & Rights", icon: "Shield", color: "text-pink-400" },
  INFRASTRUCTURE: { label: "Digital Commons", icon: "Server", color: "text-gray-400" }
};

export const LEFT_SOURCES: SourceItem[] = [
  // 1. Progressive Think Tanks & Intellectuals
  { id: 1, name: "Jacobin Magazine", category: "INTELLECTUALS", tier: "High", focus: "Democratic Socialism", url: "https://jacobin.com" },
  { id: 2, name: "The Nation", category: "INTELLECTUALS", tier: "High", focus: "Progressive Politics", url: "https://www.thenation.com" },
  { id: 3, name: "Dissent Magazine", category: "INTELLECTUALS", tier: "Medium", focus: "Democratic Left", url: "https://www.dissentmagazine.org" },
  { id: 4, name: "Current Affairs", category: "INTELLECTUALS", tier: "Medium", focus: "Left Commentary", url: "https://www.currentaffairs.org" },
  { id: 5, name: "Boston Review", category: "INTELLECTUALS", tier: "High", focus: "Political Philosophy", url: "https://bostonreview.net" },
  { id: 6, name: "New Left Review", category: "INTELLECTUALS", tier: "High", focus: "Critical Theory", url: "https://newleftreview.org" },
  { id: 7, name: "Monthly Review", category: "INTELLECTUALS", tier: "Medium", focus: "Marxist Analysis", url: "https://monthlyreview.org" },
  { id: 8, name: "Catalyst Journal", category: "INTELLECTUALS", tier: "Medium", focus: "Socialist Theory", url: "https://catalyst-journal.com" },
  { id: 9, name: "Verso Books Blog", category: "INTELLECTUALS", tier: "Medium", focus: "Radical Publishing", url: "https://www.versobooks.com/blogs" },
  { id: 10, name: "n+1", category: "INTELLECTUALS", tier: "Medium", focus: "Literature & Politics", url: "https://www.nplusonemag.com" },

  // 2. Independent Media & Broadcast
  { id: 11, name: "Democracy Now!", category: "BROADCAST", tier: "High", focus: "Independent News", url: "https://www.democracynow.org" },
  { id: 12, name: "Common Dreams", category: "BROADCAST", tier: "High", focus: "Progressive News", url: "https://www.commondreams.org" },
  { id: 13, name: "Truthout", category: "BROADCAST", tier: "High", focus: "Investigative Journalism", url: "https://truthout.org" },
  { id: 14, name: "The Intercept", category: "BROADCAST", tier: "High", focus: "National Security", url: "https://theintercept.com" },
  { id: 15, name: "ProPublica", category: "BROADCAST", tier: "High", focus: "Investigative", url: "https://www.propublica.org" },
  { id: 16, name: "Mother Jones", category: "BROADCAST", tier: "High", focus: "Investigative/Advocacy", url: "https://www.motherjones.com" },
  { id: 17, name: "The Young Turks", category: "BROADCAST", tier: "High", focus: "Progressive Commentary", url: "https://tyt.com" },
  { id: 18, name: "Majority Report", category: "BROADCAST", tier: "Medium", focus: "Political Commentary", url: "https://www.youtube.com/@majorityre portradio" },
  { id: 19, name: "Breaking Points", category: "BROADCAST", tier: "High", focus: "Populist Analysis", url: "https://breakingpoints.com" },
  { id: 20, name: "David Pakman Show", category: "BROADCAST", tier: "Medium", focus: "Progressive Politics", url: "https://www.davidpakman.com" },

  // 3. Labor & Economic Justice
  { id: 21, name: "In These Times", category: "LABOR", tier: "High", focus: "Workers' Rights", url: "https://inthesetimes.com" },
  { id: 22, name: "Labor Notes", category: "LABOR", tier: "Medium", focus: "Union Organizing", url: "https://labornotes.org" },
  { id: 23, name: "Working Class Perspectives", category: "LABOR", tier: "Medium", focus: "Working Class Culture", url: "https://workingclassstudies.wordpress.com" },
  { id: 24, name: "Economic Policy Institute", category: "LABOR", tier: "High", focus: "Economic Research", url: "https://www.epi.org" },
  { id: 25, name: "The American Prospect", category: "LABOR", tier: "High", focus: "Economic Policy", url: "https://prospect.org" },
  { id: 26, name: "Roosevelt Institute", category: "LABOR", tier: "High", focus: "Economic Justice", url: "https://rooseveltinstitute.org" },
  { id: 27, name: "Institute for New Economic Thinking", category: "LABOR", tier: "Medium", focus: "Economic Theory", url: "https://www.ineteconomics.org" },

  // 4. Environmental & Climate Justice
  { id: 28, name: "Grist", category: "ENVIRONMENT", tier: "High", focus: "Climate News", url: "https://grist.org" },
  { id: 29, name: "Inside Climate News", category: "ENVIRONMENT", tier: "High", focus: "Climate Reporting", url: "https://insideclimatenews.org" },
  { id: 30, name: "DeSmog", category: "ENVIRONMENT", tier: "Medium", focus: "Climate Disinformation", url: "https://www.desmog.com" },
  { id: 31, name: "Sierra Club", category: "ENVIRONMENT", tier: "Medium", focus: "Environmental Advocacy", url: "https://www.sierraclub.org" },
  { id: 32, name: "350.org", category: "ENVIRONMENT", tier: "Medium", focus: "Climate Movement", url: "https://350.org" },
  { id: 33, name: "Sunrise Movement", category: "ENVIRONMENT", tier: "Medium", focus: "Youth Climate", url: "https://www.sunrisemovement.org" },
  { id: 34, name: "The Ecologist", category: "ENVIRONMENT", tier: "Medium", focus: "Environmental Politics", url: "https://theecologist.org" },

  // 5. Social Justice & Civil Rights
  { id: 35, name: "Colorlines", category: "SOCIAL_JUSTICE", tier: "Medium", focus: "Racial Justice", url: "https://www.colorlines.com" },
  { id: 36, name: "Rewire News Group", category: "SOCIAL_JUSTICE", tier: "Medium", focus: "Reproductive Rights", url: "https://rewirenewsgroup.com" },
  { id: 37, name: "The Appeal", category: "SOCIAL_JUSTICE", tier: "High", focus: "Criminal Justice", url: "https://theappeal.org" },
  { id: 38, name: "Prism Reports", category: "SOCIAL_JUSTICE", tier: "Medium", focus: "Justice Movements", url: "https://prismreports.org" },
  { id: 39, name: "Bitch Media", category: "SOCIAL_JUSTICE", tier: "Medium", focus: "Feminist Media", url: "https://www.bitchmedia.org" },
  { id: 40, name: "Scalawag Magazine", category: "SOCIAL_JUSTICE", tier: "Low", focus: "Southern Justice", url: "https://scalawagmagazine.org" },
  { id: 41, name: "Autostraddle", category: "SOCIAL_JUSTICE", tier: "Medium", focus: "LGBTQ+ Culture", url: "https://www.autostraddle.com" },
  { id: 42, name: "Wear Your Voice", category: "SOCIAL_JUSTICE", tier: "Low", focus: "Intersectional Feminism", url: "https://wearyourvoicemag.com" },

  // 6. Digital Commons & Infrastructure
  { id: 43, name: "Electronic Frontier Foundation", category: "INFRASTRUCTURE", tier: "High", focus: "Digital Rights", url: "https://www.eff.org" },
  { id: 44, name: "Fight for the Future", category: "INFRASTRUCTURE", tier: "Medium", focus: "Internet Freedom", url: "https://www.fightforthefuture.org" },
  { id: 45, name: "Free Press", category: "INFRASTRUCTURE", tier: "Medium", focus: "Media Justice", url: "https://www.freepress.net" },
  { id: 46, name: "Techdirt", category: "INFRASTRUCTURE", tier: "Medium", focus: "Tech Policy", url: "https://www.techdirt.com" },
  { id: 47, name: "Hacker News (YC)", category: "INFRASTRUCTURE", tier: "High", focus: "Tech Community", url: "https://news.ycombinator.com" },
  { id: 48, name: "Mastodon Network", category: "INFRASTRUCTURE", tier: "High", focus: "Decentralized Social", url: "https://joinmastodon.org" },
  { id: 49, name: "Reddit (r/politics)", category: "INFRASTRUCTURE", tier: "High", focus: "Community Discussion", url: "https://reddit.com/r/politics" },
  { id: 50, name: "Blue Sky Social", category: "INFRASTRUCTURE", tier: "Medium", focus: "Decentralized Platform", url: "https://blueskyweb.xyz" }
];

export const LEFT_CHART_DATA = [
  { name: '08:00', sentiment: 65, volume: 150 },
  { name: '10:00', sentiment: 70, volume: 220 },
  { name: '12:00', sentiment: 75, volume: 400 },
  { name: '14:00', sentiment: 80, volume: 380 },
  { name: '16:00', sentiment: 85, volume: 520 },
  { name: '18:00', sentiment: 78, volume: 310 },
];

export const LEFT_NARRATIVE_DATA = [
  { topic: "Climate Action", value: 92 },
  { topic: "Healthcare Reform", value: 85 },
  { topic: "Workers' Rights", value: 78 },
  { topic: "Social Justice", value: 88 },
  { topic: "Democracy Reform", value: 70 },
];
