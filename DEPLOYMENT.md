# Deploying INFINITY-2K25 to Vercel

This guide walks you through deploying the INFINITY-2K25 website to Vercel for production hosting.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Your project code pushed to a GitHub repository
3. Your Supabase project set up and ready

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and log in
2. Click "Add New" → "Project"
3. Select your GitHub repository containing the INFINITY-2K25 website
4. If you haven't connected your GitHub account, you'll be prompted to do so

### 2. Configure Project Settings

1. In the configuration screen, set the following:
   - **Framework Preset**: Other
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `./`
   - **Install Command**: `npm install`

2. Under "Environment Variables", add the following variables:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key

3. Click "Deploy"

### 3. Monitor Deployment

1. Wait for the deployment to complete
2. Vercel will show you the build logs and deployment status
3. Once completed, you'll get a production URL for your site

### 4. Custom Domain (Optional)

1. From your project dashboard, go to "Settings" → "Domains"
2. Add your custom domain and follow the verification steps
3. Configure your DNS settings as directed by Vercel

## Continuous Deployment

Vercel automatically sets up continuous deployment from your GitHub repository:

- Every push to the main/master branch will deploy to production
- Pull requests will generate preview deployments

## Troubleshooting

If you encounter issues during deployment:

1. Check the build logs for specific errors
2. Verify your environment variables are correctly set
3. Ensure that Vercel has access to your repository

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Custom Domain Setup](https://vercel.com/docs/concepts/projects/domains)
- [Environment Variables](https://vercel.com/docs/environment-variables)
