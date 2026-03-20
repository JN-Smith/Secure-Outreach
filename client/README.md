# Church Outreach Management System

A role-based outreach tracking and analytics platform designed to help churches manage evangelism efforts, track spiritual growth, and make informed, data-driven decisions.

---

## Overview

This system provides a structured way to capture outreach interactions, monitor follow-ups, and analyze ministry impact. It is built with a clear separation of responsibilities, ensuring that each user interacts with the system in a way that supports their role.

Evangelists focus on recording and following up with people. Pastors gain a clear overview of ministry activity. Data specialists and administrators extract insights and generate reports that guide strategy.

---

## Roles and Permissions

The system enforces strict role-based access control. Each role has a distinct interface and level of access.

### Evangelist
Evangelists are field users responsible for capturing outreach data.

- Create and manage their own outreach records  
- View a personal dashboard with performance metrics  
- Track follow-ups and engagement  

They do not have access to other users' data or system-wide analytics.

### Pastor
Pastors act as overseers of the ministry.

- View all outreach data in a read-only format  
- Monitor trends, engagement, and follow-up needs  
- Observe team activity and ministry health  

They do not modify records or access system-level controls.

### Admin / Data Specialist
Admins and data specialists are responsible for analysis and reporting.

- Access all outreach data  
- Generate reports and export datasets  
- Analyze trends, conversion rates, and performance  

They have the highest level of access within the system.

---

## System Architecture

The application follows a modern full-stack architecture with a clear separation between frontend, backend, and data storage.

### Backend
The backend is built using FastAPI. It handles authentication, authorization, business logic, and API endpoints. It also ensures data validation and enforces role-based access control.

### Frontend
The frontend is built using React with TypeScript. It provides a responsive, role-aware user interface with dynamic dashboards, form handling, and data visualization.

### Database
The system uses PostgreSQL as the primary database. It stores users, roles, outreach records, follow-up data, and activity logs.

### Communication
The frontend and backend communicate through RESTful APIs using JSON for data exchange.

---

## Core Features

### Outreach Data Capture
Evangelists can record structured outreach information including personal details, spiritual status, location, and follow-up information. Each record is linked to the user who created it and includes a timestamp.

### Role-Based Dashboards
Each role has a tailored dashboard experience.

The Evangelist dashboard focuses on personal activity and follow-ups.  
The Pastor dashboard provides a high-level view of ministry performance.  
The Admin dashboard enables deep analysis and reporting.

### Spiritual Pipeline Tracking
The system tracks progress across key stages of outreach:

Talked → Saved → Discipled → Connected to Church

This allows the church to move beyond activity tracking into meaningful growth measurement.

### Search and Filtering
Users can filter and search data based on location, status, evangelist, and date range, depending on their access level.

### Data Export
Admins can export data in CSV, Excel, or PDF formats for reporting and external analysis.

### Authentication and Security
The system includes secure authentication, persistent login, and strict role-based access control. Consent handling is included for all stored contact information.

---

## Minimum Viable Product (MVP)

The MVP focuses on delivering a simple, reliable system that allows evangelists to record outreach data and enables leadership to view basic ministry impact. The goal is usability, clarity, and real-world testing rather than feature completeness.

---

### Core Features (Must-Have)

#### Authentication and Access Control
The system uses controlled account creation to ensure data integrity and prevent misuse.

- Admin creates user accounts  
- Evangelists receive a secure link to set their password  
- Secure login functionality  
- Each user is uniquely identified and linked to their data  

---

#### Outreach Data Entry (Core Feature)
This is the central function of the system. Evangelists must be able to quickly and reliably record outreach interactions.

Each record includes:

- Name  
- Contact (with consent confirmation)  
- Saved status (Saved / Not Saved / Unsure)  
- Location  
- Student status (Yes / No)  
- Follow-up status  
- Notes  
- Timestamp (automatically generated)  
- Evangelist ID (automatically linked)  

---

#### Evangelist Dashboard
A simple personal dashboard that provides immediate feedback and motivation.

- Total people talked to  
- Breakdown of saved, not saved, and unsure  
- List of recorded outreach entries  

---

#### Pastor Dashboard (Overview)
A high-level view of outreach activity across the ministry.

- Total people reached  
- Total number of people saved  
- Total follow-ups pending  

---

#### Data Storage
Reliable and structured data storage is essential.

- PostgreSQL database  
- Each record is linked to:
  - A specific user (evangelist)  
  - A timestamp (date and time)  

---

#### Basic Filtering
Basic filtering is required for usability and quick data access.

- Filter records by saved status (Saved / Not Saved / Unsure)  
- Filter by evangelist (for administrative or pastoral views)  

---

#### User Interface (Mobile-Friendly)
The system must be simple and accessible for field use.

- Clean and minimal data entry form  
- Simple and readable dashboards  
- Fully responsive design for mobile devices  

---

### Phase 2 (Nice-to-Have Features)

These features enhance the system but are not required for the initial launch.

#### Advanced Dashboards
- Visual charts (line, pie, bar)  
- Trend analysis over time  
- Evangelist performance comparisons  

#### Enhanced Role-Based Experience
- Fully customized interfaces per role  
- Improved navigation and layout  

#### Follow-Up System
- Reminders and notifications  
- Scheduling follow-ups  

#### Data Export
- Export data as CSV, Excel, or PDF  

#### Tagging and Categorization
- Labels such as Student, New Believer, etc.  

#### Advanced Filtering
- Date range filtering  
- Location-based filtering  

---

### MVP Goal

The MVP is successful if:

- Evangelists can easily record outreach data  
- Leadership can view basic outreach metrics  
- Data is stored reliably and can be reviewed over time  

The focus is on enabling real-world usage, collecting feedback, and improving the system iteratively.

---

## Tech Stack

- Backend: FastAPI (Python)  
- Frontend: React with TypeScript  
- Database: PostgreSQL  
- API: RESTful services  
- Deployment: AWS lightsail  

---