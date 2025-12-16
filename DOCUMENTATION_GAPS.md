# Documentation Gap Analysis

**Date:** 2025-12-16  
**Version Subject:** v0.9.10  
**Status:** Analysis Completed

## Executive Summary

A comprehensive review of the `CHANGELOG.md` and the `src/app/docs` directory reveals significant gaps between the current application capabilities and the user-facing documentation. Major recent features—specifically the **Setup/Onboarding Wizard**, **Notifications System**, and **Staff Workload Reports**—are completely undocumented. Additionally, technical changes regarding deployment and backup resilience have not been reflected in the administrative guides.

## 1. Critical Documentation Gaps (Missing Pages)

The following major features are implemented in the codebase but have no corresponding documentation in `src/app/docs`.

### 1.1. Intelligent Onboarding & Setup Wizard

- **Feature Status:** Implemented (v0.1.2/Unreleased), located at `/setup`.
- **Current Docs:** `getting-started/index.mdx` describes a manual, command-line based installation process (`docker-compose`, `prisma generate`, `prisma migrate`) which appears to be secondary to the new interactive wizard.
- **Missing Content:**
  - Explanation of the `/setup` wizard flow.
  - Guide to the **2-Stage Import System** (Raw SQL → Validation → Production).
  - Explanation of the **SetupGuard** diagnostics (what the checks mean).
  - Instructions for the drag-and-drop file upload and supported formats (`.sql`, `.zip`, `.tar.gz`).
  - Troubleshooting guide for import failures (orphaned records, date repairs).
- **Recommendation:** Rewrite `getting-started/index.mdx` to focus on the Setup Wizard as the primary method, moving the manual CLI steps to an "Advanced Installation" or "Manual Setup" section.

### 1.2. Notifications System

- **Feature Status:** Implemented (`src/app/admin/notifications`), mentioned in CHANGELOG Proposals.
- **Current Docs:** No mentions in `features/` or `admin.mdx`.
- **Missing Content:**
  - **Bell Icon**: Explanation of the header notification center and priority colors (Error, Warning, Success).
  - **Notifications Page**: Guide to the Current vs Archived sections.
  - **Actions**: How to mark as read, archive, or delete notifications.
  - **Types**: What events trigger notifications (updates, backups, errors).
- **Recommendation:** Create new file `src/app/docs/features/notifications.mdx`.

## 2. Incomplete Documentation (Missing Sections)

The following features are partially documented but lack coverage of substantial recent enhancements.

### 2.1. Staff Workload & Daily Totals

- **Feature Status:** Enhanced in v0.9.0 and v0.9.9.
- **Current Docs:** `features/reports.mdx` (lines 11-51) describes the Daily Totals report generically.
- **Missing Content:**
  - **Staff Workload Summary**: No mention of the new card that groups animals by staff initials.
  - **Initials Extraction**: No explanation of how staff initials are parsed from notes (e.g., "short cut 7 $65 cc" → "CC").
  - **Print Styling**: The "Improved Print Styles" (monochrome, compact) are not visualized or described.
- **Recommendation:** Update `features/reports.mdx` to include "Staff Workload Analysis" section and update screenshots to show the staff summary card.

### 2.2. Search & Result Cards

- **Feature Status:** Redesigned in v0.9.0 ("Two column layout", "Horizontal Card Layout").
- **Current Docs:** `features/search.mdx` is generic. Screenshots might be outdated (needs visual verification).
- **Missing Content:**
  - **Specific Layout Details**: The "Two column" list view (Animal vs Customer) is not explicitly described.
  - **Interactivity**: Click-to-call and Click-to-email features are not highlighted as key efficiency tools.
  - **Keyboard Accessibility**: Not mentioned.
- **Recommendation:** Refresh `features/search.mdx` text to specifically highlight the "high-density list view" and "actionable contact details".

### 2.3. Admin & Backups

- **Feature Status:** Enhanced in v0.9.7 and v0.9.9 (Email notifications, Log Archives, Scheduler).
- **Current Docs:** `features/admin.mdx` covers basic creation/deletion.
- **Missing Content:**
  - **Import Log Archive**: The ability to download compressed logs after import (v0.9.9) is missing.
  - **Email Notifications**: The system's ability to email backup statuses (success/failure) is not mentioned.
  - **Automatic Updates**: No mention of how the scheduler handles application updates or rollbacks (key for admin confidence).
- **Recommendation:** Add "System Updates" and "Import Logs" sections to `features/admin.mdx`.

### 2.4. Customer Management Details

- **Feature Status:** Enhanced with "Selective Rehoming" and "Smart Validation".
- **Current Docs:** `features/customers.mdx` covers basic CRUD but omits advanced workflows.
- **Missing Content:**
  - **Deletion Workflow**: The entire "Delete Customer" action is missing. Crucially, the **Selective Rehoming** feature (moving animals to another owner vs. deleting them) is undocumented.
  - **Validation**: The docs mention "normalized" phones but fail to mention **Real-time Validation** feedback or the strict email domain checks.
  - **Activity Insight**: "Years Active" and "Total Visits" statistics are displayed on the UI but not explained in the docs.
- **Recommendation:** Add "Deleting a Customer" section explaining the rehoming modal. Update "Customer Detail Page" to include the new stats.

### 2.5. Breed Management Specifics

- **Feature Status:** Enhanced with "Bulk Pricing" variants and "Safe Deletion".
- **Current Docs:** `features/breeds.mdx` contains inaccuracies regarding these features.
- **Missing Content:**
  - **Bulk Pricing**: Docs claim only "percentage-based changes" are possible; missing the **Fixed Amount** ($) option.
  - **Safe Deletion**: Docs imply a passive warning ("may affect animals"). The actual feature is a **Mandatory Migration** workflow that blocks deletion until animals are rehomed.
  - **Duplicate Prevention**: No mention of the case-insensitive name validation errors.
- **Recommendation:** Correct the "Delete" section to describe the mandatory migration. Update "Modify All Pricing" to include fixed-amount options.

### 2.6. Animal Details

- **Feature Status:** v0.9.10 features.
- **Current Docs:** `features/animals.mdx` is largely accurate but misses safety details.
- **Missing Content:**
  - **Deletion Safety**: Docs mention "confirmation" but miss the specific **"Type name to confirm"** requirement designed to prevent accidental data loss.
  - **Cost Intelligence**: The automated parsing of costs from note text (e.g., "$60") is shown in an example but not explicitly explained as an automated feature.
- **Recommendation:** Clarify the "Add Service Note" section to explain cost extraction. Update "Deletion" to specify the safety check.

## 3. Technical & Configuration Gaps

### 3.1. Rate Limiting

- **Feature Status:** Implemented (Unreleased Production Hardening).
- **Missing Content:** No public documentation mentions the API rate limits (30/min).
- **Impact:** Users or integrators might hit 429 errors without understanding why.
- **Recommendation:** Add "Rate Limits" section to `api-reference/index.mdx` or `admin.mdx`.

### 3.2. Environmental Configuration

- **Feature Status:** v0.9.7 added automated `.env` version updates and strict validation.
- **Missing Content:** Admin docs do not explain that `.env` is managed by the scheduler or required variables.
- **Recommendation:** Create a "Configuration Reference" in `admin.mdx` or `getting-started/configuration.mdx`.

## 4. Prioritized Action Plan

To close these gaps, the following updates are recommended in order of priority:

1.  **High Priority**:
    - **Create `src/app/docs/features/setup.mdx`**: Document the Onboarding Wizard and Import process.
    - **Update `getting-started/index.mdx`**: Link to the new Setup guide and deprecate/move manual instructions.
    - **Create `src/app/docs/features/notifications.mdx`**: Document the new notification system.

2.  **Medium Priority**:
    - **Update `features/reports.mdx`**: Add Staff Workload Summary and Initials parsing logic.
    - **Update `features/admin.mdx`**: Add Import Log Archives and Backup Email details.
    - **Update `features/customers.mdx`**: Document Deletion/Rehoming workflow and new stats.
    - **Update `features/breeds.mdx`**: Correct Bulk Pricing (Fixed amount) and Safe Deletion steps.

3.  **Low Priority**:
    - **Refine `features/search.mdx`**: Update descriptions to match v0.9.0 layout changes.
    - **Technical Docs**: Add Rate Limiting and Env Config to API/Admin reference.
