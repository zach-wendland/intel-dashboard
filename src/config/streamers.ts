// America First Live Streamers Configuration

export type Platform = 'kick' | 'rumble' | 'youtube' | 'twitch' | 'cozy';

export interface Streamer {
  id: string;
  name: string;
  platform: Platform;
  username: string;
  channelUrl: string;
  description: string;
  category: 'GROYPER' | 'MAGA_MEDIA' | 'PODCASTERS' | 'MANOSPHERE' | 'COMMENTARY' | 'GAMING';
  followers?: string;
  schedule?: string;
  featured?: boolean;
}

// Kick Streamers
export const KICK_STREAMERS: Streamer[] = [
  {
    id: 'kick-fuentes',
    name: 'Nick Fuentes',
    platform: 'kick',
    username: 'nickfuentes',
    channelUrl: 'https://kick.com/nickfuentes',
    description: 'America First Show - Groyper movement leader',
    category: 'GROYPER',
    followers: '25.9K',
    schedule: 'M-F 8pm CST',
    featured: true
  },
  {
    id: 'kick-sneako',
    name: 'SNEAKO',
    platform: 'kick',
    username: 'sneako',
    channelUrl: 'https://kick.com/sneako',
    description: 'Red pill, dating advice, political commentary',
    category: 'MANOSPHERE',
    followers: '54.1K',
    featured: true
  },
  {
    id: 'kick-adin',
    name: 'Adin Ross',
    platform: 'kick',
    username: 'adinross',
    channelUrl: 'https://kick.com/adinross',
    description: 'Gaming, political interviews - hosted Trump',
    category: 'GAMING',
    followers: '1.8M',
    featured: true
  },
  {
    id: 'kick-beardson',
    name: 'Beardson Beardly',
    platform: 'kick',
    username: 'beardsonbeardly',
    channelUrl: 'https://kick.com/beardsonbeardly',
    description: 'The Weekly Sweat - Catholic veteran comedy',
    category: 'GROYPER',
    followers: '2.4K'
  },
  {
    id: 'kick-baked',
    name: 'Baked Alaska',
    platform: 'kick',
    username: 'bakedalaska',
    channelUrl: 'https://kick.com/bakedalaska',
    description: 'IRL streams - pardoned Jan 2025',
    category: 'GROYPER',
    followers: '9.4K'
  },
  {
    id: 'kick-zherka',
    name: 'Jon Zherka',
    platform: 'kick',
    username: 'zherka',
    channelUrl: 'https://kick.com/zherka',
    description: 'Debate content, manosphere',
    category: 'MANOSPHERE'
  }
];

// Rumble Streamers
export const RUMBLE_STREAMERS: Streamer[] = [
  {
    id: 'rumble-infowars',
    name: 'InfoWars Live',
    platform: 'rumble',
    username: 'InfowarsLive',
    channelUrl: 'https://rumble.com/c/InfowarsLive',
    description: 'Alex Jones 11am-3pm, War Room 3pm-6pm CST',
    category: 'MAGA_MEDIA',
    schedule: '24/7 streaming',
    featured: true
  },
  {
    id: 'rumble-crowder',
    name: 'Steven Crowder',
    platform: 'rumble',
    username: 'StevenCrowder',
    channelUrl: 'https://rumble.com/c/StevenCrowder',
    description: 'Louder with Crowder - Rumble exclusive',
    category: 'COMMENTARY',
    schedule: 'M-F 11am ET',
    featured: true
  },
  {
    id: 'rumble-timpool',
    name: 'Tim Pool / Timcast',
    platform: 'rumble',
    username: 'Timcast',
    channelUrl: 'https://rumble.com/c/Timcast',
    description: 'Timcast IRL - Rumble exclusive Feb 2025',
    category: 'PODCASTERS',
    featured: true
  },
  {
    id: 'rumble-tucker',
    name: 'Tucker Carlson',
    platform: 'rumble',
    username: 'TuckerCarlson',
    channelUrl: 'https://rumble.com/c/TuckerCarlson',
    description: 'TCN interviews, monologues, documentaries',
    category: 'COMMENTARY',
    featured: true
  },
  {
    id: 'rumble-bannon',
    name: 'Steve Bannon - War Room',
    platform: 'rumble',
    username: 'BannonsWarRoom',
    channelUrl: 'https://rumble.com/c/BannonsWarRoom',
    description: 'War Room - MAGA strategy',
    category: 'MAGA_MEDIA',
    schedule: '6 days/week 10am & 5pm EST',
    featured: true
  },
  {
    id: 'rumble-stew',
    name: 'Stew Peters',
    platform: 'rumble',
    username: 'StewPeters',
    channelUrl: 'https://rumble.com/c/StewPeters',
    description: 'Hard-hitting political commentary',
    category: 'COMMENTARY',
    followers: '576K'
  },
  {
    id: 'rumble-candace',
    name: 'Candace Owens',
    platform: 'rumble',
    username: 'RealCandaceO',
    channelUrl: 'https://rumble.com/c/RealCandaceO',
    description: 'Independent after leaving Daily Wire',
    category: 'COMMENTARY',
    featured: true
  },
  {
    id: 'rumble-posobiec',
    name: 'Jack Posobiec',
    platform: 'rumble',
    username: 'JackPosobiec',
    channelUrl: 'https://rumble.com/c/JackPosobiec',
    description: 'Human Events Daily',
    category: 'MAGA_MEDIA',
    schedule: 'M-F 2pm EST'
  },
  {
    id: 'rumble-sneako',
    name: 'SNEAKO',
    platform: 'rumble',
    username: 'SNEAKO',
    channelUrl: 'https://rumble.com/c/SNEAKO',
    description: 'Full streams and clips',
    category: 'MANOSPHERE',
    followers: '420K+'
  },
  {
    id: 'rumble-tate',
    name: 'Andrew Tate',
    platform: 'rumble',
    username: 'TateSpeech',
    channelUrl: 'https://rumble.com/c/TateSpeech',
    description: 'Tate Speech - Official channel',
    category: 'MANOSPHERE',
    featured: true
  },
  {
    id: 'rumble-freshfit',
    name: 'Fresh & Fit',
    platform: 'rumble',
    username: 'freshandfit',
    channelUrl: 'https://rumble.com/c/freshandfit',
    description: 'Red pill podcast',
    category: 'MANOSPHERE',
    followers: '401K',
    schedule: 'M/W/F'
  },
  {
    id: 'rumble-pjw',
    name: 'Paul Joseph Watson',
    platform: 'rumble',
    username: 'PJW',
    channelUrl: 'https://rumble.com/c/PJW',
    description: 'Cultural and political commentary',
    category: 'COMMENTARY'
  },
  {
    id: 'rumble-shroyer',
    name: 'Owen Shroyer',
    platform: 'rumble',
    username: 'OwenShroyer',
    channelUrl: 'https://rumble.com/c/OwenShroyer',
    description: 'The Owen Report - Left InfoWars Sept 2025',
    category: 'COMMENTARY'
  },
  {
    id: 'rumble-schaffer',
    name: 'Elijah Schaffer',
    platform: 'rumble',
    username: 'SlightlyOffensive',
    channelUrl: 'https://rumble.com/c/SlightlyOffensive',
    description: 'Slightly Offensive',
    category: 'COMMENTARY'
  },
  {
    id: 'rumble-laurenc',
    name: 'Lauren Chen',
    platform: 'rumble',
    username: 'LaurenChen',
    channelUrl: 'https://rumble.com/c/LaurenChen',
    description: 'Banned from YouTube - former BlazeTV',
    category: 'COMMENTARY'
  },
  {
    id: 'rumble-laurens',
    name: 'Lauren Southern',
    platform: 'rumble',
    username: 'LaurenSouthern10',
    channelUrl: 'https://rumble.com/c/LaurenSouthern10',
    description: 'Canadian conservative documentarian',
    category: 'COMMENTARY'
  },
  {
    id: 'rumble-fuentes',
    name: 'Nick Fuentes',
    platform: 'rumble',
    username: 'nickjfuentes',
    channelUrl: 'https://rumble.com/c/nickjfuentes',
    description: 'America First Show - Groyper movement leader',
    category: 'GROYPER',
    schedule: 'M-F 8pm CST',
    featured: true
  },
  {
    id: 'rumble-beardson',
    name: 'Beardson Beardly',
    platform: 'rumble',
    username: 'Beardson',
    channelUrl: 'https://rumble.com/c/Beardson',
    description: 'The Weekly Sweat - Catholic veteran comedy',
    category: 'GROYPER',
    followers: '1.1K'
  },
  {
    id: 'rumble-baked',
    name: 'Baked Alaska',
    platform: 'rumble',
    username: 'bakedalaska',
    channelUrl: 'https://rumble.com/bakedalaska',
    description: 'IRL streams - pardoned Jan 2025',
    category: 'GROYPER'
  },
  {
    id: 'rumble-zherka',
    name: 'Jon Zherka',
    platform: 'rumble',
    username: 'JonZherk',
    channelUrl: 'https://rumble.com/c/JonZherk',
    description: 'Debate content, manosphere commentary',
    category: 'MANOSPHERE'
  },
  {
    id: 'rumble-adin',
    name: 'Adin Ross',
    platform: 'rumble',
    username: 'OfficialAdinRossLive',
    channelUrl: 'https://rumble.com/c/OfficialAdinRossLive',
    description: 'Gaming, political interviews - $100M Rumble deal 2025',
    category: 'GAMING',
    featured: true
  }
];

// YouTube Streamers
export const YOUTUBE_STREAMERS: Streamer[] = [
  {
    id: 'yt-asmongold',
    name: 'Asmongold',
    platform: 'youtube',
    username: 'Asmongold',
    channelUrl: 'https://youtube.com/@Asmongold',
    description: 'Gaming turned political - 5.8M combined subs',
    category: 'GAMING',
    followers: '5.8M',
    featured: true
  },
  {
    id: 'yt-pbd',
    name: 'PBD Podcast',
    platform: 'youtube',
    username: 'PBDPodcast',
    channelUrl: 'https://youtube.com/@PBDPodcast',
    description: 'Patrick Bet-David - Business & Politics',
    category: 'PODCASTERS',
    schedule: 'M/W/F 9am EST',
    featured: true
  },
  {
    id: 'yt-candace',
    name: 'Candace Owens',
    platform: 'youtube',
    username: 'CandaceOwens',
    channelUrl: 'https://youtube.com/@CandaceOwens',
    description: 'Daily episodes - 5M+ subscribers',
    category: 'COMMENTARY',
    followers: '5M+'
  },
  {
    id: 'yt-sneako',
    name: 'SNEAKO',
    platform: 'youtube',
    username: 'SNEAKO',
    channelUrl: 'https://youtube.com/@SNEAKO',
    description: 'Reinstated Oct 2025, re-monetized Nov 2025',
    category: 'MANOSPHERE'
  }
];

// Twitch Streamers
export const TWITCH_STREAMERS: Streamer[] = [
  {
    id: 'twitch-asmon',
    name: 'Asmongold',
    platform: 'twitch',
    username: 'zackrawrr',
    channelUrl: 'https://twitch.tv/zackrawrr',
    description: 'Most watched political streamer on Twitch 2025',
    category: 'GAMING',
    followers: '2.2M',
    featured: true
  },
  {
    id: 'twitch-adin',
    name: 'Adin Ross',
    platform: 'twitch',
    username: 'adinross',
    channelUrl: 'https://twitch.tv/adinross',
    description: 'Ban lifted March 2025 - returned to platform',
    category: 'GAMING'
  }
];

// All streamers combined
export const ALL_STREAMERS: Streamer[] = [
  ...KICK_STREAMERS,
  ...RUMBLE_STREAMERS,
  ...YOUTUBE_STREAMERS,
  ...TWITCH_STREAMERS
];

// Featured streamers for prominent display
export const FEATURED_STREAMERS = ALL_STREAMERS.filter(s => s.featured);

// Category configuration
export const STREAMER_CATEGORIES: Record<Streamer['category'], { label: string; color: string }> = {
  GROYPER: { label: 'America First', color: 'text-red-400' },
  MAGA_MEDIA: { label: 'MAGA Media', color: 'text-yellow-400' },
  PODCASTERS: { label: 'Podcasters', color: 'text-purple-400' },
  MANOSPHERE: { label: 'Manosphere', color: 'text-orange-400' },
  COMMENTARY: { label: 'Commentary', color: 'text-blue-400' },
  GAMING: { label: 'Gaming/Political', color: 'text-green-400' }
};

// Platform configuration
export const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; bgColor: string; getEmbedUrl: (username: string) => string }> = {
  kick: {
    label: 'Kick',
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
    getEmbedUrl: (username) => `https://player.kick.com/${username}`
  },
  rumble: {
    label: 'Rumble',
    color: 'text-green-500',
    bgColor: 'bg-green-900/20',
    getEmbedUrl: (username) => `https://rumble.com/embed/live/${username}`
  },
  youtube: {
    label: 'YouTube',
    color: 'text-red-500',
    bgColor: 'bg-red-900/20',
    getEmbedUrl: (username) => `https://www.youtube.com/embed/live_stream?channel=${username}`
  },
  twitch: {
    label: 'Twitch',
    color: 'text-purple-500',
    bgColor: 'bg-purple-900/20',
    getEmbedUrl: (username) => `https://player.twitch.tv/?channel=${username}&parent=localhost`
  },
  cozy: {
    label: 'Cozy.tv',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    getEmbedUrl: (username) => `https://cozy.tv/embed/${username}`
  }
};

// Helper function to get streamers by platform
export function getStreamersByPlatform(platform: Platform): Streamer[] {
  return ALL_STREAMERS.filter(s => s.platform === platform);
}

// Helper function to get streamers by category
export function getStreamersByCategory(category: Streamer['category']): Streamer[] {
  return ALL_STREAMERS.filter(s => s.category === category);
}
