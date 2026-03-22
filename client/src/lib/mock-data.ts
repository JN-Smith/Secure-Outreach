// ─── Types ────────────────────────────────────────────────────────────────────

export type ContactStatus =
  | "New"
  | "Needs Follow-up"
  | "Actively Discipling"
  | "Connected to Church"
  | "Not Interested";

export type SavedStatus = "Yes" | "No" | "Unsure";
export type FollowUpMethod = "Call" | "WhatsApp" | "Visit" | "Church Invitation";
export type TeamRole = "lead" | "member";
export type UserRole = "admin" | "pastor" | "evangelist" | "data_collector";

export interface Contact {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  gender?: "Male" | "Female";
  ageRange?: "Under 18" | "18-25" | "26-35" | "36-50" | "50+";
  church?: string;
  bornAgain: SavedStatus;
  discipleshipStatus: "Done" | "In Progress" | "Not Started";
  baptized: SavedStatus;
  location: string;
  isStudent: boolean;
  institution?: string;
  course?: string;
  yearOfStudy?: string;
  followUpMethod: FollowUpMethod;
  bestTime?: string;
  prayerRequests?: string;
  notes?: string;
  status: ContactStatus;
  createdAt: string;
  tags: string[];
  evangelistId: string;
  teamId: string;
}

export interface Evangelist {
  id: string;
  name: string;
  email: string;
  phone: string;
  teamId: string;
  teamRole: TeamRole;
  location: string;
  joinedAt: string;
  totalContacts: number;
  thisWeekContacts: number;
  thisMonthContacts: number;
  savedCount: number;
  followUpPending: number;
  connectedToChurch: number;
  weeklyTrend: number[]; // 7 values Mon-Sun
}

export interface Team {
  id: string;
  name: string;
  zone: string;
  leadEvangelistId: string;
  memberIds: string[];
  totalContacts: number;
  thisMonthContacts: number;
  savedCount: number;
  outreachDays: string[]; // weekdays
  activeZones: string[];
  createdAt: string;
}

export interface OutreachSession {
  id: string;
  date: string;
  teamId: string;
  location: string;
  evangelistsPresent: number;
  contactsMade: number;
  savedCount: number;
  prayerCount: number;
  notes?: string;
}

export interface WeeklyTrend {
  week: string;  // "Mar 1"
  contacts: number;
  saved: number;
  students: number;
}

// ─── Evangelists ──────────────────────────────────────────────────────────────

export const MOCK_EVANGELISTS: Evangelist[] = [
  {
    id: "e1",
    name: "Grace Achieng",
    email: "grace.achieng@manifestkenya.org",
    phone: "+254 712 345 001",
    teamId: "t1",
    teamRole: "lead",
    location: "Westlands, Nairobi",
    joinedAt: "2024-01-10",
    totalContacts: 87,
    thisWeekContacts: 12,
    thisMonthContacts: 34,
    savedCount: 31,
    followUpPending: 8,
    connectedToChurch: 19,
    weeklyTrend: [2, 3, 5, 4, 6, 8, 4],
  },
  {
    id: "e2",
    name: "Daniel Njoroge",
    email: "daniel.njoroge@manifestkenya.org",
    phone: "+254 712 345 002",
    teamId: "t1",
    teamRole: "member",
    location: "Westlands, Nairobi",
    joinedAt: "2024-02-05",
    totalContacts: 64,
    thisWeekContacts: 9,
    thisMonthContacts: 27,
    savedCount: 22,
    followUpPending: 5,
    connectedToChurch: 13,
    weeklyTrend: [1, 2, 4, 3, 5, 7, 3],
  },
  {
    id: "e3",
    name: "Samuel Mwangi",
    email: "samuel.mwangi@manifestkenya.org",
    phone: "+254 712 345 003",
    teamId: "t2",
    teamRole: "lead",
    location: "CBD, Nairobi",
    joinedAt: "2023-11-20",
    totalContacts: 112,
    thisWeekContacts: 15,
    thisMonthContacts: 41,
    savedCount: 47,
    followUpPending: 11,
    connectedToChurch: 28,
    weeklyTrend: [3, 4, 6, 5, 7, 9, 5],
  },
  {
    id: "e4",
    name: "Esther Wanjiru",
    email: "esther.wanjiru@manifestkenya.org",
    phone: "+254 712 345 004",
    teamId: "t2",
    teamRole: "member",
    location: "CBD, Nairobi",
    joinedAt: "2024-03-01",
    totalContacts: 58,
    thisWeekContacts: 7,
    thisMonthContacts: 22,
    savedCount: 18,
    followUpPending: 6,
    connectedToChurch: 10,
    weeklyTrend: [1, 2, 3, 2, 4, 6, 2],
  },
  {
    id: "e5",
    name: "Joshua Odhiambo",
    email: "joshua.odhiambo@manifestkenya.org",
    phone: "+254 712 345 005",
    teamId: "t3",
    teamRole: "lead",
    location: "Kibera, Nairobi",
    joinedAt: "2024-01-25",
    totalContacts: 74,
    thisWeekContacts: 10,
    thisMonthContacts: 29,
    savedCount: 26,
    followUpPending: 9,
    connectedToChurch: 15,
    weeklyTrend: [2, 3, 4, 4, 5, 7, 3],
  },
  {
    id: "e6",
    name: "Faith Kariuki",
    email: "faith.kariuki@manifestkenya.org",
    phone: "+254 712 345 006",
    teamId: "t3",
    teamRole: "member",
    location: "Kibera, Nairobi",
    joinedAt: "2024-04-10",
    totalContacts: 49,
    thisWeekContacts: 6,
    thisMonthContacts: 18,
    savedCount: 14,
    followUpPending: 4,
    connectedToChurch: 8,
    weeklyTrend: [1, 2, 2, 3, 3, 5, 2],
  },
  {
    id: "e7",
    name: "Michael Otieno",
    email: "michael.otieno@manifestkenya.org",
    phone: "+254 712 345 007",
    teamId: "t4",
    teamRole: "lead",
    location: "Nairobi East",
    joinedAt: "2023-12-15",
    totalContacts: 98,
    thisWeekContacts: 13,
    thisMonthContacts: 36,
    savedCount: 38,
    followUpPending: 10,
    connectedToChurch: 22,
    weeklyTrend: [2, 3, 5, 4, 6, 8, 4],
  },
  {
    id: "e8",
    name: "Ruth Kamau",
    email: "ruth.kamau@manifestkenya.org",
    phone: "+254 712 345 008",
    teamId: "t4",
    teamRole: "member",
    location: "Nairobi East",
    joinedAt: "2024-02-20",
    totalContacts: 61,
    thisWeekContacts: 8,
    thisMonthContacts: 24,
    savedCount: 20,
    followUpPending: 7,
    connectedToChurch: 11,
    weeklyTrend: [1, 2, 3, 3, 4, 6, 3],
  },
];

// Current logged-in evangelist (mock)
export const CURRENT_EVANGELIST = MOCK_EVANGELISTS[0]; // Grace Achieng

// ─── Teams ────────────────────────────────────────────────────────────────────

export const MOCK_TEAMS: Team[] = [
  {
    id: "t1",
    name: "Team Alpha",
    zone: "Westlands Zone",
    leadEvangelistId: "e1",
    memberIds: ["e1", "e2"],
    totalContacts: 151,
    thisMonthContacts: 61,
    savedCount: 53,
    outreachDays: ["Saturday", "Sunday"],
    activeZones: ["Westlands", "Parklands", "Lavington"],
    createdAt: "2024-01-01",
  },
  {
    id: "t2",
    name: "Team Beta",
    zone: "CBD Zone",
    leadEvangelistId: "e3",
    memberIds: ["e3", "e4"],
    totalContacts: 170,
    thisMonthContacts: 63,
    savedCount: 65,
    outreachDays: ["Friday", "Saturday"],
    activeZones: ["CBD", "River Road", "Moi Avenue"],
    createdAt: "2023-11-01",
  },
  {
    id: "t3",
    name: "Team Gamma",
    zone: "Kibera Zone",
    leadEvangelistId: "e5",
    memberIds: ["e5", "e6"],
    totalContacts: 123,
    thisMonthContacts: 47,
    savedCount: 40,
    outreachDays: ["Saturday"],
    activeZones: ["Kibera", "Langata", "Olympic"],
    createdAt: "2024-01-15",
  },
  {
    id: "t4",
    name: "Team Delta",
    zone: "Nairobi East Zone",
    leadEvangelistId: "e7",
    memberIds: ["e7", "e8"],
    totalContacts: 159,
    thisMonthContacts: 60,
    savedCount: 58,
    outreachDays: ["Sunday", "Monday"],
    activeZones: ["Eastleigh", "Buruburu", "Umoja"],
    createdAt: "2023-12-01",
  },
];

// ─── Contacts ─────────────────────────────────────────────────────────────────

export const MOCK_CONTACTS: Contact[] = [
  {
    id: "c1", fullName: "Amina Hassan", phone: "+254 701 111 001",
    gender: "Female", ageRange: "18-25", bornAgain: "Yes",
    discipleshipStatus: "In Progress", baptized: "No",
    location: "Westlands", isStudent: true, institution: "Strathmore University",
    course: "Business", yearOfStudy: "2nd",
    followUpMethod: "WhatsApp", bestTime: "Evenings",
    status: "Actively Discipling", createdAt: "2026-03-20",
    tags: ["Student", "New Believer"], evangelistId: "e1", teamId: "t1",
    notes: "Very open to the gospel. Attends our Friday small group.",
  },
  {
    id: "c2", fullName: "Brian Omondi", phone: "+254 701 111 002",
    gender: "Male", ageRange: "26-35", bornAgain: "Unsure",
    discipleshipStatus: "Not Started", baptized: "No",
    location: "Parklands", isStudent: false,
    followUpMethod: "Call", bestTime: "Mornings",
    status: "Needs Follow-up", createdAt: "2026-03-18",
    tags: ["Seeker"], evangelistId: "e2", teamId: "t1",
    prayerRequests: "Seeking direction in career.",
  },
  {
    id: "c3", fullName: "Christine Wafula", phone: "+254 701 111 003",
    gender: "Female", ageRange: "18-25", bornAgain: "Yes",
    discipleshipStatus: "Done", baptized: "Yes",
    location: "Lavington", isStudent: true, institution: "University of Nairobi",
    course: "Medicine", yearOfStudy: "Final",
    followUpMethod: "Church Invitation", status: "Connected to Church",
    createdAt: "2026-02-10", tags: ["Student", "Leader Potential"],
    evangelistId: "e1", teamId: "t1",
  },
  {
    id: "c4", fullName: "David Kiprotich", phone: "+254 701 111 004",
    gender: "Male", ageRange: "36-50", bornAgain: "No",
    discipleshipStatus: "Not Started", baptized: "No",
    location: "CBD", isStudent: false,
    followUpMethod: "Visit", status: "New",
    createdAt: "2026-03-22", tags: ["First Contact"],
    evangelistId: "e3", teamId: "t2",
    notes: "Met at Moi Avenue. Open to talking more.",
  },
  {
    id: "c5", fullName: "Eunice Nyambura", phone: "+254 701 111 005",
    gender: "Female", ageRange: "18-25", bornAgain: "Yes",
    discipleshipStatus: "In Progress", baptized: "No",
    location: "River Road", isStudent: true, institution: "KCA University",
    course: "IT", yearOfStudy: "3rd",
    followUpMethod: "WhatsApp", bestTime: "Afternoons",
    status: "Actively Discipling", createdAt: "2026-03-15",
    tags: ["Student", "New Believer", "Campus Outreach"],
    evangelistId: "e4", teamId: "t2",
  },
  {
    id: "c6", fullName: "Felix Mutua", phone: "+254 701 111 006",
    gender: "Male", ageRange: "26-35", bornAgain: "Yes",
    discipleshipStatus: "Done", baptized: "Yes",
    location: "Kibera", isStudent: false,
    followUpMethod: "Church Invitation",
    status: "Connected to Church", createdAt: "2026-01-20",
    tags: ["Community Leader"], evangelistId: "e5", teamId: "t3",
  },
  {
    id: "c7", fullName: "Gloria Adhiambo", phone: "+254 701 111 007",
    gender: "Female", ageRange: "18-25", bornAgain: "Unsure",
    discipleshipStatus: "Not Started", baptized: "No",
    location: "Langata", isStudent: true, institution: "Daystar University",
    course: "Communications", yearOfStudy: "1st",
    followUpMethod: "WhatsApp", status: "Needs Follow-up",
    createdAt: "2026-03-21", tags: ["Student", "Campus Outreach"],
    evangelistId: "e6", teamId: "t3",
  },
  {
    id: "c8", fullName: "Henry Njeru", phone: "+254 701 111 008",
    gender: "Male", ageRange: "26-35", bornAgain: "No",
    discipleshipStatus: "Not Started", baptized: "No",
    location: "Eastleigh", isStudent: false,
    followUpMethod: "Call", bestTime: "Weekends",
    status: "Not Interested", createdAt: "2026-03-10",
    tags: [], evangelistId: "e7", teamId: "t4",
    notes: "Not ready. Respectfully declined. May revisit.",
  },
  {
    id: "c9", fullName: "Irene Auma", phone: "+254 701 111 009",
    gender: "Female", ageRange: "36-50", bornAgain: "Yes",
    discipleshipStatus: "In Progress", baptized: "Yes",
    location: "Buruburu", isStudent: false,
    followUpMethod: "Visit", status: "Actively Discipling",
    createdAt: "2026-03-08", tags: ["Family"],
    evangelistId: "e8", teamId: "t4",
    prayerRequests: "Healing for her husband. Family salvation.",
  },
  {
    id: "c10", fullName: "James Mungai", phone: "+254 701 111 010",
    gender: "Male", ageRange: "18-25", bornAgain: "Yes",
    discipleshipStatus: "Done", baptized: "Yes",
    location: "Umoja", isStudent: true, institution: "JKUAT",
    course: "Engineering", yearOfStudy: "3rd",
    followUpMethod: "Church Invitation",
    status: "Connected to Church", createdAt: "2026-02-01",
    tags: ["Student", "Leader Potential"],
    evangelistId: "e7", teamId: "t4",
  },
  {
    id: "c11", fullName: "Karen Simiyu", phone: "+254 701 111 011",
    gender: "Female", ageRange: "18-25", bornAgain: "Yes",
    discipleshipStatus: "In Progress", baptized: "No",
    location: "Westlands", isStudent: true, institution: "United States International University",
    course: "Psychology", yearOfStudy: "2nd",
    followUpMethod: "WhatsApp", status: "Actively Discipling",
    createdAt: "2026-03-19", tags: ["Student", "New Believer"],
    evangelistId: "e1", teamId: "t1",
  },
  {
    id: "c12", fullName: "Levi Waweru", phone: "+254 701 111 012",
    gender: "Male", ageRange: "26-35", bornAgain: "Unsure",
    discipleshipStatus: "Not Started", baptized: "No",
    location: "CBD", isStudent: false,
    followUpMethod: "Call", status: "New",
    createdAt: "2026-03-22", tags: ["Seeker"],
    evangelistId: "e3", teamId: "t2",
  },
];

// ─── Outreach Sessions ────────────────────────────────────────────────────────

export const MOCK_SESSIONS: OutreachSession[] = [
  { id: "s1", date: "2026-03-22", teamId: "t1", location: "Westlands Junction", evangelistsPresent: 2, contactsMade: 12, savedCount: 4, prayerCount: 6 },
  { id: "s2", date: "2026-03-22", teamId: "t2", location: "Moi Avenue", evangelistsPresent: 2, contactsMade: 15, savedCount: 6, prayerCount: 8 },
  { id: "s3", date: "2026-03-21", teamId: "t3", location: "Kibera Village", evangelistsPresent: 2, contactsMade: 8, savedCount: 3, prayerCount: 5 },
  { id: "s4", date: "2026-03-21", teamId: "t4", location: "Eastleigh Market", evangelistsPresent: 2, contactsMade: 11, savedCount: 5, prayerCount: 7 },
  { id: "s5", date: "2026-03-15", teamId: "t1", location: "Parklands Church Ground", evangelistsPresent: 2, contactsMade: 10, savedCount: 3, prayerCount: 5 },
  { id: "s6", date: "2026-03-15", teamId: "t2", location: "River Road", evangelistsPresent: 2, contactsMade: 13, savedCount: 5, prayerCount: 7 },
  { id: "s7", date: "2026-03-08", teamId: "t3", location: "Langata Estate", evangelistsPresent: 2, contactsMade: 9, savedCount: 2, prayerCount: 4 },
  { id: "s8", date: "2026-03-08", teamId: "t4", location: "Umoja Stage", evangelistsPresent: 2, contactsMade: 10, savedCount: 4, prayerCount: 6 },
];

// ─── Weekly Trends ────────────────────────────────────────────────────────────

export const MOCK_WEEKLY_TRENDS: WeeklyTrend[] = [
  { week: "Jan 5",  contacts: 34, saved: 12, students: 15 },
  { week: "Jan 12", contacts: 41, saved: 15, students: 18 },
  { week: "Jan 19", contacts: 38, saved: 11, students: 16 },
  { week: "Jan 26", contacts: 45, saved: 17, students: 20 },
  { week: "Feb 2",  contacts: 52, saved: 20, students: 23 },
  { week: "Feb 9",  contacts: 48, saved: 18, students: 21 },
  { week: "Feb 16", contacts: 55, saved: 22, students: 25 },
  { week: "Feb 23", contacts: 61, saved: 24, students: 27 },
  { week: "Mar 2",  contacts: 58, saved: 21, students: 26 },
  { week: "Mar 9",  contacts: 63, saved: 25, students: 29 },
  { week: "Mar 16", contacts: 67, saved: 27, students: 31 },
  { week: "Mar 22", contacts: 46, saved: 18, students: 22 },
];

// ─── System Stats ─────────────────────────────────────────────────────────────

export const MOCK_STATS = {
  totalReached: MOCK_CONTACTS.length + 591,       // total all time
  totalEvangelists: MOCK_EVANGELISTS.length,
  totalTeams: MOCK_TEAMS.length,
  pendingFollowUps: MOCK_CONTACTS.filter(c => c.status === "Needs Follow-up").length + 39,
  studentsReached: MOCK_CONTACTS.filter(c => c.isStudent).length + 187,
  connectedToChurch: MOCK_CONTACTS.filter(c => c.status === "Connected to Church").length + 98,
  savedThisMonth: 95,
  savedAllTime: 216,
  thisWeekContacts: MOCK_EVANGELISTS.reduce((a, e) => a + e.thisWeekContacts, 0),
  thisMonthContacts: MOCK_EVANGELISTS.reduce((a, e) => a + e.thisMonthContacts, 0),
};

// ─── Pipeline summary ─────────────────────────────────────────────────────────

export function getPipelineSummary() {
  return [
    { stage: "New", count: MOCK_CONTACTS.filter(c => c.status === "New").length, color: "#3b82f6" },
    { stage: "Follow-up", count: MOCK_CONTACTS.filter(c => c.status === "Needs Follow-up").length, color: "#f59e0b" },
    { stage: "Discipling", count: MOCK_CONTACTS.filter(c => c.status === "Actively Discipling").length, color: "#10b981" },
    { stage: "Connected", count: MOCK_CONTACTS.filter(c => c.status === "Connected to Church").length, color: "#8b5cf6" },
    { stage: "Not Interested", count: MOCK_CONTACTS.filter(c => c.status === "Not Interested").length, color: "#94a3b8" },
  ];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getEvangelist(id: string) {
  return MOCK_EVANGELISTS.find(e => e.id === id);
}

export function getTeam(id: string) {
  return MOCK_TEAMS.find(t => t.id === id);
}

export function getContactsByEvangelist(evangelistId: string) {
  return MOCK_CONTACTS.filter(c => c.evangelistId === evangelistId);
}

export function getTeamMembers(teamId: string) {
  return MOCK_EVANGELISTS.filter(e => e.teamId === teamId);
}

export function statusBadgeClass(status: ContactStatus): string {
  const map: Record<ContactStatus, string> = {
    "New": "badge-new",
    "Needs Follow-up": "badge-followup",
    "Actively Discipling": "badge-discipling",
    "Connected to Church": "badge-connected",
    "Not Interested": "badge-not-int",
  };
  return map[status];
}
