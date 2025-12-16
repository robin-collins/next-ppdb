# Features Summary

**Last Updated:** 2025-12-16
**Version:** v0.9.10

This document provides a comprehensive summary of all implemented features, enhancements, and technical capabilities of the Next PPDB application, based on the project changelog.

---

## 🚀 Core Features

### 🔍 Intelligent Search System

- **Relevance-Based Scoring**: Algorithms rank results by exact match (100%), probability, and fuzzy matching (typo tolerance).
- **Deep Search Capability**: Matches against animal names, customer names, breeds, emails, and normalized phone numbers.
- **High-Density Visualization**:
  - **Card View**: Responsive horizontal layout with breed avatars and key details.
  - **List View**: Compact, data-dense dual-column layout (Animal | Customer) for rapid scanning.
- **Interactive Elements**: One-click actions for "Call Customer" (tel:) and "Email Customer" (mailto:).
- **Smart Suggestions**: Auto-complete chips offer common search terms.

### 🐾 Animal Management

- **Avatar System**: Dynamic generation of animal avatars combining breed images with overlay initials.
- **Service History**: Detailed tracking of all grooming notes with cost and technician extraction.
- **Cost Intelligence**: Automated parsing of service costs from note text (e.g., "Clip $65" -> Cost: 65).
- **Deletion Protection**: "Cascade Safe" deletion requires typing the animal name to confirm; automatically cleans up associated notes.

### 👥 Customer Management

- **Selective Rehoming**: When deleting a customer, users can choose to delete animals OR rehome them to another customer.
- **Smart Validation**: Real-time validation for:
  - **Emails**: ASCII-compliant domain verification.
  - **Phones**: International format support (up to 11 digits).
  - **Postcodes**: Strict format checking.
- **Activity Insight**: Calculated stats for "Years Active" and "Total Visits" based on service history.

### 🧬 Breed Database

- **Bulk Pricing Engine**: Global modification tool to update prices across all breeds by fixed amount ($) or percentage (%).
- **Conflict Prevention**: Case-insensitive duplicate name validation.
- **Smart Defaults**: Auto-population of average times and costs based on existing data.
- **Safe Deletion**: Mandatory migration workflow ensures no animals are left orphaned when a breed is deleted.

---

## 📊 Reporting & Analytics

### 📈 Analytics Dashboard

- **Revenue Trends**: Visualization of income over time.
- **Business Insights**: Tracking of busiest days and popular breeds.
- **Interactive UI**: Modern glassmorphic cards with drill-down capabilities.

### 📝 Daily Totals Report

- **Print Optimization**: Specialized print stylesheet for monochrome, high-contrast, compact output.
- **Staff Workload Analysis**:
  - Automated extraction of staff initials from service notes.
  - Grouping of animals and revenue by staff member.
- **Detailed Breakdown**: Line-item listing of all daily services with cost and groomer attribution.

### 📉 Customer History

- **Inactivity Tracking**: Filtering for customers unrelated for 12, 24, or 36+ months.
- **Pagination**: Server-side pagination for handling large datasets (10/25/50/100 per page).
- **Export Ready**: Formatted for review to aid in database cleanup campaigns.

---

## 🛠️ System & Administration

### ⚙️ Intelligent Onboarding (Setup Wizard)

- **Diagnostic Guard**: Automated "SetupGuard" checks DB health on startup and redirects to setup if needed.
- **2-Stage Import System**:
  - **Stage 1**: Fast raw SQL import to temporary tables.
  - **Stage 2**: Validated migration to production with data remediation (date fixes, orphan cleanup).
- **Universal Upload**: Drag-and-drop support for `.sql`, `.zip`, `.tar.gz` backups.
- **Real-Time Feedback**: SSE-based progress streaming with visual table-by-table status.

### 🔔 Notifications System

- **Central Hub**: Header-based notification center with prioritized alerting (Error > Warning > Success).
- **Persistence**: Valkey-backed storage with read/unread state tracking.
- **Email Integration**:
  - **Backup Status**: Automated emails for successful/failed backups.
  - **Critical Alerts**: Fallback SMTP notifications if the scheduler detects app failures.

### 💾 Backup & Disaster Recovery

- **One-Click Backup**: Instant full database dump including schema and data.
- **Auto-Cleanup**: Rolling retention policy (keeps latest 5 backups).
- **Export Options**: Downloadable ZIP archives with timestamped filenames.
- **Log Archiving**: Automated compression of import logs for audit trails.

---

## 🏗️ Infrastructure & DevOps

### 🐳 Docker & Scheduler

- **Optimized Builds**: Layer caching strategy reduces rebuild times by 5-15s.
- **Dedicated Scheduler**: Separate container for managing updates, health checks, and backups.
- **Auto-Updates**:
  - Automated image pulling (GHCR) and container rolling.
  - **Smart Rollback**: Automatic reversion to previous image tag if update fails health checks.
  - .env version synchronization.

### 🛡️ Security & Performance

- **Rate Limiting**: Integrated limiters (30/min) for API endpoints using Valkey.
- **Structured Logging**: JSON-formatted logging (Pino) with sensitive data redaction.
- **Environment Validation**: Strict Zod-based schema validation for all ENV variables at startup.
- **Container Security**: Signed images with Cosign; minimal non-root user execution.

### 🔍 API & Documentation

- **OpenAPI/Swagger**: Auto-generated interactive API docs at `/api/docs`.
- **User Documentation**: Integrated guides (`/docs`) using prose-styled Markdown rendering.
- **Standardized Responses**: Unified JSON response envelopes for success/error states.

---

## 🎨 UI/UX Design

- **Glassmorphism**: Modern, translucent UI with coherent color system (Golden Brown / Teal / Aqua).
- **Typography**: Updated font pairing (Lora serif headers + Rubik sans-serif body).
- **Responsive Navigation**:
  - Collapsible sidebar with specific "Pinned" state persistence.
  - Mobile-optimized layouts for all data grids.
- **Accessibility**: Keyboard-navigable cards; Aria labels on interactive elements.
