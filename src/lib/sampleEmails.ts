export interface SampleEmailFixture {
  id: string;
  subject: string;
  sender: string;
  receivedAt: string;
  body: string;
  expectedCompany: string;
  expectedEventType: string;
  tag: string;
}

export const SAMPLE_PES_EMAILS: SampleEmailFixture[] = [
  // 1. In-App Registration (PESU Academy) - Goldman Sachs
  {
    id: "pes-email-001",
    subject: "Campus Recruitment 2026 - Goldman Sachs Summer Analyst Drive (Register on PESU Academy)",
    sender: "placement@pes.edu",
    receivedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    tag: "Registration (App)",
    expectedCompany: "Goldman Sachs",
    expectedEventType: "APP_REGISTRATION",
    body: `Dear Students,

Greetings from the Placement Office!

Goldman Sachs is visiting PES University for the recruitment of the 2026 Graduating Batch for the role of Summer Analyst.

Role: Summer Analyst 2026 (Engineering Division)
Stipend: Rs. 1,50,000 / month
CTC: 28.5 LPA (upon PPO conversion)
Eligibility Criteria:
- B.Tech in CSE, ISE, ECE, EEE
- Minimum CGPA Cutoff: 7.50 and above (No active backlogs)
- 10th & 12th: 70% and above

Registration Process:
Eligible and interested candidates must apply on the PESU Academy Placement Portal before the deadline.

Portal URL: https://pesuacademy.com/Academy/s/placement
Deadline to register: Tomorrow at 5:00 PM (Strict deadline. No extensions will be entertained).

Warm Regards,
Office of Career Services & Placements
PES University - RR Campus, Bangalore`,
  },

  // 2. External Form Registration - Cisco Systems
  {
    id: "pes-email-002",
    subject: "Urgent: Cisco Campus Hiring 2026 - Mandatory Google Form Submission",
    sender: "placements.support@pes.edu",
    receivedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    tag: "Registration (Google Form)",
    expectedCompany: "Cisco",
    expectedEventType: "REGISTRATION_FORM",
    body: `Attention 2026 Batch Students,

In addition to the PESU Academy registration, Cisco Systems requires all interested candidates to fill out their global candidate registration form with their updated resume and GitHub/Portfolio links.

Role: Technical Consulting Engineer / SDE-1
CTC: 19.5 LPA (Base: 14.5 LPA)
Eligibility:
- Branches: CSE, ISE, ECE, EEE, AIML
- Cutoff: CGPA 7.00 and above
- Active backlogs: 0

Mandatory Form Link: https://forms.gle/Cisco2026PESUHiringDrive
Registration Deadline: TODAY at 11:59 PM (Hard cutoff set by Cisco HR).

Note: Failure to fill this form will lead to immediate disqualification from the online assessment.

Best regards,
Placement Cell, PES University`,
  },

  // 3. Online Assessment Test Link - Goldman Sachs
  {
    id: "pes-email-003",
    subject: "Goldman Sachs Online Assessment (Aptitude + Coding) - Test Link & Slotting",
    sender: "placement@pes.edu",
    receivedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    tag: "Assessment / OT",
    expectedCompany: "Goldman Sachs",
    expectedEventType: "ASSESSMENT_LINK",
    body: `Dear Shortlisted Students for Goldman Sachs Drive,

The Online Assessment (HackerRank Platform) has been scheduled as per the details below:

Test Window: Tonight 8:00 PM to 10:00 PM (Test duration: 90 minutes)
Platform: HackerRank
Test Link: https://www.hackerrank.com/tests/goldman-sachs-pes-2026-eval

Format:
- Section 1: Quantitative & Logical Reasoning (10 MCQs)
- Section 2: Core Computer Science (OS, DBMS, Networks - 10 MCQs)
- Section 3: 2 Advanced DSA Coding Problems

Instructions:
1. Ensure a working webcam and microphone. AI proctoring is enabled.
2. Login with your official @pes.edu email address only.
3. Keep your PES University Student ID card handy.

All the best!
Placement Division`,
  },

  // 4. Shortlist Announcement - Akamai Technologies
  {
    id: "pes-email-004",
    subject: "Akamai Technologies SDE Drive - OT Shortlist Released for Technical Interviews",
    sender: "placements@pes.edu",
    receivedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    tag: "Shortlist Released",
    expectedCompany: "Akamai",
    expectedEventType: "SHORTLIST_RELEASED",
    body: `Dear Students,

Akamai Technologies has announced the list of candidates shortlisted after the Online Assessment held on 22nd August 2026.

Role: Software Development Engineer - Cloud Infrastructure
Package: 23.8 LPA (Base 17 LPA + RSUs)
Eligibility Cutoff was: 7.60 CGPA

Shortlisted Candidates for Technical Round 1:
1. PES2UG22CS001 - Candidate A
2. PES2UG22CS045 - Candidate B
3. PES2UG22CS112 - Candidate C
4. PES2UG22CS189 - Candidate D
5. PES2UG22CS204 - Candidate E
6. PES2UG22CS310 - Candidate F
7. PES2UG22CS412 - Candidate G
8. PES2UG22EC019 - Candidate H
(Total 24 candidates shortlisted).

Technical interviews will commence tomorrow morning from 9:30 AM via Microsoft Teams. Detailed slots will follow.

Congratulations to the shortlisted candidates!
Career Services Department`,
  },

  // 5. Interview Schedule - Akamai Technologies
  {
    id: "pes-email-005",
    subject: "Akamai Tech Drive - Interview Schedule, Panel Links & Slot Timings",
    sender: "placement@pes.edu",
    receivedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    tag: "Interview Schedule",
    expectedCompany: "Akamai",
    expectedEventType: "INTERVIEW_SCHEDULE",
    body: `Dear Shortlisted Candidates,

Please find the interview schedule for Akamai Technologies Technical Round 1 scheduled for tomorrow:

Date: 26th August 2026
Venue / Mode: Microsoft Teams Virtual Meeting
Meeting Link: https://teams.microsoft.com/l/meetup-join/akamai-pes-round1

Your slot is scheduled between 10:30 AM – 11:30 AM.
Please join 10 minutes prior to your allocated slot with resume and government ID.

Rounds:
1. Technical Round 1: Data Structures, Operating Systems, Networking & Live Coding (45 mins)
2. Technical Round 2: System Architecture & Project Deep-Dive (45 mins - for cleared candidates)

Best wishes,
PES University Placement Cell`,
  },

  // 6. Offer Announcements - Target Corporation
  {
    id: "pes-email-006",
    subject: "Target Corporation Campus Drive 2026 - Final Results & Offer Announcement",
    sender: "placement@pes.edu",
    receivedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    tag: "Offer Announcement",
    expectedCompany: "Target Corporation",
    expectedEventType: "OFFER_ANNOUNCEMENT",
    body: `Hearty Congratulations to all the selected students!

Target Corporation has completed all interview rounds and has offered full-time roles to the following 8 PES University students:

Role: Engineer (Target Tech India)
CTC: 16.5 LPA
Location: Bangalore

Selected Students:
- PES2UG22CS088 - Rahul S
- PES2UG22CS142 - Sneha K
- PES2UG22CS210 - Aditya V
- PES2UG22CS334 - Priya R
- PES2UG22EC055 - Manoj P
- PES2UG22EC102 - Swathi M

The official offer letters and onboarding procedures will be communicated soon.

Regards,
Dean - Career Services & Placements, PES University`,
  },

  // 7. High Cutoff Drive - Atlassian (CGPA Cutoff 8.5) -> Tests Ineligible Status
  {
    id: "pes-email-007",
    subject: "Atlassian Campus Recruitment 2026 - Registration Open (Super Dream)",
    sender: "placement@pes.edu",
    receivedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    tag: "Registration (Super Dream)",
    expectedCompany: "Atlassian",
    expectedEventType: "APP_REGISTRATION",
    body: `Dear Students,

Atlassian is visiting PES University for hiring Software Engineering Interns (2026 Batch).

Role: Software Engineer Intern (Summer 2026)
Stipend: Rs. 2,00,000 / month
PPO CTC: 55 LPA (Super Dream Tier 1)
Eligibility:
- B.Tech CSE / ISE only
- CGPA Cutoff: Strictly 8.50 and above (No active backlogs)

Apply on PESU Academy portal before 28th August 6:00 PM.

Regards,
Placement Cell, PES University`,
  }
];
