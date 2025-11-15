# FAILURE LOG

## 2025-11-15 - Service history layout refactor

- **Attempt**: Used a Python regex script to rewrite each `.service-item` block inline by moving the date, price, and technician markup without recreating the surrounding HTML structure.
- **Issue**: The script retained original indentation inside the newly inserted containers, producing double-spaced markup with inconsistent whitespace and readability issues that violated the compact layout requirement.
- **Resolution**: Rebuilt the entire `service-history` section from structured data so every entry shares a consistent template and formatting, then re-ran the layout with the updated CSS flex styles.
- **Prevention**: When large structural shifts are needed, generate clean markup from templates (or dedent blocks before reinsertion) instead of manipulating raw strings with regex.
