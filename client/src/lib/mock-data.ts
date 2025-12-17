export interface Contact {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  gender?: string;
  ageRange?: string;
  church?: string;
  bornAgain: "Yes" | "No" | "Unsure";
  discipleshipStatus: "Done" | "In Progress" | "Not Started";
  baptized: "Yes" | "No" | "Unsure";
  location: string;
  isStudent: boolean;
  institution?: string;
  course?: string;
  yearOfStudy?: string;
  followUpMethod: "Call" | "WhatsApp" | "Visit" | "Church Invitation";
  bestTime?: string;
  prayerRequests?: string;
  notes?: string;
  status: "New" | "Needs Follow-up" | "Actively Discipling" | "Connected to Church" | "Not Interested";
  createdAt: string;
  tags: string[];
}

export const MOCK_CONTACTS: Contact[] = [
  {
    id: "1",
    fullName: "Sarah Jenkins",
    phone: "555-0123",
    email: "sarah.j@example.com",
    gender: "Female",
    ageRange: "18-25",
    bornAgain: "Yes",
    discipleshipStatus: "In Progress",
    baptized: "No",
    location: "Downtown",
    isStudent: true,
    institution: "City University",
    course: "Psychology",
    yearOfStudy: "2nd",
    followUpMethod: "WhatsApp",
    status: "Actively Discipling",
    createdAt: "2024-03-10",
    tags: ["Student", "New Believer"],
    notes: "Interested in joining a small group.",
  },
  {
    id: "2",
    fullName: "Michael Chen",
    phone: "555-0456",
    gender: "Male",
    ageRange: "26-35",
    bornAgain: "Unsure",
    discipleshipStatus: "Not Started",
    baptized: "No",
    location: "Westside",
    isStudent: false,
    followUpMethod: "Call",
    bestTime: "Evenings",
    status: "New",
    createdAt: "2024-03-12",
    tags: ["Seeker"],
    prayerRequests: "Prayer for job search.",
  },
  {
    id: "3",
    fullName: "David Okonjo",
    phone: "555-0789",
    gender: "Male",
    ageRange: "18-25",
    bornAgain: "Yes",
    discipleshipStatus: "Done",
    baptized: "Yes",
    location: "Campus Dorms",
    isStudent: true,
    institution: "Tech Institute",
    course: "Computer Science",
    yearOfStudy: "Final",
    followUpMethod: "WhatsApp",
    status: "Connected to Church",
    createdAt: "2024-02-15",
    tags: ["Student", "Leader Potential"],
  },
  {
    id: "4",
    fullName: "Emily Rodriguez",
    phone: "555-1011",
    gender: "Female",
    ageRange: "36-50",
    bornAgain: "No",
    discipleshipStatus: "Not Started",
    baptized: "No",
    location: "North Hills",
    isStudent: false,
    followUpMethod: "Visit",
    status: "Needs Follow-up",
    createdAt: "2024-03-14",
    tags: ["Family"],
    notes: "Met at the community food drive.",
  }
];

export const MOCK_STATS = {
  totalReached: 145,
  pendingFollowUps: 12,
  studentsReached: 45,
  connectedToChurch: 32,
};
