# 🎓 Northstar Academy — Complete Coaching Class Management System

**Northstar Academy** is an enterprise-grade, full-stack coaching institute and academic management web application. Engineered with modern vanilla web standards, it delivers a lightning-fast Single Page Application (SPA) experience powered by a resilient Node.js backend with **zero external framework overhead**.

It offers **Multi-Role Authentication (Admin, Faculty, Student)**, **Role-Based Access Control (RBAC)**, **Fee Payment Reminders via WhatsApp & SMS**, **Printable Digital Receipts**, **Round Photo Enrollment**, **Interactive Batch Schedules**, **Daily Roll-Call Attendance**, **Hall of Fame Testimonials**, and a **Campus Photo Gallery with Lightbox**.

All operational data persists in `data/store.json` across server restarts.

---

## 📑 Table of Contents

1. [🚀 Quick Start & Installation](#-quick-start--installation)
2. [🔐 Multi-Role Authentication & Demo Accounts](#-multi-role-authentication--demo-accounts)
3. [🧭 Navigation & RBAC Visibility Matrix](#-navigation--rbac-visibility-matrix)
4. [👨‍🎓 Complete Student Directory (All 20 Records)](#-complete-student-directory-all-20-records)
5. [👩‍🏫 Complete Academic Faculty Directory](#-complete-academic-faculty-directory)
6. [📅 Complete Batch Schedule & Timetable](#-complete-batch-schedule--timetable)
7. [💡 Core Modules & Feature Walkthrough](#-core-modules--feature-walkthrough)
   - [Fee Reminders via WhatsApp & SMS](#1-fee-reminders-via-whatsapp--sms)
   - [Round Photo Display & Enrollment](#2-round-photo-display--enrollment)
   - [Teacher Faculty Hub](#3-teacher-faculty-hub)
   - [Student Personal Portal](#4-student-personal-portal)
   - [Daily Attendance Roll-Call](#5-daily-attendance-roll-call)
   - [Official Digital Receipts](#6-official-digital-receipts)
   - [Testimonials & Success Stories](#7-testimonials--success-stories)
   - [Photo Gallery & Lightbox Tour](#8-photo-gallery--lightbox-tour)
8. [🛠 Complete REST API Documentation](#-complete-rest-api-documentation)
9. [📂 Project Architecture & File Structure](#-project-architecture--file-structure)
10. [🎨 Design System, Theming & Keyboard Shortcuts](#-design-system-theming--keyboard-shortcuts)

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js 20.x or later** installed ([https://nodejs.org/](https://nodejs.org/)).
- Modern web browser (Chrome, Edge, Firefox, Safari).

### Running the Application
1. Open a terminal in the root project folder:
   ```bash
   cd "Coaching Class Demo"
   ```
2. Start the application:
   ```bash
   npm start
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

*(To run on a custom port, set the environment variable: `PORT=4000 npm start`)*

---

## 🔐 Multi-Role Authentication & Demo Accounts

Click the **"Switch / Login"** button on the top-right header to switch roles at any time. The modal includes 1-click quick login chips:

| Role | Username / Login Name | Password | Dedicated View & Key Permissions |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin` *(or Alex Morgan)* | `admin123` | **Full Portal Access**: All 9 workspaces, financial ledgers, revenue stats, student enrollment, fee reminder dispatch, teacher hiring, and photo management. |
| **👩‍🏫 Teacher** | `Dr. Priya Menon`<br>`Rahul Desai`<br>`Nisha Rao` | `teacher123` | **Academic Management**: My Faculty Hub, Classes & Timetable, Mark Attendance, and Students Roster. *(Financial revenue stats and faculty hiring are hidden).* |
| **🎓 Student** | `Riya Sharma`<br>`Arjun Patel`<br>`Meera Nair` | `student123` | **Personal Learning Portal**: My Student Portal (Profile card with school, class, residential address, guardian contact, fee dues, verified printable receipts), My Timetable, and My Attendance. *(Peer records and admin books are hidden).* |

---

## 🧭 Navigation & RBAC Visibility Matrix

The sidebar dynamically adjusts based on the active role's security clearance:

| Navigation Item | 👑 Admin | 👩‍🏫 Teacher | 🎓 Student | Description |
| :--- | :---: | :---: | :---: | :--- |
| **Overview (Dashboard)** | ✅ **Visible** | ❌ *Hidden* | ❌ *Hidden* | Executive revenue KPIs, fee charts, and daily session timeline. |
| **Students Roster** | ✅ **Full CRUD** | ✅ **View & Remind** | ❌ *Hidden* | 10-column table with contact and fee records. Peer data hidden for students. |
| **Teachers & Faculty** | ✅ **Visible** | ❌ *Hidden* | ❌ *Hidden* | Faculty directory, hiring, and qualification management. |
| **Classes & Timetable** | ✅ **Full CRUD** | ✅ **View Timetable** | ✅ **My Timetable** | Weekly schedule of lectures, rooms, faculty, and live status. |
| **Daily Attendance** | ✅ **Mark & Save** | ✅ **Mark Attendance** | ✅ **My Attendance** | Roll-call register; students view personal attendance rates. |
| **Fees & Ledger** | ✅ **Full Books** | ❌ *Hidden* | ❌ *Hidden* | Complete accounts, payment transactions, and ledger export. |
| **Reports & Analytics** | ✅ **Visible** | ❌ *Hidden* | ❌ *Hidden* | Subject revenue breakdown and payment method metrics. |
| **My Faculty Hub** | ✅ *(Preview)* | ✅ **Primary Home** | ❌ *Hidden* | Teacher dashboard with assigned batches and quick roll-call. |
| **My Student Portal** | ✅ *(Preview)* | ❌ *Hidden* | ✅ **Primary Home** | Student dashboard with school, address, dues, and verified receipts. |
| **Testimonials** | ✅ **Visible** | ✅ **Visible** | ✅ **Visible** | Hall of Fame ranker stories and parent feedback. |
| **Photo Gallery** | ✅ **Visible** | ✅ **Visible** | ✅ **Visible** | High-definition campus photo tour with interactive lightbox. |

---

## 👨‍🎓 Complete Student Directory (All 20 Records)

Every record is pre-populated with realistic details matching premier Indian schools, full residential addresses, student contact numbers, and guardian details:

| # | Student & Class | School Name | Course & Batch | Student Phone | Guardian Name & Contact | Residential Address | Next Due | Balance | Status |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| 1 | **Riya Sharma** *(Class 12)* | Delhi Public School (DPS), R.K. Puram | Mathematics · Grade 12 | +91 98201 12345 | Suresh Sharma (+91 98201 54321) | B-402, Oberoi Splendor, JVLR, Andheri East, Mumbai | Oct 05, 2026 | **₹4,500** | <span style="color:#ef4444">Overdue</span> |
| 2 | **Arjun Patel** *(Class 12)* | Bombay Scottish School, Mahim | Physics · Grade 12 | +91 98202 23456 | Kishore Patel (+91 98202 65432) | 701 Lake Homes, Phase 2, Powai, Mumbai | Oct 12, 2026 | **₹3,000** | <span style="color:#f59e0b">Partial</span> |
| 3 | **Meera Nair** *(Class 11)* | St. Xavier's High School, Fort | Chemistry · Grade 11 | +91 98203 34567 | Gopal Nair (+91 98203 76543) | Flat 12, Palm Beach Residency, Nerul, Navi Mumbai | Oct 14, 2026 | **₹4,500** | <span style="color:#f59e0b">Partial</span> |
| 4 | **Kabir Khan** *(Class 10)* | The Cathedral & John Connon School | Mathematics · Grade 10 | +91 98204 45678 | Tariq Khan (+91 98204 87654) | 24 Crescent Tower, Lokhandwala, Andheri West, Mumbai | Oct 16, 2026 | **₹0** | <span style="color:#10b981">Paid</span> |
| 5 | **Anaya Iyer** *(Class 11)* | Podar International School, Powai | Physics · Grade 11 | +91 98205 56789 | Venkat Iyer (+91 98205 98765) | C-304, Hiranandani Gardens, Powai, Mumbai | Oct 18, 2026 | **₹0** | <span style="color:#10b981">Paid</span> |
| 6 | **Dev Malhotra** *(Class 12)* | Dhirubhai Ambani International School | Chemistry · Grade 12 | +91 98206 67890 | Rajiv Malhotra (+91 98206 09876) | 15 Silver Oak Enclave, Chembur East, Mumbai | Oct 19, 2026 | **₹6,000** | <span style="color:#f59e0b">Partial</span> |
| 7 | **Sana Qureshi** *(Class 11)* | Ryan International School, Kandivali | Mathematics · Grade 11 | +91 98207 78901 | Farhan Qureshi (+91 98207 10987) | 502 Hill View Apts, Bandra West, Mumbai | Oct 20, 2026 | **₹0** | <span style="color:#10b981">Paid</span> |
| 8 | **Ishaan Das** *(Class 10)* | Army Public School, Colaba | Physics · Grade 10 | +91 98208 89012 | Bikash Das (+91 98208 21098) | 10B Sea Green CHS, Sector 17, Vashi, Navi Mumbai | Oct 22, 2026 | **₹5,000** | <span style="color:#ef4444">Overdue</span> |
| 9 | **Tanvi Deshmukh** *(Class 12 NEET)* | Kendriya Vidyalaya, IIT Powai | Biology · Grade 12 (NEET) | +91 98209 90123 | Ashok Deshmukh (+91 98209 32109) | Flat 804, Regency Park, Ghodbunder Rd, Thane West | Oct 24, 2026 | **₹4,000** | <span style="color:#f59e0b">Partial</span> |
| 10 | **Rohan Joshi** *(Class 12)* | Smt. Sulochanadevi Singhania School | Computer Science · Grade 12 | +91 98210 01234 | Manish Joshi (+91 98210 43210) | 12/A Gokuldham Complex, Goregaon East, Mumbai | Oct 25, 2026 | **₹0** | <span style="color:#10b981">Paid</span> |
| 11 | **Aditya Roy** *(Class 11 JEE)* | Delhi Public School (DPS), R.K. Puram | Mathematics · Grade 11 (JEE) | +91 98211 12345 | Subhash Roy (+91 98211 54321) | 303 Whispering Palms, Lokhandwala Twp, Kandivali East | Oct 04, 2026 | **₹7,500** | <span style="color:#ef4444">Overdue</span> |
| 12 | **Pooja Hegde** *(Class 10)* | Bombay Scottish School, Mahim | English · Grade 10 | +91 98212 23456 | Shankar Hegde (+91 98212 65432) | 45 Riverdale Residency, IC Colony, Borivali West, Mumbai | Oct 26, 2026 | **₹0** | <span style="color:#10b981">Paid</span> |
| 13 | **Siddharth Sen** *(Class 11)* | St. Xavier's High School, Fort | Physics · Grade 11 | +91 98213 34567 | Pranab Sen (+91 98213 76543) | Flat 201, Green Acres, LBS Marg, Mulund West, Mumbai | Oct 27, 2026 | **₹3,500** | <span style="color:#f59e0b">Partial</span> |
| 14 | **Kriti Verma** *(Class 12)* | The Cathedral & John Connon School | Chemistry · Grade 12 | +91 98214 45678 | Hemant Verma (+91 98214 87654) | 802 Maple Heights, Tagore Nagar, Vikhroli East, Mumbai | Oct 28, 2026 | **₹0** | <span style="color:#10b981">Paid</span> |
| 15 | **Varun Kulkarni** *(Class 12 Commerce)* | Podar International School, Powai | Economics & Commerce · Grade 12 | +91 98215 56789 | Nitin Kulkarni (+91 98215 98765) | 22 Mayur Colony, Near Ideal Colony, Kothrud, Pune | Oct 29, 2026 | **₹5,000** | <span style="color:#f59e0b">Partial</span> |
| 16 | **Natasha Mehta** *(Class 11 NEET)* | Dhirubhai Ambani International School | Biology · Grade 11 (NEET) | +91 98216 67890 | Deepak Mehta (+91 98216 09876) | 601 Royal Oasis, Jankalyan Nagar, Malad West, Mumbai | Oct 06, 2026 | **₹6,000** | <span style="color:#ef4444">Overdue</span> |
| 17 | **Yash Singhania** *(Class 10)* | Ryan International School, Kandivali | Mathematics · Grade 10 | +91 98217 78901 | Ajay Singhania (+91 98217 10987) | 14 Sterling Towers, Worli Sea Face, Mumbai | Oct 30, 2026 | **₹0** | <span style="color:#10b981">Paid</span> |
| 18 | **Diya Bannerjee** *(Class 12 JEE)* | Army Public School, Colaba | Physics · Grade 12 (JEE) | +91 98218 89012 | Alok Bannerjee (+91 98218 21098) | B-503, Raheja Vistas, Chandivali, Andheri East, Mumbai | Oct 31, 2026 | **₹4,500** | <span style="color:#f59e0b">Partial</span> |
| 19 | **Aman Kapoor** *(Class 12 Commerce)* | Kendriya Vidyalaya, IIT Powai | Accounts & Taxation · Grade 12 | +91 98219 90123 | Raman Kapoor (+91 98219 32109) | 102 Sunrise Enclave, Juhu Tara Road, Juhu, Mumbai | Nov 02, 2026 | **₹0** | <span style="color:#10b981">Paid</span> |
| 20 | **Sneha Pillai** *(Class 11)* | Smt. Sulochanadevi Singhania School | Chemistry · Grade 11 | +91 98220 01234 | Madhavan Pillai (+91 98220 43210) | Flat 405, Sea Breeze Apts, Sector 20, Kharghar, Navi Mumbai | Oct 02, 2026 | **₹3,800** | <span style="color:#ef4444">Overdue</span> |

---

## 👩‍🏫 Complete Academic Faculty Directory

Every instructor profile features verified credentials, contact details, subject specializations, and daily schedules:

| # | Faculty Name | Qualifications | Primary Subjects | Contact Phone | Official Email | Schedule Availability |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Dr. Priya Menon** | M.Sc. Mathematics, B.Ed. | Mathematics, Calculus, Algebra | +91 90000 00001 | priya.menon@northstar.edu | Mon–Sat · 9:00 am–6:00 pm |
| 2 | **Rahul Desai** | M.Sc. Physics, IIT Bombay | Physics, Mechanics, Optics | +91 90000 00002 | rahul.desai@northstar.edu | Mon–Sat · 10:00 am–6:00 pm |
| 3 | **Nisha Rao** | M.Sc. Chemistry, CSIR-NET | Chemistry, Organic, Inorganic | +91 90000 00003 | nisha.rao@northstar.edu | Mon–Fri · 9:00 am–5:00 pm |
| 4 | **Aditi Shah** | M.A. English, B.Ed. | English Literature, Writing | +91 90000 00004 | aditi.shah@northstar.edu | Tue–Sat · 11:00 am–7:00 pm |
| 5 | **Vikram Sen** | Ph.D. Computer Science | Python, Algorithms, Data Structures | +91 90000 00005 | vikram.sen@northstar.edu | Mon–Wed–Fri · 2:00 pm–8:00 pm |
| 6 | **Dr. Arvind Swamy** | MBBS, M.D., AIIMS | Biology, Botany, Zoology (NEET) | +91 90000 00006 | arvind.swamy@northstar.edu | Mon–Sat · 8:00 am–4:00 pm |
| 7 | **Kavita Nambiar** | M.Com, CA Inter | Accounts, Taxation, Commerce | +91 90000 00007 | kavita.nambiar@northstar.edu | Mon–Fri · 10:00 am–6:00 pm |
| 8 | **Rajesh Bhardwaj** | M.Sc. Applied Mathematics | Statistics, Probability, Calculus | +91 90000 00008 | rajesh.bhardwaj@northstar.edu | Tue–Sat · 1:00 pm–8:00 pm |
| 9 | **Sunita Kulkarni** | M.Sc. Organic Chemistry | Physical & Inorganic Chemistry | +91 90000 00009 | sunita.kulkarni@northstar.edu | Mon–Thu · 9:00 am–4:00 pm |
| 10 | **Manish Tiwari** | M.Tech, IIT Kharagpur | Physics, Electrodynamics | +91 90000 00010 | manish.tiwari@northstar.edu | Wed–Sun · 11:00 am–7:00 pm |
| 11 | **Pooja Hegde** | M.A. Economics, NET | Micro & Macro Economics | +91 90000 00011 | pooja.hegde@northstar.edu | Mon–Fri · 9:30 am–5:30 pm |
| 12 | **Deepak Verma** | B.Tech, M.Tech CSE | C++, Java, Database Design | +91 90000 00012 | deepak.verma@northstar.edu | Tue–Sat · 2:00 pm–8:00 pm |
| 13 | **Anjali Saxena** | M.Sc. Biotechnology | Genetics, Cell Biology, NEET | +91 90000 00013 | anjali.saxena@northstar.edu | Mon–Sat · 8:30 am–4:30 pm |
| 14 | **Suresh Pillai** | M.Sc. Physics, GATE | Modern Physics, Thermodynamics | +91 90000 00014 | suresh.pillai@northstar.edu | Mon–Fri · 10:00 am–6:00 pm |
| 15 | **Geeta Iyer** | M.Sc. Pure Mathematics | Coordinate Geometry, Vectors | +91 90000 00015 | geeta.iyer@northstar.edu | Tue–Sat · 9:00 am–5:00 pm |
| 16 | **Harish Mehta** | M.Com, MBA Finance | Business Studies, Commercial Law | +91 90000 00016 | harish.mehta@northstar.edu | Mon–Fri · 11:00 am–7:00 pm |
| 17 | **Ritu Sen** | M.A. English Linguistics | Verbal Ability, IELTS & TOEFL | +91 90000 00017 | ritu.sen@northstar.edu | Mon–Wed–Fri · 10:00 am–5:00 pm |
| 18 | **Alok Bannerjee** | M.Sc. Chemistry, NET | Environmental & Polymer Chemistry | +91 90000 00018 | alok.bannerjee@northstar.edu | Tue–Sat · 9:00 am–4:00 pm |
| 19 | **Farhan Qureshi** | M.Sc. Zoology, B.Ed. | Animal Physiology, Genetics | +91 90000 00019 | farhan.qureshi@northstar.edu | Mon–Sat · 8:00 am–3:00 pm |
| 20 | **Meenakshi Sundaram** | M.Sc. Mathematics | Discrete Math, Trigonometry | +91 90000 00020 | meenakshi.s@northstar.edu | Mon–Fri · 10:00 am–6:00 pm |

---

## 📅 Complete Batch Schedule & Timetable

| ID | Class / Batch Name | Course / Grade | Faculty | Schedule Time | Classroom Location | Days | Enrolled |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :-: |
| `cls-1` | **Advanced Mathematics** | Grade 12 | Priya Menon | 09:00 - 10:30 | Room 02 (Main Wing) | Mon, Wed, Fri, Sat | 18 |
| `cls-2` | **Physics — Mechanics & Optics** | Grade 12 | Rahul Desai | 11:30 - 13:00 | Room 01 (Lab Hall) | Mon, Tue, Thu, Sat | 24 |
| `cls-3` | **Chemistry — Organic Fundamentals** | Grade 11 | Nisha Rao | 14:00 - 15:30 | Room 03 (Chemistry Lab) | Tue, Thu, Sat *(LIVE)* | 16 |
| `cls-4` | **English — Literature & Writing** | Grade 10 | Aditi Shah | 16:00 - 17:15 | Room 04 (Seminar Room) | Wed, Fri, Sat | 12 |
| `cls-5` | **Foundations Mathematics** | Grade 10 | Priya Menon | 17:30 - 19:00 | Room 02 (Main Wing) | Mon, Wed, Sat | 20 |
| `cls-6` | **Python & Logic Building** | Grade 11 & 12 | Vikram Sen | 19:15 - 20:30 | Computer Lab 01 | Mon, Wed, Fri | 15 |
| `cls-7` | **NEET Medical Biology Masterclass** | Grade 12 (NEET) | Dr. Arvind Swamy | 07:30 - 09:00 | Room 05 (Biology Wing) | Mon, Tue, Thu, Fri | 22 |
| `cls-8` | **Commerce Accounts & Bookkeeping** | Grade 11 & 12 | Kavita Nambiar | 10:45 - 12:15 | Room 04 (Seminar Room) | Tue, Thu, Sat | 14 |
| `cls-9` | **JEE Advanced Math Problem Solving** | Grade 12 (JEE) | Rajesh Bhardwaj | 14:30 - 16:00 | Room 02 (Main Wing) | Mon, Wed, Fri | 19 |
| `cls-10`| **Inorganic Chemistry Crash Course** | Grade 12 | Sunita Kulkarni | 16:15 - 17:45 | Room 03 (Chemistry Lab) | Tue, Thu, Fri | 17 |
| `cls-11`| **Electromagnetism & Wave Theory** | Grade 12 (JEE) | Manish Tiwari | 08:30 - 10:00 | Room 01 (Lab Hall) | Mon, Wed, Fri | 21 |
| `cls-12`| **Microeconomics & Market Analysis** | Grade 12 | Pooja Hegde | 11:00 - 12:30 | Room 04 (Seminar Room) | Mon, Wed, Thu | 13 |
| `cls-13`| **Data Structures & Java Coding** | Grade 12 | Deepak Verma | 17:00 - 18:30 | Computer Lab 01 | Tue, Thu, Sat | 16 |
| `cls-14`| **Genetics & Molecular Biology** | Grade 11 (NEET) | Anjali Saxena | 09:15 - 10:45 | Room 05 (Biology Wing) | Tue, Thu, Sat | 18 |
| `cls-15`| **Thermodynamics & Heat Transfer** | Grade 11 | Suresh Pillai | 13:00 - 14:30 | Room 01 (Lab Hall) | Mon, Wed, Fri | 15 |
| `cls-16`| **Coordinate Geometry & Vectors** | Grade 11 (JEE) | Geeta Iyer | 15:00 - 16:30 | Room 02 (Main Wing) | Tue, Thu, Sat | 20 |
| `cls-17`| **Business Studies & Management** | Grade 12 | Harish Mehta | 10:00 - 11:30 | Room 04 (Seminar Room) | Mon, Wed, Fri | 12 |
| `cls-18`| **Grammar, Vocabulary & Comprehension** | Grade 10 | Ritu Sen | 16:45 - 18:00 | Room 04 (Seminar Room) | Mon, Wed, Fri | 14 |
| `cls-19`| **Physical Chemistry Numericals** | Grade 11 & 12 | Alok Bannerjee | 18:15 - 19:45 | Room 03 (Chemistry Lab) | Tue, Thu, Sat | 16 |
| `cls-20`| **Human Physiology & Health Sciences** | Grade 12 (NEET) | Farhan Qureshi | 07:45 - 09:15 | Room 05 (Biology Wing) | Mon, Wed, Fri | 23 |

---

## 💡 Core Modules & Feature Walkthrough

### 1. Fee Reminders via WhatsApp & SMS
- **Personalized WhatsApp Message**: Clicking the **"💬 Remind"** button opens a modal pre-filled with the student's name, enrolled course, balance due, and next payment date.
- **Direct Dispatch Link**: Uses `https://wa.me/<phone>?text=<encoded_msg>` for 1-click WhatsApp web/mobile integration.
- **Direct SMS Link**: Generates a standard `sms:<phone>?body=<encoded_msg>` mobile link.
- **Automated Logging**: Every dispatch automatically records the `lastRemindedAt` timestamp and pushes an audit notification.
- **Batch Reminder Broadcasting**: The **"⚡ Send Broadcast to All"** tool in the batch modal iterates over all students with overdue or partial balances in a single action.

### 2. Round Photo Display & Enrollment
- **Live Preview Circle**: Students and teachers feature a `border-radius: 50%` portrait preview.
- **Offscreen Canvas Compression**: Images uploaded via `<input type="file">` are automatically rendered to an offscreen 220×220 `<canvas>` and converted to JPEG Data URLs, keeping payloads lightweight (15–25 KB).
- **Preset Randomizer**: Single-click preset buttons generate high-quality portrait photos from curated lists.
- **Dynamic Initials Fallback**: When no photo is provided, colored circular avatars render initial monogram letters (e.g., "RS", "AP").

### 3. Teacher Faculty Hub (`teacher-portal`)
- Accessible immediately when logging in as an instructor (e.g., `Dr. Priya Menon`).
- Displays personal faculty qualifications, assigned subjects, and schedule availability.
- **Assigned Batches List**: Highlights active lecture batches with student counts and a direct **"Mark Attendance"** button.
- **Enrolled Student Roster**: Shows students taking the instructor's subjects with quick phone links.

### 4. Student Personal Portal (`student-portal`)
- Accessible immediately when logging in as a student (e.g., `Riya Sharma`).
- **Student Profile Card**: Displays circular avatar, full name, class badge, enrolled school name (*e.g., DPS R.K. Puram*), residential address, phone, and guardian details.
- **Financial Status Overview**: Current fee balance due, installment due date, and total paid to date.
- **Digital Receipt Vault**: Complete list of verified past payments with 1-click printable receipt viewer.

### 5. Daily Attendance Roll-Call
- **Class & Date Filtering**: Pick any batch and date (defaults to current date).
- **Color-Coded Status Pills**: Quick toggles for **Present** (Green), **Late** (Amber), and **Absent** (Red).
- **One-Click Batch Actions**: "Mark All Present" instantly sets all students to present.
- **Absentee SMS Alerts**: Generates preview notifications for parents of absent students.

### 6. Official Digital Receipts
- Branded academic crest receipt modal showing academy address, receipt number, date, student details, course, payment mode (*UPI, Cash, Bank Transfer*), and collector signature.
- **Official Stamp**: Green verified "PAID IN FULL" circular stamp.
- **Print / PDF Export**: Triggered via `window.print()` with a print-optimized layout.

### 7. Testimonials & Success Stories (`#testimonialsView`)
- Displays 13 verified testimonials from top national rankers (AIR 142 IIT Bombay, AIR 289 AIIMS New Delhi, 99.4% CBSE Board) and parents.
- Filter by category (*All, IIT-JEE, NEET, Boards, Parents*).
- **"Write a Testimonial" Modal**: Interactive submission modal supporting 5-star ratings, role selection, institution, and quotation.

### 8. Photo Gallery & Lightbox Tour (`#galleryView`)
- 16 high-definition photos showcasing smart classrooms, chemistry labs, CBT test centers, trophy ceremonies, and green lounges.
- **Interactive Lightbox**: Click any photo to expand into an edge-to-edge dark modal displaying full metadata, category tags, and captions.
- **"Upload Photo" Modal**: Add local image files or external image URLs to the gallery.

---

## 🛠 Complete REST API Documentation

### 1. Authentication
#### `POST /api/auth/login`
Authenticate admin, teacher, or student.
- **Request Body**:
  ```json
  {
    "role": "student",
    "username": "Riya Sharma",
    "password": "student123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "ok": true,
    "user": {
      "role": "student",
      "id": "stu-1001",
      "name": "Riya Sharma",
      "class": "Class 12",
      "school": "Delhi Public School (DPS), R.K. Puram",
      "phone": "+91 98201 12345",
      "address": "B-402, Oberoi Splendor, JVLR, Andheri East, Mumbai",
      "amount": 4500,
      "status": "Overdue"
    }
  }
  ```

---

### 2. Students API
#### `GET /api/students`
Returns an array of all 20 student objects.

#### `POST /api/students`
Enroll a new student.
- **Request Body**:
  ```json
  {
    "name": "Kunal Deshmukh",
    "class": "Class 12",
    "school": "Cathedral & John Connon School",
    "course": "Mathematics · Grade 12",
    "due": "Nov 15, 2026",
    "phone": "+91 98230 11223",
    "email": "kunal.d@example.com",
    "address": "Flat 101, Sea View Towers, Worli, Mumbai",
    "parentName": "Anand Deshmukh",
    "parentPhone": "+91 98230 44556",
    "amount": 5000,
    "totalFee": 45000,
    "avatar": "data:image/jpeg;base64,..."
  }
  ```

#### `PUT /api/students/:id`
Update an existing student's profile, contact, or fee balance.

#### `DELETE /api/students/:id`
Remove a student record from the persistent database.

---

### 3. Fee Reminders API
#### `POST /api/reminders`
Log an individual fee reminder.
- **Request Body**:
  ```json
  {
    "studentId": "stu-1001",
    "phone": "+91 98201 12345",
    "method": "whatsapp",
    "message": "Dear Riya Sharma, reminder from Northstar Academy for fee balance ₹4,500."
  }
  ```

#### `POST /api/reminders/batch`
Send batch payment reminders to all students with outstanding balances.
- **Response `200 OK`**:
  ```json
  {
    "ok": true,
    "count": 11
  }
  ```

---

### 4. Testimonials API
#### `GET /api/testimonials`
Returns all verified testimonials.

#### `POST /api/testimonials`
Publish a new testimonial.
- **Request Body**:
  ```json
  {
    "name": "Aryan Kulkarni",
    "role": "Student",
    "achievement": "AIR 142 · IIT Bombay (CSE)",
    "school": "DPS R.K. Puram",
    "category": "iit-jee",
    "rating": 5,
    "quote": "Exceptional coaching and doubt support!"
  }
  ```

---

### 5. Photo Gallery API
#### `GET /api/gallery`
Returns all campus gallery photos.

#### `POST /api/gallery`
Upload a new photo with caption.
- **Request Body**:
  ```json
  {
    "title": "Robotics & STEM Lab",
    "category": "labs",
    "categoryLabel": "Science Labs",
    "image": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
    "caption": "Weekend robotics workshop for Grade 11 students."
  }
  ```

---

## 📂 Project Architecture & File Structure

```
Coaching Class Demo/
├── data/
│   └── store.json          # Persistent JSON datastore (students, teachers, classes, fees, testimonials, gallery)
├── index.html              # Core HTML5 layout, RBAC sidebars, modal dialogues, and views
├── style.css               # Comprehensive design system, dark mode tokens, typography, and animations
├── app.js                  # Frontend SPA controller, RBAC routing, event bindings, and Canvas compression
├── server.js               # Node.js REST API server, static file router, 10MB JSON body reader
├── package.json            # Node.js project manifest and start scripts
└── README.md               # Complete documentation and user manual
```

---

## 🎨 Design System, Theming & Keyboard Shortcuts

- **Color Palette**:
  - Primary: Indigo `#4f46e5` / `#6366f1`
  - Success: Emerald `#10b981`
  - Warning / Partial: Amber `#f59e0b`
  - Danger / Overdue: Rose `#ef4444`
  - Dark Theme: Deep obsidian slate `#0b0f19` and `#111827`
- **Typography**: Google Fonts (*DM Sans* and *Manrope*).
- **Keyboard Shortcuts**:
  - `/` (Forward Slash): Focuses the global universal search box immediately.
  - `Escape`: Closes any open modal dialog or slide-out drawer.

---

## 📜 License & Copyright

Designed and developed for **Northstar Academy Coaching Management System**.  
Licensed for institutional and commercial demonstration use.
