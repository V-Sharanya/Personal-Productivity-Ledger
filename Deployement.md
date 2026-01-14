# Deployment Guide

## Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **For production deployment:**
   ```bash
   vercel --prod
   ```

## Option 2: Heroku

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Login and create app:**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Deploy:**
   ```bash
   git push heroku main
   ```

## Option 3: Railway.app

1. **Connect your GitHub repo**
2. **Railway will auto-detect Node.js project**
3. **Set environment variables if needed**
4. **Auto-deploys on push**

## Option 4: Local/VPS Deployment

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "productivity-ledger"
   pm2 startup
   pm2 save
   ```

## Database Persistence

The app uses SQLite with a `ledger.db` file. When deploying:
- **Vercel**: SQLite works but data resets on redeploy. Consider using a cloud database.
- **Heroku/Railway**: SQLite persists as long as the dyno is alive.
- **VPS**: Data persists permanently.

For production, consider upgrading to PostgreSQL or MongoDB for better persistence.
