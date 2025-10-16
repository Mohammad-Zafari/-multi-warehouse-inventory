# Multi-Warehouse Inventory Management System

## Overview
Enhance the existing Multi-Warehouse Inventory Management System built with Next.js and Material-UI (MUI) for GreenSupply Co, a sustainable product distribution company. The current system is functional but needs significant improvements to be production-ready.

## 🎯 Business Context
GreenSupply Co distributes eco-friendly products across multiple warehouse locations throughout North America. They need to efficiently track inventory across warehouses, manage stock movements, monitor inventory values, and prevent stockouts. This system is critical for their daily operations and customer satisfaction.

## 🛠️ Tech Stack
- [Next.js](https://nextjs.org/) - React framework
- [Material-UI (MUI)](https://mui.com/) - UI component library
- [React](https://reactjs.org/) - JavaScript library
- JSON file storage (for this assessment)

## 📋 Current Features (Already Implemented)
The basic system includes:
- ✅ Products management (CRUD operations)
- ✅ Warehouse management (CRUD operations)
- ✅ Stock level tracking per warehouse
- ✅ Basic dashboard with inventory overview
- ✅ Navigation between pages
- ✅ Data persistence using JSON files

**⚠️ Note:** The current UI is intentionally basic. We want to see YOUR design skills and creativity.

---

## 🚀 Your Tasks (Complete ALL 3)

---

## Task 1: Redesign & Enhance the Dashboard

**Objective:** Transform the basic dashboard into a professional, insightful command center for warehouse operations.

### Requirements:

Redesign the dashboard to provide warehouse managers with actionable insights at a glance. Your implementation should include:

- **Modern, professional UI** appropriate for a sustainable/eco-friendly company
- **Key business metrics** (inventory value, stock levels, warehouse counts, etc.)
- **Data visualizations** using a charting library of your choice
- **Enhanced inventory overview** with improved usability
- **Fully responsive design** that works across all device sizes
- **Proper loading states** and error handling

Focus on creating an interface that balances visual appeal with practical functionality for daily warehouse operations.

---

## Task 2: Implement Stock Transfer System

**Objective:** Build a complete stock transfer workflow with proper business logic, validation, and data integrity.

### Requirements:

**A. Stock Transfer System**

Build a complete stock transfer system that allows moving inventory between warehouses. Your implementation should include:

- Data persistence for transfer records (create `data/transfers.json`)
- API endpoints for creating and retrieving transfers
- Proper validation and error handling
- Stock level updates across warehouses
- Transfer history tracking

Design the data structure, API contracts, and business logic as you see fit for a production system.

**B. Transfer Page UI**

Create a `/transfers` page that provides:
- A form to initiate stock transfers between warehouses
- Transfer history view
- Appropriate error handling and user feedback

Design the interface to be intuitive for warehouse managers performing daily operations.

---

## Task 3: Build Low Stock Alert & Reorder System

**Objective:** Create a practical system that helps warehouse managers identify and act on low stock situations.

### Requirements:

Build a low stock alert and reorder recommendation system that helps warehouse managers proactively manage inventory levels.

**Key Functionality:**
- Identify products that need reordering based on current stock levels and reorder points
- Categorize inventory by stock status (critical, low, adequate, overstocked)
- Provide actionable reorder recommendations
- Allow managers to track and update alert status
- Integrate alerts into the main dashboard

**Implementation Details:**
- Create an `/alerts` page for viewing and managing alerts
- Calculate stock across all warehouses
- Persist alert tracking data (create `data/alerts.json`)
- Design appropriate status workflows and user actions

Use your judgment to determine appropriate thresholds, calculations, and user workflows for a production inventory management system.

---

## 📦 Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Screen recording software for video submission (Loom, OBS, QuickTime, etc.)

### Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:3000
```

### Project Structure
```
inventory-management-task/
├── data/                  # JSON data files
├── src/
│   └── pages/            # Next.js pages and API routes
└── package.json
```

The existing codebase includes product, warehouse, and stock management features. Explore the code to understand the current implementation before starting your tasks.

---

## 📝 Submission Requirements

### 1. Code Submission
- Push your code to **your own GitHub repository** (fork or new repo)
- Clear commit history showing your progression
- Update `package.json` with any new dependencies
- Application must run with: `npm install && npm run dev`

### 2. Video Walkthrough (5-10 minutes) - REQUIRED ⚠️

Record a video demonstration covering:

**Feature Demo (4-5 minutes)**
- Redesigned dashboard walkthrough (demonstrate responsiveness)
- Stock transfer workflow (show both successful and error scenarios)
- Alert system functionality

**Code Explanation (3-4 minutes)**
- Key technical decisions and approach
- Most challenging aspects and solutions
- Code structure highlights

**Reflection (1-2 minutes)**
- What you're proud of
- Known limitations or trade-offs
- What you'd improve with more time

**Format:** Upload to YouTube (unlisted), Loom, or similar platform. Include link in your README.

### 3. Update This README

Add an implementation summary at the bottom with:
- Your name and completion time
- Features completed
- Key technical decisions
- Known limitations
- Testing instructions
- Video walkthrough link
- Any new dependencies added

---

## ⏰ Timeline

**Deadline:** 3 days (72 hours) from receiving this assignment

Submit:
1. GitHub repository link
2. Video walkthrough link
3. Updated README with implementation notes

**Estimated effort:** 15-18 hours total

**Note:** This timeline reflects real-world project constraints. Manage your time effectively and prioritize core functionality over bonus features.

---

## 🏆 Optional Enhancements

If you have extra time, consider adding:
- Live deployment (Vercel/Netlify)
- Dark mode
- Export functionality (CSV/PDF)
- Keyboard shortcuts
- Advanced filtering
- Accessibility features
- Unit tests
- TypeScript
- Additional features you think add value

**Important:** Complete all 3 core tasks before attempting bonuses. Quality of required features matters more than quantity of extras.

---

## 🤔 Frequently Asked Questions

**Q: Can I use additional libraries?**
A: Yes! Add them to package.json and document your reasoning.

**Q: What if I encounter technical blockers?**
A: Document the issue, explain what you tried, and move forward with the next task. Include this in your video explanation.

**Q: Can I modify the existing data structure?**
A: You can add fields, but don't break the existing structure that other features depend on.

**Q: What if I can't complete everything?**
A: Submit what you have with clear documentation. Quality over quantity.

**Q: How will my submission be used?**
A: This is solely for technical assessment. Your code will not be used commercially.

---

## 📘 Implementation Summary

### 👤 Developer
**Name:** Mohammad
**Completion Time:** ~17 hours total (including testing & documentation)

---

### ✅ Features Completed

#### **Task 1 – Dashboard Redesign**
- Fully redesigned dashboard with **responsive 4‑KPI cards**, animated **bar and pie charts**, and an elegant **eco‑green design** inspired by GreenSupply branding.

#### **Task 2 – Stock Transfer Workflow**
- Complete **Transfers** module featuring:  
  - Input validation and persistent logging in `data/transfers.json`  
  - Real‑time updates to stock data across warehouses  
  - Confirmation feedback and automatic dashboard sync  

#### **Task 3 – Stock Alert & Reorder System**
- End‑to‑end implementation for proactive inventory control:  
  - **Dynamic 4‑level status system:** `critical`, `low`, `adequate`, `overstocked`  
  - **Suggested reorder quantity** auto‑calculation  
  - Action buttons — “**Mark as Resolved**” & “**Order X units**”  
  - **Real‑time Snackbar feedback** for instant success messages  
  - Automatic stock updates & **history logging** (`data/alert_history.json`)  
  - Integrated with dashboard live refresh mechanism  

---

### ⚙️ Key Technical Decisions

1. **Cache Invalidation System:**  
   Explicit cache reset after each `POST` (`transfer`, `reorder`, `resolve`) to prevent chart staleness.  

2. **Event‑Based UI Sync:**  
   Introduced `window.dispatchEvent('dashboard-refresh')` to propagate instant updates between `/alerts`, `/transfers`, and `/index` dashboard components.  

3. **Centralized Data Handler:**  
   Consolidated all fetch operations within `fetchDashboardData()` for streamlined state management and chart recomputation.  

4. **Responsive Design System:**  
   Used MUI breakpoints and adaptive typography for consistent UX across all viewport sizes.  

5. **Persistent History Logging:**  
   Recorded all reorder and transfer actions into `data/alert_history.json` for analytical traceability (future Task 4 extension).  

---

### ⚠️ Known Limitations
- No dedicated API‑level cache layer (uses **in‑memory TTL**, volatile on redeploy).  
- **File‑based storage** restricts scalability — future DB migration required.  
- Real‑time sync still backed by a **5 s polling fallback**.  
- **Unit tests** not yet implemented due to scope focus.  

---

### 🧪 Testing Instructions

1. Run the app:
```bash
   npm run dev
1. **Navigate to Dashboard** → Observe **live KPI cards & charts** updating in real‑time.  
2. **Go to `/transfers`** → Initiate a **stock transfer** → ✅ **Charts update instantly** upon confirmation.  
3. **Open `/alerts`** → Test **Reorder** or **Resolve** actions →  
   - 📦 Stock quantity updates **immediately**  
   - 🧾 New log appended to `data/alert_history.json`  
   - 🎉 Snackbar feedback appears confirming success  

---

### 🎥 Video Walkthrough

📺 **Link:** [https://youtu.be/Z_sl8WEI1wA]
_Unlisted YouTube walkthrough including feature demo, code explanation, and technical reflections._
