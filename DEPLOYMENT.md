# 🚀 Deployment Guide - Paper Tube Manufacturing System

## Prerequisites
- GitHub account
- Cloudflare account
- Node.js 18+ installed

## Step 1: Set Up Cloudflare D1 Database

### A. Create D1 Database
```bash
npx wrangler d1 create paper_tube_production
```

You'll see output like:
```
✅ Successfully created DB 'paper_tube_production'
  
[[d1_databases]]
binding = "DB"
database_name = "paper_tube_production"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### B. Update wrangler.toml
Copy the `database_id` from above and update `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "paper_tube_production"
database_id = "paste-your-actual-database-id-here"  # ← UPDATE THIS
```

### C. Initialize Database Schema
```bash
# For local development
npx wrangler d1 execute paper_tube_production --local --file=./schema.sql

# For production
npx wrangler d1 execute paper_tube_production --remote --file=./schema.sql
```

## Step 2: Test Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit http://localhost:3000 and test:
- ✅ Add a production record
- ✅ Verify real-time calculations
- ✅ Check grand total accuracy
- ✅ Edit and delete records

## Step 3: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Paper Tube Manufacturing System"

# Create repository on GitHub and add remote
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Cloudflare Pages

### A. Connect GitHub Repository
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages**
3. Click **Create Application** → **Pages** → **Connect to Git**
4. Select your GitHub repository
5. Click **Begin Setup**

### B. Configure Build Settings
```
Framework preset: Next.js
Build command: npm run build
Build output directory: out
Root directory: /
```

### C. Add D1 Database Binding
1. After initial deployment, go to **Settings** → **Functions**
2. Scroll to **D1 database bindings**
3. Click **Add binding**
4. Variable name: `DB`
5. D1 database: Select `paper_tube_production`
6. Click **Save**

### D. Redeploy
1. Go to **Deployments** tab
2. Click **Retry deployment** on the latest deployment
   
OR trigger a new deployment by pushing to GitHub

## Step 5: Verify Production Deployment

Visit your Cloudflare Pages URL (e.g., `https://your-project.pages.dev`)

Test all functionality:
- ✅ Create production records
- ✅ Real-time calculations working
- ✅ Data persists (refresh page)
- ✅ Edit/Delete operations
- ✅ Grand total accuracy

## Auto-Deploy Configuration

Every push to `main` branch will automatically:
1. Build your Next.js app
2. Deploy to Cloudflare Pages
3. Use your D1 database binding

## Troubleshooting

### "Database not found" Error
- Verify `database_id` in `wrangler.toml` is correct
- Ensure D1 binding is configured in Cloudflare Pages Settings → Functions

### API Errors (500)
- Check D1 database has been initialized with schema
- Verify binding name is exactly `DB`
- Check Cloudflare Pages function logs

### Division by Zero
System automatically handles this - returns 0 when production or outdone is 0

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next out node_modules
npm install
npm run build
```

## Pro Tips

1. **Custom Domain**: Add in Pages Settings → Custom domains
2. **Branch Previews**: Each branch gets its own preview URL
3. **Database Backups**: Use `npx wrangler d1 export` regularly
4. **Monitoring**: Enable analytics in Cloudflare dashboard

## Commands Reference

```bash
# Local development
npm run dev

# Build for production
npm run build

# Create D1 database
npx wrangler d1 create DATABASE_NAME

# Execute SQL on local D1
npx wrangler d1 execute DB_NAME --local --file=FILE.sql

# Execute SQL on remote D1
npx wrangler d1 execute DB_NAME --remote --file=FILE.sql

# Export database
npx wrangler d1 export DB_NAME --remote --output=backup.sql

# View D1 database info
npx wrangler d1 info DB_NAME
```

## Support

For issues:
- Check Cloudflare Pages deployment logs
- Verify D1 database binding
- Test locally with `npm run dev`
- Review browser console for errors
