# Paper Tube Manufacturing System - Setup Instructions

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Cloudflare D1 Database

```bash
# Create the D1 database
npx wrangler d1 create paper_tube_production
```

Copy the `database_id` from the output and update it in `wrangler.toml`

### 3. Create Database Tables

```bash
# Run the schema migration
npx wrangler d1 execute paper_tube_production --local --file=./schema.sql
npx wrangler d1 execute paper_tube_production --remote --file=./schema.sql
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 5. Deploy to Cloudflare Pages

##Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

## Connect to Cloudflare Pages
1. Go to Cloudflare Pages Dashboard
2. Click "Create a project"
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `out`
5. Add D1 database binding in Settings → Functions

## 📊 Using the System

1. **Add Production Record**: Fill in all 8 cost modules
2. **Real-time Calculations**: Grand total updates as you type
3. **View Records**: See all production history in the table below
4. **Edit/Delete**: Manage existing records

## 🧮 Calculation Logic

- **Material Costs** (Paper, Paste, Outer Paste): `cost ÷ outdone`
- **Operational Costs** (Packing, Labour, EB, Overheads, Food): `cost ÷ production`
- **Grand Total**: Sum of all 8 cost-per-tube values
- **Rejection**: `production - outdone`

## 📁 Project Structure

```
paper-cost-ui/
├── app/
│   ├── page.tsx          # Main production management interface
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   └── Navbar.tsx        # Navigation component
├── functions/
│   └── api/
│       └── production.ts # Cloudflare Workers API endpoints
├── lib/
│   └── db-utils.ts       # Database utilities and calculations
├── schema.sql            # D1 database schema
├── wrangler.toml         # Cloudflare configuration
└── package.json          # Dependencies
```

## 🔧 Environment Variables

For Cloudflare Pages deployment, add these in Settings → Environment variables:
- D1 database binding is configured in wrangler.toml

## 🐛 Troubleshooting

**Database not found**: Make sure you've created the D1 database and updated the `database_id` in wrangler.toml

**API errors**: Ensure D1 binding is configured in Cloudflare Pages Functions settings

**Zero division errors**: The system automatically handles division by zero (returns 0)
