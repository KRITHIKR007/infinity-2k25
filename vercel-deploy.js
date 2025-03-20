#!/usr/bin/env node

/**
 * Helper script for deploying to Vercel via CLI
 * Run with: node vercel-deploy.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
  console.log('✅ Vercel CLI is installed');
} catch (error) {
  console.error('❌ Vercel CLI is not installed. Please install it with:');
  console.error('npm install -g vercel');
  process.exit(1);
}

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('⚠️ No .env file found. Creating one with Supabase credentials...');
  
  const envContent = `SUPABASE_URL=https://ceickbodqhwfhcpabfdq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlaWNrYm9kcWh3ZmhjcGFiZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMzU2MTgsImV4cCI6MjA1NzkxMTYxOH0.ZyTG1FkQzjQ0CySlyvkQEYPHWBbZJd--vsB_IqILuo8`;
  
  fs.writeFileSync('.env', envContent);
  console.log('✅ Created .env file with Supabase credentials');
}

console.log('🚀 Starting Vercel deployment...');

// Run Vercel command
try {
  // For production deployment
  execSync('vercel --prod', { stdio: 'inherit' });
  
  console.log('✅ Deployment initiated successfully!');
  console.log('📝 Check your Vercel dashboard for deployment status and URL.');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
