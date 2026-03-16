# Deploying to Vercel

This project has been configured for deployment on Vercel.

## Important Note on Data Persistence
Vercel's Serverless Functions are **stateless**. This means that any changes made to the blog (creating posts, updating settings) will be stored in a temporary `/tmp/db.json` file which is **wiped periodically** (on every cold start).

**For a production-ready app, you should connect this to a real database like MongoDB, PostgreSQL, or Firebase.**

## Deployment Steps

1.  **Push to GitHub:** Push your code to a GitHub repository.
2.  **Import to Vercel:** Go to [vercel.com](https://vercel.com) and import your repository.
3.  **Environment Variables:**
    -   Add `JWT_SECRET` (any random string).
    -   Add `NODE_ENV` as `production`.
    -   If you use Gemini, add `GEMINI_API_KEY`.
4.  **Deploy:** Vercel will automatically detect the configuration and deploy your app.

## Project Structure for Vercel
-   `api/index.ts`: The entry point for Vercel Serverless Functions.
-   `vercel.json`: Configuration for routing and builds.
-   `server.ts`: The core Express logic, exported for use by Vercel.
