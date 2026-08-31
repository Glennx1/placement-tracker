import { Category, ExcelAttachment } from "./types";

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
  mailIndex?: number;
  excelAttachment?: ExcelAttachment;
}

export const SAMPLE_PES_EMAILS: SampleEmailFixture[] = [
  // ==========================================
  // COMPANY 1: Goldman Sachs (m1, m2, m3)
  // ==========================================
  
  // Goldman Sachs - Mail 1 (m1) [July 20, 2026]
  {
    id: "pes-email-gs-001",
    subject: "Campus Recruitment 2026 - Goldman Sachs Summer Analyst Drive (Apply via PESU Academy)",
    sender: "placement@pes.edu",
    receivedAt: "2026-07-20T10:30:00Z",
    tag: "m1 (Registration)",
    mailIndex: 1,
    expectedCompany: "Goldman Sachs",
    expectedCategory: "COMPANY",
    expectedEventType: "APP_REGISTRATION",
    body: `Dear Students of 2026 Batch,

Greetings from the Office of Career Services & Placements!

Goldman Sachs is visiting PES University for the recruitment of the 2026 Graduating Batch for the role of Summer Analyst.

Role: Summer Analyst 2026 (Engineering Division)
Stipend: Rs. 1,50,000 / month
CTC: 28.5 LPA (upon PPO conversion)
Eligibility:
- B.Tech in CSE, ISE, ECE, EEE, AIML
- Cutoff: 7.50 CGPA (No active backlogs)

Registration Process:
1. Eligible and interested students must register directly on the PESU Academy Placement Portal.
2. Portal link: https://pesuacademy.com/Academy/s/placement
3. Deadline to register on PESU Academy: July 23, 2026 at 5:00 PM (Strict cutoff).

Warm Regards,
Office of Career Services & Placements
PES University - RR Campus, Bangalore`,
  },

  // Goldman Sachs - Mail 2 (m2) [July 24, 2026]
  {
    id: "pes-email-gs-002",
    subject: "Goldman Sachs Online Assessment (Aptitude + Coding) - Test Link & Slotting",
    sender: "placement@pes.edu",
    receivedAt: "2026-07-24T14:15:00Z",
    tag: "m2 (Assessment)",
    mailIndex: 2,
    expectedCompany: "Goldman Sachs",
    expectedCategory: "COMPANY",
    expectedEventType: "ASSESSMENT_LINK",
    body: `Dear Registered Students for Goldman Sachs Drive,

The Online Assessment (HackerRank Platform) has been scheduled as per the details below:

Test Window: July 25, 2026 | 8:00 PM to 10:00 PM (Test duration: 90 minutes)
Platform: HackerRank
Assessment Link: https://www.hackerrank.com/tests/goldman-sachs-pes-2026-eval

Format:
- Section 1: Quantitative & Logical Reasoning (10 MCQs)
- Section 2: Core Computer Science (OS, DBMS, Networks - 10 MCQs)
- Section 3: 2 Advanced DSA Coding Problems

Instructions:
1. Login with your official @pes.edu email address only.
2. Ensure webcam and microphone access is enabled for AI proctoring.

All the best!
Placement Division, PES University`,
  },

  // Goldman Sachs - Mail 3 (m3) [July 28, 2026]
  {
    id: "pes-email-gs-003",
    subject: "Goldman Sachs Summer Analyst Drive - Technical Interview Shortlist & Schedule",
    sender: "placements@pes.edu",
    receivedAt: "2026-07-28T16:45:00Z",
    tag: "m3 (Shortlist)",
    mailIndex: 3,
    expectedCompany: "Goldman Sachs",
    expectedCategory: "COMPANY",
    expectedEventType: "SHORTLIST_RELEASED",
    excelAttachment: {
      filename: "Goldman_Sachs_Shortlist_Technical_Round1.xlsx",
      candidateCount: 42,
      previewSnippet: "PES1UG22CS014, PES1UG22CS089, PES1UG22CS142, PES1UG22CS210 +38 more",
      fileSize: "45 KB",
    },
    body: `Dear Students,

Goldman Sachs has released the list of candidates shortlisted for Technical Round 1 interviews following the online assessment.

Attached Excel Sheet: Goldman_Sachs_Shortlist_Technical_Round1.xlsx (42 candidates shortlisted).

Shortlisted Candidates Preview:
- PES1UG22CS014 - Ananya Sharma
- PES1UG22CS089 - Rohan Kulkarni
- PES1UG22CS142 - Deepa S
- PES1UG22CS210 - Rahul Verma
(Please check the attached Excel sheet for your exact panel slot).

Interview Details:
- Date: July 30, 2026 from 9:30 AM onwards
- Mode: Microsoft Teams (Panel link will be emailed 15 mins prior)
- Have your resume and government ID card ready.

Congratulations to all shortlisted students!
Placement Office`,
  },

  // ==========================================
  // COMPANY 2: Cisco Systems (m1, m2, m3)
  // ==========================================
  
  // Cisco - Mail 1 (m1) [July 22, 2026]
  {
    id: "pes-email-cisco-001",
    subject: "Cisco Campus Hiring 2026 - Mandatory Google Form Submission & Profile Update",
    sender: "placements.support@pes.edu",
    receivedAt: "2026-07-22T11:00:00Z",
    tag: "m1 (Registration Form)",
    mailIndex: 1,
    expectedCompany: "Cisco",
    expectedCategory: "COMPANY",
    expectedEventType: "REGISTRATION_FORM",
    body: `Attention 2026 Batch Students,

Cisco Systems is opening campus hiring for Software Engineers and Technical Consulting Engineers.

Role: Software Development Engineer - Networking & Cloud
CTC: 19.5 LPA (Base: 14.5 LPA)
Eligibility: CSE, ISE, ECE, EEE, AIML (Cutoff: 7.00 CGPA)

Action Required:
All interested candidates must complete both steps:
1. Register on PESU Academy Placement Portal: https://pesuacademy.com/Academy/s/placement
2. Fill Cisco's Candidate Submission Form: https://forms.gle/Cisco2026PESUHiringDrive

Deadline: July 24, 2026 at 11:59 PM (Hard cutoff).

Best regards,
Placement Cell, PES University`,
  },

  // Cisco - Mail 2 (m2) [July 29, 2026]
  {
    id: "pes-email-cisco-002",
    subject: "Cisco Online Assessment Schedule & HackerEarth Assessment Link",
    sender: "placement@pes.edu",
    receivedAt: "2026-07-29T15:30:00Z",
    tag: "m2 (Assessment)",
    mailIndex: 2,
    expectedCompany: "Cisco",
    expectedCategory: "COMPANY",
    expectedEventType: "ASSESSMENT_LINK",
    body: `Dear Candidates registered for Cisco Campus Drive,

The Online Assessment on HackerEarth has been scheduled for tomorrow:

Date: July 30, 2026 | 6:00 PM to 7:45 PM
Platform: HackerEarth
Test Link: https://www.hackerearth.com/challenges/test/cisco-pes-2026-campus-ot/

Sections:
1. Networking Fundamentals, OS, C/C++ Concepts (20 MCQs)
2. 2 Coding Questions (Data Structures & Problem Solving)

Ensure you login 10 minutes prior with your official @pes.edu email ID.

Placement Division`,
  },

  // Cisco - Mail 3 (m3) [August 04, 2026]
  {
    id: "pes-email-cisco-003",
    subject: "Cisco Systems Hiring 2026 - Shortlist Released for Managerial & Technical Interviews",
    sender: "placements@pes.edu",
    receivedAt: "2026-08-04T18:00:00Z",
    tag: "m3 (Shortlist)",
    mailIndex: 3,
    expectedCompany: "Cisco",
    expectedCategory: "COMPANY",
    expectedEventType: "SHORTLIST_RELEASED",
    excelAttachment: {
      filename: "Cisco_Shortlisted_Students_Technical_Round.xlsx",
      candidateCount: 35,
      previewSnippet: "PES1UG22CS023, PES1UG22CS095, PES1UG22EC012, PES1UG22CS301 +31 more",
      fileSize: "38 KB",
    },
    body: `Dear Students,

Cisco Systems has announced the results for the Online Assessment held on 30th July 2026.

Attached Excel Sheet: Cisco_Shortlisted_Students_Technical_Round.xlsx (35 candidates shortlisted).

Technical + Managerial interviews are scheduled for 6th August 2026 via Webex Meetings.

Congratulations!
Career Services Department`,
  },

  // ==========================================
  // COMPANY 3: Akamai Technologies (m1, m2)
  // ==========================================
  
  // Akamai - Mail 1 (m1) [August 01, 2026]
  {
    id: "pes-email-akamai-001",
    subject: "Akamai Technologies SDE Drive 2026 - Application Window Open on PESU Academy",
    sender: "placements@pes.edu",
    receivedAt: "2026-08-01T09:30:00Z",
    tag: "m1 (Registration)",
    mailIndex: 1,
    expectedCompany: "Akamai",
    expectedCategory: "COMPANY",
    expectedEventType: "APP_REGISTRATION",
    body: `Dear 2026 Graduating Batch,

Akamai Technologies is visiting PES University for recruitment.

Role: Software Development Engineer - Cloud Infrastructure
CTC: 23.8 LPA (Base 17 LPA + RSUs)
Cutoff: 7.50 CGPA | Branches: CSE, ISE, AIML

Register on PESU Academy: https://pesuacademy.com/Academy/s/placement
Deadline: August 03, 2026 at 5:00 PM.

Placement Cell`,
  },

  // Akamai - Mail 2 (m2) [August 10, 2026]
  {
    id: "pes-email-akamai-002",
    subject: "Akamai Technologies SDE Drive - OT Shortlist Released & Interview Slots",
    sender: "placements@pes.edu",
    receivedAt: "2026-08-10T14:00:00Z",
    tag: "m2 (Shortlist)",
    mailIndex: 2,
    expectedCompany: "Akamai",
    expectedCategory: "COMPANY",
    expectedEventType: "SHORTLIST_RELEASED",
    excelAttachment: {
      filename: "Akamai_Interview_Shortlist_2026.xlsx",
      candidateCount: 24,
      previewSnippet: "PES1UG22CS001, PES1UG22CS045, PES1UG22CS112, PES1UG22CS189 +20 more",
      fileSize: "32 KB",
    },
    body: `Dear Students,

Akamai Technologies has released the shortlist after the Online Assessment.

Attached Excel Sheet: Akamai_Interview_Shortlist_2026.xlsx (24 candidates).

Interviews will take place on Microsoft Teams on August 12, 2026.

Congratulations!
Career Services Department`,
  },

  // ==========================================
  // HACKATHON 1: Smart India Hackathon (m1, m2)
  // ==========================================
  
  // SIH - Mail 1 (m1) [July 21, 2026]
  {
    id: "pes-email-sih-001",
    subject: "Smart India Hackathon (SIH 2026) - Internal College Nominations & Idea Submission",
    sender: "hackathons@pes.edu",
    receivedAt: "2026-07-21T11:30:00Z",
    tag: "m1 (Hackathon Registration)",
    mailIndex: 1,
    expectedCompany: "Smart India Hackathon (SIH)",
    expectedCategory: "HACKATHON",
    expectedEventType: "HACKATHON_REGISTRATION",
    body: `Dear Students,

The Ministry of Education & AICTE have announced Smart India Hackathon (SIH 2026). PES University will be shortlisting the top 30 teams for the national grand finale.

Theme: Smart Automation, Clean Tech, AI for Healthcare, Cyber Security & Fintech
Prize Pool: ₹1,00,000 per problem statement (₹1+ Crore total national prize pool)
Team Size: 6 Members per team (Mandatory at least 1 female member)

Steps to Participate:
1. Review the Problem Statements at https://www.sih.gov.in/sih2026PS
2. Submit your internal team nomination and PPT at: https://forms.gle/PESUSmartIndiaHackathon2026

Internal Submission Deadline: July 28, 2026 at 6:00 PM.

Organizing Committee,
Centre for Innovation & Entrepreneurship (CIE), PES University`,
  },

  // SIH - Mail 2 (m2) [August 08, 2026]
  {
    id: "pes-email-sih-002",
    subject: "SIH 2026 - Internal Shortlist Released & Final Pitching Schedule",
    sender: "hackathons@pes.edu",
    receivedAt: "2026-08-08T17:00:00Z",
    tag: "m2 (Shortlist)",
    mailIndex: 2,
    expectedCompany: "Smart India Hackathon (SIH)",
    expectedCategory: "HACKATHON",
    expectedEventType: "SHORTLIST_RELEASED",
    excelAttachment: {
      filename: "PESU_SIH_2026_Shortlisted_Teams.xlsx",
      candidateCount: 30,
      previewSnippet: "Team CodeCraft, Team NeuralNexus, Team GreenVolt, Team CyberShield +26 teams",
      fileSize: "28 KB",
    },
    body: `Dear Hackers,

The internal jury has evaluated all 140 team submissions for Smart India Hackathon 2026.

Attached Excel Sheet: PESU_SIH_2026_Shortlisted_Teams.xlsx (30 teams nominated).

The internal offline pitching round is scheduled for August 14, 2026 at Seminar Hall 1, Golden Jubilee Block.

Best of luck!
CIE, PES University`,
  },

  // ==========================================
  // HACKATHON 2: PES Inter-Campus HackNight (m1)
  // ==========================================
  {
    id: "pes-email-hacknight-001",
    subject: "PES Inter-Campus HackNight 2026 - Tracks & Devfolio Registration Live",
    sender: "hacknight@pes.edu",
    receivedAt: "2026-08-12T12:00:00Z",
    tag: "m1 (Hackathon Tracks)",
    mailIndex: 1,
    expectedCompany: "PES Inter-Campus HackNight",
    expectedCategory: "HACKATHON",
    expectedEventType: "PROBLEM_STATEMENT",
    body: `Hey Hackers!

The Problem Statements and Tracks for PES Inter-Campus HackNight 2026 are now live!

Tracks:
1. Generative AI & Autonomous Multi-Agent Systems
2. Decentralized Finance (Web3) & Smart Contracts
3. High Performance Distributed Systems
4. Open Innovation

Devfolio Registration & Submission Portal: https://devfolio.co/pes-hacknight-2026/tracks
Submission Deadline: August 20, 2026 at 2:00 PM

Happy Hacking!
PES ACM Student Chapter`,
  },

  // ==========================================
  // WORKSHOP 1: AWS DevOps Bootcamp (m1)
  // ==========================================
  {
    id: "pes-email-aws-001",
    subject: "Technical Workshop: AWS Cloud Architecture & Kubernetes DevOps Bootcamp",
    sender: "workshops@pes.edu",
    receivedAt: "2026-07-25T10:00:00Z",
    tag: "m1 (Workshop)",
    mailIndex: 1,
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
Registration Closes: July 28, 2026 at 8:00 PM

Regards,
Department of CSE, PES University`,
  },

  // ==========================================
  // NOTICE 1: Placement Season Guidelines (m1)
  // ==========================================
  {
    id: "pes-email-notice-001",
    subject: "Important Notice: Placement Season 2026 Code of Conduct & Upgrade Policies",
    sender: "placement.dean@pes.edu",
    receivedAt: "2026-07-20T08:00:00Z",
    tag: "m1 (Notice)",
    mailIndex: 1,
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


