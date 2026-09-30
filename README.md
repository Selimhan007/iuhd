# Student Hub TM

Student TM — Turkmenistan Student SuperApp

Build a modern, production-ready university student platform called Student TM.

1. Product concept

Student TM is a digital platform for university students in Turkmenistan.

The goal is to bring the most important student services into one application:

* Schedule
* Grades
* Attendance
* Assignments
* Exams
* Courses
* Study materials
* University announcements
* Events
* Student profile
* Notifications
* University information

The application must initially work perfectly for one university and one student group, but the architecture must be designed so that it can later support many universities, faculties, groups and thousands of students.

The interface language should support:

* Turkmen
* Russian
* English

Default language: Turkmen.

⸻

2. Design style

Create a premium, modern and minimal interface.

Visual direction:

* Clean
* Academic
* Professional
* Modern
* Mobile-first
* Easy to understand
* Suitable for university students

Use:

* White background
* Deep blue primary color
* Light blue secondary accents
* Subtle gray backgrounds
* Rounded cards
* Soft shadows
* Clean typography
* Simple icons
* Smooth animations

Avoid:

* Excessive gradients
* Neon colors
* Overly complicated interfaces
* Too many elements on one screen
* Gaming-style UI

The application should feel like a combination of:

Google Classroom + Notion + modern banking app + university portal.

⸻

3. Main navigation

For mobile use a bottom navigation bar:

1. Home
2. Schedule
3. Courses
4. Tasks
5. Profile

For desktop/tablet use a sidebar.

⸻

4. Authentication

Create a complete authentication system.

Login options:

* Student ID / email
* Password

Include:

* Login
* Register
* Forgot password
* Password reset
* Remember me
* Logout

For the prototype, create demo accounts.

Example:

Student:

Email:
student@student.tm

Password:
student123

Administrator:

Email:
admin@student.tm

Password:
admin123

Teacher:

Email:
teacher@student.tm

Password:
teacher123

⸻

5. Student profile

Create a detailed student profile.

Show:

* Profile photo
* Full name
* Student ID
* University
* Faculty
* Department
* Specialization
* Course/year
* Group
* Email
* Phone

Example student:

Name:
Suleyman Abbaskaramzad

University:
International University for the Humanities and Development

Specialization:
Software

Group:
SOFT-1B

Course:
1

Student ID:
TM-2026-0001

Create an editable profile section.

⸻

6. HOME DASHBOARD

The Home screen is the most important screen.

At the top:

“Good morning, Suleyman 👋”

Then show today’s date.

Create a “Next class” card:

Example:

Programming Fundamentals

09:00 – 10:30

Room 204

Teacher: A. Ahmedov

Show countdown:

“Starts in 32 minutes”

Then show:

Today’s schedule

List all classes for today.

Each class should display:

* Time
* Subject
* Teacher
* Room
* Status

Statuses:

* Upcoming
* In progress
* Completed
* Cancelled

Then:

Tasks

Show upcoming assignments.

Example:

English for IT

“Prepare presentation”

Due tomorrow

Then:

Announcements

Show the latest university announcements.

Then:

Quick actions

Buttons:

* Schedule
* Grades
* Attendance
* Assignments
* Courses
* Materials

⸻

7. SCHEDULE

Create a complete university timetable.

Views:

* Today
* Week

Each lesson:

Subject
Teacher
Room
Time
Type

Types:

* Lecture
* Seminar
* Laboratory
* Practice

Example:

Monday

09:00 — 10:30
Computer Science
Room 201

10:40 — 12:10
English for IT
Room 305

12:20 — 13:50
Mathematics
Room 108

Allow students to tap a lesson to see details.

Include:

* Teacher
* Room
* Course
* Group
* Notes

Allow administrators to edit schedules.

⸻

8. COURSES

Create a Courses page.

Display course cards:

* Course name
* Teacher
* Credits
* Progress
* Current grade

Example:

English for IT
Teacher: Ch. Vekilova
Credits: 4

Computer Science
Teacher: A. Ahmedov
Credits: 5

Mathematics
Teacher: B. Berdimuhamedov
Credits: 4

When opening a course, show:

Overview

Materials

Assignments

Grades

Attendance

Announcements

⸻

9. ASSIGNMENTS

Create an assignment management system.

Students can see:

* Assignment title
* Course
* Teacher
* Description
* Deadline
* Status

Statuses:

* Not started
* In progress
* Submitted
* Late
* Graded

Assignment details should support:

* Text instructions
* PDF files
* Images
* Documents

Student can upload a submission.

Show:

“Submitted successfully”

Teacher can:

* View submissions
* Grade them
* Add comments

⸻

10. GRADES

Create a modern grade dashboard.

Show:

GPA / Average

Example:

GPA
3.72 / 4.00

Then list subjects.

Example:

English for IT
92 / 100
A

Programming
87 / 100
B+

Mathematics
81 / 100
B

Allow students to see:

* Individual grades
* Midterm
* Final
* Assignments
* Exams
* Total grade

Create a simple progress visualization.

⸻

11. ATTENDANCE

Create attendance tracking.

Show:

Attendance percentage:

92%

Then courses:

English for IT
95%

Programming
90%

Mathematics
88%

Statuses:

Present
Absent
Late
Excused

Students can see their attendance history.

Teachers can mark attendance.

Administrators can view attendance statistics.

⸻

12. EXAMS

Create an exam section.

Show:

Upcoming exams.

Example:

English for IT

June 12
10:00
Room 301

Programming

June 15
09:00
Room 204

Show:

* Subject
* Date
* Time
* Room
* Teacher
* Exam type

Exam types:

* Midterm
* Final
* Quiz

⸻

13. STUDY MATERIALS

Create a digital university library.

Students can access:

* PDF
* DOCX
* PPTX
* Images
* Links
* Video links

Organize materials by course.

Example:

Programming Fundamentals

📄 Lecture 1.pdf

📄 Lecture 2.pdf

📄 Algorithms.pdf

Allow downloading materials.

⸻

14. ANNOUNCEMENTS

Create a university announcement system.

Categories:

* University
* Faculty
* Department
* Group
* Emergency
* Event

Announcement card:

Title
Description
Author
Date
Category

Important announcements should appear at the top.

⸻

15. EVENTS

Create a university events section.

Examples:

English Week

September 25
Main Hall

Programming Workshop

October 2
IT Center

Student Conference

October 15

Students can:

* View event details
* Register
* Add to calendar

⸻

16. NOTIFICATIONS

Create a notification center.

Notifications for:

* New assignment
* Assignment deadline
* Grade published
* Schedule changed
* Exam reminder
* Announcement
* Event
* Attendance warning

Example:

“Your Programming assignment is due tomorrow.”

Allow:

* Mark as read
* Mark all as read

⸻

17. SEARCH

Create global search.

Students should be able to search:

* Courses
* Teachers
* Assignments
* Materials
* Announcements
* Events

Include search suggestions.

⸻

18. ADMIN DASHBOARD

Create a separate admin panel.

Admin can manage:

Students

* Add student
* Edit student
* Delete student
* Assign group
* Assign faculty

Teachers

* Add teacher
* Edit teacher
* Assign courses

Courses

* Create course
* Assign teacher
* Assign group

Schedule

* Create lesson
* Edit lesson
* Delete lesson

Assignments

* Create
* Edit
* Delete

Grades

* Add
* Edit
* Publish

Attendance

* Manage attendance

Announcements

* Create
* Publish
* Delete

Events

* Create
* Manage registrations

⸻

19. TEACHER DASHBOARD

Create a teacher role.

Teachers can:

* See their courses
* See assigned groups
* View students
* Create assignments
* Upload materials
* Grade assignments
* Enter grades
* Mark attendance
* Publish announcements

Teacher dashboard should be simpler than the admin dashboard.

⸻

20. ROLE SYSTEM

Implement role-based access control.

Roles:

Student

Can view own academic information.

Teacher

Can manage assigned courses and students.

Administrator

Can manage the university.

Super Admin

Can manage multiple universities.

Architecture should support multiple universities in the future.

⸻

21. MULTI-UNIVERSITY ARCHITECTURE

Do NOT hardcode the application to one university.

Create database structure for:

Universities
↓
Faculties
↓
Departments
↓
Programs
↓
Courses
↓
Groups
↓
Students

A student belongs to:

University → Faculty → Program → Group

This allows Student TM to eventually support universities throughout Turkmenistan.

⸻

22. DATABASE

Use Supabase for backend/database/authentication/storage.

Create proper relational tables.

Suggested tables:

users

students

teachers

universities

faculties

departments

programs

groups

courses

course_teachers

student_courses

schedule

assignments

submissions

grades

attendance

exams

materials

announcements

events

event_registrations

notifications

Create proper foreign keys.

Use Row Level Security.

Students must only be able to access their own private academic information.

Teachers can only manage information related to their courses/groups.

Administrators can manage their university.

⸻

23. DEMO DATA

Populate the application with realistic demo data.

University:

International University for the Humanities and Development

Group:

SOFT-1B

Create approximately:

15 students

8 courses

8 teachers

20 schedule entries

15 assignments

50 grades

Attendance records

10 announcements

5 events

10 study materials

Use realistic Turkmen/Russian/English names.

⸻

24. LANGUAGE SYSTEM

Implement i18n.

Languages:

Turkmen
Russian
English

Create a language selector in Settings.

Do not hardcode UI text.

All interface text must come from translation files.

⸻

25. SETTINGS

Create Settings page.

Options:

Profile

Language

Notifications

Dark mode

Security

Change password

About Student TM

Help

Terms of Service

Privacy Policy

Logout

⸻

26. DARK MODE

Implement proper dark mode.

Do not simply invert colors.

Create dedicated dark theme tokens.

The design must remain readable and professional.

⸻

27. RESPONSIVE DESIGN

The application must work perfectly on:

* iPhone
* Android
* Tablet
* Desktop

Mobile-first design.

Do not create a desktop website that simply shrinks on mobile.

⸻

28. PWA

Make Student TM a Progressive Web App.

Requirements:

* Installable
* App icon
* Splash screen
* Offline basic interface
* Cached schedule
* Cached courses
* Cached recent announcements
* Responsive mobile UI

Add:

“Install Student TM”

button.

⸻

29. SECURITY

Implement:

* Supabase authentication
* Role-based permissions
* Row Level Security
* Secure file storage
* Input validation
* Protected admin routes
* Protected teacher routes

Never expose private student information publicly.

⸻

30. UI COMPONENTS

Create reusable components:

StudentCard
CourseCard
ScheduleCard
AssignmentCard
GradeCard
AttendanceCard
AnnouncementCard
EventCard
NotificationItem
TeacherCard
EmptyState
LoadingState
ErrorState
SearchBar
BottomNavigation
Sidebar
Modal
FileUploader

Use reusable components instead of duplicating UI code.

⸻

31. EMPTY STATES

Every section should have a professional empty state.

Example:

“No assignments yet”

“No upcoming exams”

“No announcements”

“No study materials”

Include useful icons and clear text.

⸻

32. LOADING STATES

Use skeleton loaders instead of blank screens.

⸻

33. ERROR HANDLING

Create friendly error messages.

Example:

“Something went wrong. Please try again.”

Do not show technical errors to students.

⸻

34. MOBILE UX

Optimize specifically for mobile.

Use:

* Large touch targets
* Bottom navigation
* Swipe-friendly cards
* Pull-to-refresh where appropriate
* Sticky headers
* Mobile-friendly forms

⸻

35. FUTURE AI FEATURES

Do NOT build complex AI features yet.

Prepare architecture for future features:

AI Study Assistant

Possible future capabilities:

* Explain a topic
* Summarize PDF
* Generate quiz
* Help prepare for exams
* Translate educational material
* Create study plan

For now, create only a placeholder “AI Study Assistant” section marked:

“Coming soon”.

⸻

36. FUTURE FEATURES

Prepare architecture for:

* Digital student ID
* QR student card
* Campus map
* Cafeteria
* Library management
* University payments
* Scholarship information
* Transportation
* Internship opportunities
* Career center
* Student clubs
* Chat
* Push notifications

Do not implement these features yet unless necessary for the MVP.

⸻

37. IMPORTANT PRODUCT PRINCIPLE

Student TM must NOT feel like a generic dashboard template.

It should feel like a real university product.

Prioritize:

1. Schedule
2. Assignments
3. Grades
4. Attendance
5. Courses
6. Announcements
7. Exams
8. Materials
9. Profile

The most common student actions should require as few taps as possible.

⸻

38. MVP PRIORITY

Build the MVP first.

The first fully functional version must include:

* Authentication
* Student profile
* Home dashboard
* Schedule
* Courses
* Assignments
* Grades
* Attendance
* Exams
* Announcements
* Notifications
* Teacher dashboard
* Admin dashboard
* Supabase database
* Role-based access
* Turkmen/Russian/English
* Responsive design
* PWA

Do not add unnecessary features before these work correctly.

⸻

39. FINAL REQUIREMENT

Before finishing, verify that:

* Student login works
* Teacher login works
* Admin login works
* Student sees only their own data
* Teacher sees assigned courses/groups
* Admin can manage university data
* Schedule works
* Grades work
* Attendance works
* Assignments work
* Materials work
* Announcements work
* Notifications work
* Language switching works
* Dark mode works
* Mobile layout works
* Desktop layout works
* PWA installation works
* Database relationships work
* No major console errors remain

Build the application with clean, scalable and maintainable code.

Start with the complete MVP and use realistic demo data so the application looks like a functioning Student TM product immediately after launch.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://iuhd.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e2e94c37-de72-4c0f-9be9-fdf5dbe1b5a9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
