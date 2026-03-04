# Eclat Spazio Quotation Builder - PRD

## Original Problem Statement
Create a professional client quotation webpage with drag-drop functionality, dynamic subsections, real-time price calculations, PDF export, and CSV file upload.

## User Choices
- PDF Export: Browser-based (window.print())
- Data Storage: Temporary session-only with CSV load option
- Sample Items: 15 items (5 per category)
- Design Theme: Black and White (Swiss Minimalist)
- Logo: Text "Eclat Spazio"

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Backend**: Not used (session-only storage)
- **State Management**: React useState hooks

## What's Been Implemented (2026-03-04)
- [x] Two-panel layout (70% quotation / 30% catalog)
- [x] HTML5 drag-and-drop functionality
- [x] 15 sample items across 3 categories (Bathroom, Living Room, Bedroom)
- [x] Dynamic subsection creation with editable names
- [x] Real-time price calculations (subsection + grand total)
- [x] PDF export via window.print()
- [x] CSV file upload for custom items
- [x] Client info inputs (Name, Date, Project Title)
- [x] Remove items from quotation
- [x] Delete entire subsections
- [x] Responsive mobile layout
- [x] Toast notifications

## Core Features
1. **Item Catalog Panel** - Right side, draggable item cards organized by category
2. **Quotation Paper Panel** - Left side, professional document layout
3. **Subsection Management** - Add, edit, delete subsections
4. **Price Calculations** - Auto-calculated subsection and grand totals
5. **Export** - Browser-based PDF generation

## File Structure
- `/app/frontend/src/pages/QuotationBuilder.jsx` - Main component
- `/app/frontend/src/data/sampleItems.js` - Sample data
- `/app/frontend/src/App.css` - Custom styles including print CSS

## Backlog (P1/P2 Features)
- P1: Save quotation to localStorage for persistence
- P1: Email quotation functionality
- P2: Multiple quotation templates
- P2: Item quantity support
- P2: Discount/markup percentage option
- P2: Terms and conditions section
