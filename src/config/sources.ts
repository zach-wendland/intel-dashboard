import type { SourceItem } from '../types';

// All sources for the Intel Grid view
export const SOURCES: SourceItem[] = [
  // Paleoconservative Vanguard
  { id: 1, name: "The American Conservative", category: "INTELLECTUALS", tier: "High", focus: "Realism/Policy", url: "https://www.theamericanconservative.com" },
  { id: 2, name: "Chronicles Magazine", category: "INTELLECTUALS", tier: "High", focus: "Culture/Old Right", url: "https://chroniclesmagazine.org" },
  { id: 3, name: "The Unz Review", category: "INTELLECTUALS", tier: "Medium", focus: "Revisionism/Aggregation", url: "https://www.unz.com" },
  { id: 4, name: "VDARE", category: "INTELLECTUALS", tier: "Medium", focus: "Immigration/Demographics", url: "https://vdare.com" },
  { id: 5, name: "Taki's Magazine", category: "INTELLECTUALS", tier: "Medium", focus: "Cultural Critique", url: "https://www.takimag.com" },
  { id: 6, name: "The Occidental Observer", category: "INTELLECTUALS", tier: "Low", focus: "Group Strategy", url: "https://www.theoccidentalobserver.net" },
  { id: 7, name: "Counter-Currents", category: "INTELLECTUALS", tier: "Low", focus: "Ethnonationalism", url: "https://counter-currents.com" },
  { id: 8, name: "American Renaissance", category: "INTELLECTUALS", tier: "Medium", focus: "Race Realism", url: "https://www.amren.com" },
  { id: 9, name: "Modern Age (ISI)", category: "INTELLECTUALS", tier: "High", focus: "Academic Tradition", url: "https://home.isi.org/modern-age" },
  { id: 10, name: "Fleming Foundation", category: "INTELLECTUALS", tier: "Low", focus: "Regionalism", url: "https://fleming.foundation" },
  { id: 11, name: "Revolver News", category: "INTELLECTUALS", tier: "High", focus: "National Security/Deep State", url: "https://www.revolver.news" },
  { id: 12, name: "Big League Politics", category: "INTELLECTUALS", tier: "Medium", focus: "Muckraking", url: "https://bigleaguepolitics.com" },
  { id: 13, name: "American Greatness", category: "INTELLECTUALS", tier: "High", focus: "Nationalism", url: "https://amgreatness.com" },
  { id: 14, name: "National Justice Party", category: "INTELLECTUALS", tier: "Low", focus: "Hardline Politics", url: "https://nationaljusticeparty.com" },
  { id: 15, name: "The Right Stuff (TRS)", category: "INTELLECTUALS", tier: "Low", focus: "Cultural Satire", url: "https://therightstuff.biz" },
  { id: 16, name: "Red Ice TV", category: "INTELLECTUALS", tier: "Low", focus: "Demographics", url: "https://redice.tv" },

  // MAGA Broadcast Network
  { id: 17, name: "Tucker Carlson Network", category: "BROADCAST", tier: "High", focus: "Mass Media/Narrative", url: "https://tuckercarlson.com" },
  { id: 18, name: "War Room (Bannon)", category: "BROADCAST", tier: "High", focus: "Grassroots Action", url: "https://warroom.org" },
  { id: 19, name: "Candace Owens", category: "BROADCAST", tier: "High", focus: "Cultural/Religious", url: "https://candaceowens.com" },
  { id: 20, name: "Jack Posobiec", category: "BROADCAST", tier: "High", focus: "Info Warfare", url: "https://humanevents.com/author/jack-posobiec" },
  { id: 21, name: "Stew Peters", category: "BROADCAST", tier: "Medium", focus: "Conspiracy/Shock", url: "https://stewpeters.com" },
  { id: 22, name: "Infowars", category: "BROADCAST", tier: "High", focus: "Globalism/Conspiracy", url: "https://www.infowars.com" },
  { id: 23, name: "ZeroHedge", category: "BROADCAST", tier: "High", focus: "Finance/Geopolitics", url: "https://www.zerohedge.com" },
  { id: 24, name: "Valuetainment", category: "BROADCAST", tier: "High", focus: "Debate/Business", url: "https://www.valuetainment.com" },
  { id: 25, name: "Judge Napolitano", category: "BROADCAST", tier: "Medium", focus: "Legal/Anti-War", url: "https://www.judgenap.com" },

  // Dissident Right / Groypers
  { id: 26, name: "Nick Fuentes / AF", category: "RADICALS", tier: "Medium", focus: "Youth/Entryism", url: "https://americafirst.live" },
  { id: 27, name: "Keith Woods", category: "RADICALS", tier: "Medium", focus: "Theory/History", url: "https://keithwoods.pub" },
  { id: 28, name: "Jake Shields", category: "RADICALS", tier: "Medium", focus: "Confrontation", url: "https://x.com/jakeshieldsajj" },
  { id: 29, name: "Sneako", category: "RADICALS", tier: "High", focus: "Gen Z/Red Pill", url: "https://rumble.com/c/SNEAKO" },
  { id: 30, name: "Lucas Gage", category: "RADICALS", tier: "Medium", focus: "Shock Commentary", url: "https://x.com/Lucas_Gage_" },
  { id: 31, name: "Jackson Hinkle", category: "RADICALS", tier: "High", focus: "MAGA Communism", url: "https://x.com/jacksonhinkle" },
  { id: 32, name: "Dan Bilzerian", category: "RADICALS", tier: "High", focus: "Normie Outreach", url: "https://x.com/DanBilzerian" },
  { id: 33, name: "Auron MacIntyre", category: "RADICALS", tier: "Medium", focus: "Political Theory", url: "https://auronmacintyre.substack.com" },
  { id: 34, name: "Cozy.tv Collective", category: "RADICALS", tier: "Medium", focus: "Streaming", url: "https://cozy.tv" },
  { id: 35, name: "Bronze Age Pervert", category: "RADICALS", tier: "Medium", focus: "Vitalism/Aesthetics", url: "https://twitter.com/bronzeageperv" },

  // Libertarian / Anti-War
  { id: 36, name: "Scott Horton", category: "LIBERTARIANS", tier: "Medium", focus: "History/Foreign Policy", url: "https://scotthorton.org" },
  { id: 37, name: "Antiwar.com", category: "LIBERTARIANS", tier: "Medium", focus: "News Aggregation", url: "https://www.antiwar.com" },
  { id: 38, name: "Glenn Greenwald", category: "LIBERTARIANS", tier: "High", focus: "Civil Liberties", url: "https://greenwald.substack.com" },
  { id: 39, name: "Michael Tracey", category: "LIBERTARIANS", tier: "Medium", focus: "Journalism", url: "https://mtracey.substack.com" },
  { id: 40, name: "Dave Smith", category: "LIBERTARIANS", tier: "Medium", focus: "Libertarian Party", url: "https://partoftheproblem.com" },
  { id: 41, name: "Ron Paul Institute", category: "LIBERTARIANS", tier: "Medium", focus: "Non-Intervention", url: "http://ronpaulinstitute.org" },
  { id: 42, name: "LewRockwell.com", category: "LIBERTARIANS", tier: "Medium", focus: "Paleolibertarianism", url: "https://www.lewrockwell.com" },
  { id: 43, name: "The Grayzone", category: "LIBERTARIANS", tier: "Medium", focus: "Anti-Imperialism", url: "https://thegrayzone.com" },

  // Theological Dissent
  { id: 44, name: "Canon Press", category: "THEOLOGIANS", tier: "Medium", focus: "Reformed Theology", url: "https://canonpress.com" },
  { id: 45, name: "CrossPolitic", category: "THEOLOGIANS", tier: "Medium", focus: "Christian Nationalism", url: "https://crosspolitic.com" },
  { id: 46, name: "Gab / Andrew Torba", category: "THEOLOGIANS", tier: "High", focus: "Parallel Economy", url: "https://gab.com" },
  { id: 47, name: "TruNews", category: "THEOLOGIANS", tier: "Low", focus: "Fundamentalism", url: "https://www.trunews.com" },
  { id: 48, name: "Church Militant", category: "THEOLOGIANS", tier: "Medium", focus: "Catholic Integralism", url: "https://www.churchmilitant.com" },

  // Digital Infrastructure
  { id: 49, name: "X (Twitter)", category: "INFRASTRUCTURE", tier: "High", focus: "Public Square", url: "https://x.com" },
  { id: 50, name: "Rumble", category: "INFRASTRUCTURE", tier: "High", focus: "Video Hosting", url: "https://rumble.com" },
  { id: 51, name: "Substack", category: "INFRASTRUCTURE", tier: "High", focus: "Publishing", url: "https://substack.com" },
  { id: 52, name: "Odysee", category: "INFRASTRUCTURE", tier: "Medium", focus: "Decentralized Video", url: "https://odysee.com" },
  { id: 53, name: "Telegram", category: "INFRASTRUCTURE", tier: "High", focus: "Messaging/Coordination", url: "https://telegram.org" },
  { id: 54, name: "Truth Social", category: "INFRASTRUCTURE", tier: "High", focus: "MAGA Base", url: "https://truthsocial.com" },
  { id: 55, name: "Breitbart Community", category: "INFRASTRUCTURE", tier: "High", focus: "Comment Section", url: "https://www.breitbart.com" },
];
