import { Category } from "./types";

export interface SampleEmailFixture {
  id: string;
  subject: string;
  sender: string;
  receivedAt: string;
  body: string;
  expectedCompany: string;
  expectedCategory: Category;
  expectedEventType: string;
  tag: string;
}

export const SAMPLE_PES_EMAILS: SampleEmailFixture[] = [
  // 1. In-App Registration (PESU Academy) - Goldman Sachs (Company)
  {
    id: "pes-email-001",
    subject: "Campus Recruitment 2026 - Goldman Sachs Summer Analyst Drive (Register on PESU Academy)",
    sender: "placement@pes.edu",
    receivedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    tag: "Registration (App)",
    expectedCompany: "Goldman Sachs",
    expectedCategory: "COMPANY",
    expectedEventType: "APP_REGISTRATION",
    body: `Dear Students,

Greetings from the Placement Office!

Goldman Sachs is visiting PES University for the recruitment of the 2026 Graduating Batch for the role of Summer Analyst.

Role: Summer Analyst 2026 (Engineering Division)
Stipend: Rs. 1,50,000 / month
CTC: 28.5 LPA (upon PPO conversion)
Eligibility Criteria:
- B.Tech in CSE, ISE, ECE, EEE, AIML
- Cutoff: 7.50 CGPA (No active backlogs)

Registration Process:
Eligible and interested candidates must apply on the PESU Academy Placement Portal before the deadline.

Portal URL: https://pesuacademy.com/Academy/s/placement
Deadline to register: Tomorrow at 5:00 PM (Strict deadline. No extensions will be entertained).

Warm Regards,
Office of Career Services & Placements
PES University - RR Campus, Bangalore`,
  },

  // 2. External Form Registration - Cisco Systems (Company)
  {
    id: "pes-email-002",
    subject: "Urgent: Cisco Campus Hiring 2026 - Mandatory Google Form Submission",
    sender: "placements.support@pes.edu",
    receivedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    tag: "Registration (Google Form)",
    expectedCompany: "Cisco",
    expectedCategory: "COMPANY",
    expectedEventType: "REGISTRATION_FORM",
    body: `Attention 2026 Batch Students,

In addition to the PESU Academy registration, Cisco Systems requires all interested candidates to fill out their candidate registration form with their updated resume and GitHub/Portfolio links.

Role: Technical Consulting Engineer / SDE-1
CTC: 19.5 LPA (Base: 14.5 LPA)
Eligibility: All circuital branches (CSE, ISE, ECE, EEE, AIML)

Mandatory Form Link: https://forms.gle/Cisco2026PESUHiringDrive
Registration Deadline: TODAY at 11:59 PM (Hard cutoff set by Cisco HR).

Note: Failure to fill this form will lead to disqualification from the online assessment.

Best regards,
Placement Cell, PES University`,
  },

  // 3. Online Assessment Test Link - Goldman Sachs (Company)
  {
    id: "pes-email-003",
    subject: "Goldman Sachs Online Assessment (Aptitude + Coding) - Test Link & Slotting",
    sender: "placement@pes.edu",
    receivedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    tag: "Assessment / OT",
    expectedCompany: "Goldman Sachs",
    expectedCategory: "COMPANY",
    expectedEventType: "ASSESSMENT_LINK",
    body: `Dear Registered Students for Goldman Sachs Drive,

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

All the best!
Placement Division`,
  },

  // 4. Shortlist Announcement - Akamai Technologies (Company)
  {
    id: "pes-email-004",
    subject: "Akamai Technologies SDE Drive - OT Shortlist Released for Technical Interviews",
    sender: "placements@pes.edu",
    receivedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    tag: "Shortlist Released",
    expectedCompany: "Akamai",
    expectedCategory: "COMPANY",
    expectedEventType: "SHORTLIST_RELEASED",
    body: `Dear Students,

Akamai Technologies has announced the list of candidates shortlisted after the Online Assessment held on 22nd August 2026.

Role: Software Development Engineer - Cloud Infrastructure
Package: 23.8 LPA (Base 17 LPA + RSUs)

Shortlisted Candidates for Technical Round 1:
1. PES2UG22CS001 - Candidate A
2. PES2UG22CS045 - Candidate B
3. PES2UG22CS112 - Candidate C
4. PES2UG22CS189 - Candidate D
5. PES2UG22CS204 - Candidate E
(Total 24 candidates shortlisted).

Technical interviews will commence tomorrow morning from 9:30 AM via Microsoft Teams. Detailed slots will follow.

Congratulations to the shortlisted candidates!
Career Services Department`,
  },

  // 5. Hackathon 1 - Smart India Hackathon (SIH 2026)
  {
    id: "pes-email-005",
    subject: "Smart India Hackathon (SIH 2026) - Internal College Nominations & Idea Submission",
    sender: "hackathons@pes.edu",
    receivedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    tag: "Hackathon Registration",
    expectedCompany: "Smart India Hackathon (SIH)",
    expectedCategory: "HACKATHON",
    expectedEventType: "HACKATHON_REGISTRATION",
    body: `Dear Students,

The Ministry of Education & AICTE have announced Smart India Hackathon (SIH 2026). PES University will be shortlisting top 30 teams for the nationwide grand finale.

Theme: Smart Automation, Clean Tech, AI for Healthcare, Cyber Security & Fintech
Prize Pool: ₹1,00,000 per problem statement (Total ₹1+ Crore national prize pool)
Team Composition: 6 Members per team (Mandatory 1 female member)

Steps to participate:
1. Review the Problem Statements at https://www.sih.gov.in/sih2026PS
2. Submit your internal team nomination and 3-page PPT on the PES Hackathon Portal.

Internal Submission Link: https://forms.gle/PESUSmartIndiaHackathon2026
Internal Deadline: Friday 6:00 PM

Organizing Committee,
Centre for Innovation & Entrepreneurship (CIE), PES University`,
  },

  // 6. Hackathon 2 - PES Inter-Campus HackNight
  {
    id: "pes-email-006",
    subject: "PES Inter-Campus HackNight 2026 - 24-Hour Codeathon Problem Statements Released",
    sender: "hacknight@pes.edu",
    receivedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    tag: "Problem Statement",
    expectedCompany: "PES Inter-Campus HackNight",
    expectedCategory: "HACKATHON",
    expectedEventType: "PROBLEM_STATEMENT",
    body: `Hey Hackers!

The Problem Statements and Tracks for PES Inter-Campus HackNight 2026 are now live!

Tracks:
1. Generative AI & Autonomous Agents
2. Decentralized Finance (Web3)
3. High Performance Distributed Systems
4. Open Innovation

Tracks & Submission Portal: https://devfolio.co/pes-hacknight-2026/tracks
Project Submission Deadline: Tomorrow at 2:00 PM

Mentors will be available on Discord throughout the night.

Happy Hacking!
PES ACM Student Chapter`,
  },

  // 7. Workshop - AWS Cloud & DevOps Bootcamp
  {
    id: "pes-email-007",
    subject: "Technical Workshop: AWS Cloud Architecture & Kubernetes DevOps Bootcamp",
    sender: "workshops@pes.edu",
    receivedAt: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
    tag: "Workshop Registration",
    expectedCompany: "AWS Cloud Bootcamp",
    expectedCategory: "WORKSHOP",
    expectedEventType: "WORKSHOP_REGISTRATION",
    body: `Dear Engineering Students,

Department of Computer Science is conducting a 2-day hands-on bootcamp on Enterprise Cloud Architecture with AWS Solutions Architects.

Topics Covered:
- AWS Core Services (EC2, S3, IAM, VPC)
- Microservices deployment with Docker & Kubernetes (EKS)
- CI/CD Pipelines with GitHub Actions

Session Dates: Saturday & Sunday (10:00 AM - 4:00 PM)
Venue: Seminar Hall 3, Golden Jubilee Block / Zoom Virtual Link
Certificate: Certificate of completion by AWS Academy

Register here: https://forms.gle/AWSBootcampPESU2026
Registration Closes: Thursday at 8:00 PM

Regards,
Department of CSE, PES University`,
  },

  // 8. General Placement Notice
  {
    id: "pes-email-008",
    subject: "Important Notice: Placement Season 2026 Code of Conduct & Tier Upgrades",
    sender: "placement.dean@pes.edu",
    receivedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    tag: "General Notice",
    expectedCompany: "Placement Policy & Guidelines",
    expectedCategory: "NOTICE",
    expectedEventType: "GENERAL_UPDATE",
    body: `Dear 2026 Batch Students,

Please review the updated Placement Policy Guidelines regarding dream/super-dream upgrades, test ethics, and resume verification.

Key Guidelines:
1. Strict zero-tolerance policy against unfair means during online assessments.
2. Students securing a Tier-2 offer (8-14 LPA) remain eligible for Tier-1 Super Dream drives (15+ LPA).
3. Ensure your profile and resumes on PESU Academy are updated.

Refer to the complete handbook on the portal: https://pesuacademy.com/Academy/s/placementGuidelines

Dean - Placements & Corporate Relations, PES University`,
  }
];

