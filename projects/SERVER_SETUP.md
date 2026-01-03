# Server Setup for Real-time Collaborative Projects

This guide explains how to host the full version of Ono-Mato-Dada with Socket.io real-time collaboration features.

## Option 1: Deploy to a Cloud Platform

### Heroku
1. Create a `Procfile` in the project root:
   ```
   web: node index.js
   ```
2. Set up Heroku and deploy:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

### Glitch
1. Import your project to Glitch
2. Glitch will automatically detect and run `index.js`
3. Your app will be available at `https://your-project.glitch.me`

### Railway / Render
1. Connect your repository
2. Set the start command to `node index.js`
3. Deploy

### Vercel / Netlify (with serverless functions)
These platforms require serverless functions. You may need to adapt the Socket.io server to work with their serverless architecture.

## Option 2: Run Locally for Development

1. Navigate to the project directory:
   ```bash
   cd "/Users/adelinesetiawan/Library/Mobile Documents/com~apple~CloudDocs/Creative Coding Projects/Project 02_Ono-Mato-Dada-v3"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. The app will be available at `http://localhost:3000`

## Option 3: Self-hosted Server

If you have a VPS or dedicated server:

1. Install Node.js and npm
2. Clone/copy your project
3. Install dependencies: `npm install`
4. Use PM2 or similar to keep it running:
   ```bash
   pm2 start index.js
   ```
5. Set up a reverse proxy (nginx) to serve on port 80/443

## Update the Project Page

Once you have your server URL, update `projects/ono-mato-dada.html`:

```html
<a href="https://your-server-url.com" target="_blank" rel="noopener noreferrer" class="version-btn collaborative-btn">
    Real-time Collaborative Version →
</a>
```

Replace `https://your-server-url.com` with your actual server URL.

## Project Structure

- `02_Ono-Mato-Dada-v3-standalone/` - Standalone version (no server needed, embedded on site)
- `02_Ono-Mato-Dada-v3-full/` - Full version with Socket.io (needs server)
- Original project location: `~/Library/Mobile Documents/com~apple~CloudDocs/Creative Coding Projects/Project 02_Ono-Mato-Dada-v3/`

