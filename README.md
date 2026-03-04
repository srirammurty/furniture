# Eclat Spazio - Client Quotation Builder

A professional drag-and-drop quotation builder for interior designers and architects. Create beautiful client quotations with real-time price calculations and PDF export.

![Quotation Builder](https://img.shields.io/badge/React-19.0.0-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

- **Drag & Drop Interface** - Drag items from the catalog directly into quotation sections
- **Dynamic Subsections** - Create, rename, and delete subsections to organize your quotation
- **Real-time Calculations** - Automatic subsection totals and grand total in Indian Rupees (₹)
- **PDF Export** - Download quotations as professionally formatted PDF files
- **CSV Import** - Load custom item catalogs from CSV files
- **Responsive Design** - Works on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js 18+ 
- Yarn package manager
- Python 3.9+ (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd app
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   yarn install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

4. **Set up environment variables**

   Frontend (`frontend/.env`):
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8001
   ```

   Backend (`backend/.env`):
   ```env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=quotation_db
   CORS_ORIGINS=*
   ```

5. **Start the application**

   Terminal 1 - Backend:
   ```bash
   cd backend
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

   Terminal 2 - Frontend:
   ```bash
   cd frontend
   yarn start
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## Usage Guide

### Building a Quotation

1. **Add Client Information**
   - Enter the client name, project title, and date at the top of the quotation

2. **Create Subsections**
   - Click the "+ ADD SUBSECTION" button
   - Enter a name (e.g., "Master Bathroom", "Living Room")
   - Click "Add Subsection"

3. **Add Items**
   - Browse the Item Catalog on the right panel
   - Drag any item and drop it into a subsection table
   - Items auto-populate with name, description, and price

4. **Manage Items**
   - Hover over any item row to see the remove (×) button
   - Click to remove items from the quotation

5. **Edit Subsections**
   - Click on a subsection name to edit it
   - Click the trash icon to delete an entire subsection

6. **Export PDF**
   - Click "EXPORT AS PDF" button at the bottom
   - PDF downloads automatically with client name and date

### Loading Custom Items (CSV)

1. Click "LOAD CSV" button in the Item Catalog panel
2. Select a CSV file with the following format:

```csv
name,price,category,description
"Custom Vanity","25000","1","Premium custom bathroom vanity"
"Designer Sofa","120000","2","Italian leather 4-seater sofa"
"King Wardrobe","95000","3","Walk-in wardrobe with LED lighting"
```

**Categories:**
- `1` = Bathroom
- `2` = Living Room  
- `3` = Bedroom

## Project Structure

```
app/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   └── QuotationBuilder.jsx   # Main component
│   │   ├── data/
│   │   │   └── sampleItems.js         # Default item catalog
│   │   ├── components/ui/             # Shadcn UI components
│   │   ├── App.js
│   │   ├── App.css                    # Custom styles + print CSS
│   │   └── index.css                  # Tailwind + theme variables
│   ├── package.json
│   └── .env
│
├── backend/                  # FastAPI backend
│   ├── server.py
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

## Tech Stack

- **Frontend**: React 19, TailwindCSS 3.4, Shadcn/UI
- **Backend**: FastAPI, Motor (MongoDB async driver)
- **PDF Generation**: html2pdf.js
- **Icons**: Lucide React
- **Fonts**: Playfair Display, Manrope

## Customization

### Adding New Categories

Edit `frontend/src/data/sampleItems.js`:

```javascript
export const categoryNames = {
  "1": "Bathroom",
  "2": "Living Room",
  "3": "Bedroom",
  "4": "Kitchen"  // Add new category
};
```

### Changing the Logo

Edit `frontend/src/pages/QuotationBuilder.jsx` and find the header section:

```jsx
<h1 className="font-heading text-4xl md:text-5xl font-medium tracking-tight text-primary">
  Your Company Name
</h1>
```

### Modifying Theme Colors

Edit `frontend/src/index.css` CSS variables under `:root`.

## License

MIT License - feel free to use for personal and commercial projects.

## Support

For issues or feature requests, please open a GitHub issue.
