# POL Sandbox - Netlify Deployment Guide

## 🚀 Deploy to Netlify

### Prerequisites
- Netlify account
- GitHub repository: https://github.com/achintir-projects/defi
- Personal Access Token: [Your GitHub PAT]

### Step 1: Push to GitHub

```bash
# Add remote repository
git remote add origin https://github.com/achintir-projects/defi.git

# Add all files
git add .

# Commit changes
git commit -m "🎉 Complete POL Sandbox Implementation

✅ Features:
- Real browser extension with price override capabilities
- Functional RPC endpoint with JSON-RPC 2.0 support
- Complete API suite (prices, config, health, simulation)
- Professional settings interface with real configuration
- Advanced token price management with real-time updates
- Comprehensive documentation site
- Netlify deployment configuration

🔧 Technical:
- SSR-safe components with client-side rendering guards
- Production-ready API endpoints
- CORS-enabled for cross-origin requests
- Security headers and best practices
- Full TypeScript support

🌐 Deployment:
- Netlify functions for serverless API
- Static asset optimization
- Environment variable configuration
- Custom domain support ready

🎯 Ready for production deployment on Netlify!"

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy to Netlify

1. **Login to Netlify**
   - Go to https://app.netlify.com
   - Login with your GitHub account

2. **Create New Site**
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select the `achintir-projects/defi` repository
   - Configure build settings:
     ```
     Build command: npm run build
     Publish directory: .next
     Node version: 18
     ```

3. **Environment Variables**
   Add these environment variables in Netlify dashboard:
   ```
   NODE_VERSION=18
   NPM_VERSION=9
   NEXT_PUBLIC_BASE_URL=https://your-site-name.netlify.app
   ```

4. **Deploy**
   - Click "Deploy site"
   - Wait for deployment to complete

### Step 3: Post-Deployment Configuration

1. **Update Extension Download URL**
   - Edit the extension to use the new Netlify URL
   - Re-upload the extension file

2. **Test All Features**
   - Browser extension download and installation
   - API endpoints (https://your-site.netlify.app/api/*)
   - RPC configuration
   - Settings page functionality

## 📋 Deployment Checklist

- [ ] Code pushed to GitHub repository
- [ ] Netlify site created and deployed
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Browser extension updated with new URL
- [ ] All dashboard features working
- [ ] Documentation accessible
- [ ] SSL certificate active (automatic with Netlify)

## 🔧 Netlify Configuration

The `netlify.toml` file includes:
- Build configuration
- API routing to serverless functions
- Security headers
- CORS configuration
- Redirect rules

## 🌐 Live URL Structure

Once deployed, your POL Sandbox will be available at:
- **Main App**: `https://your-site-name.netlify.app`
- **API**: `https://your-site-name.netlify.app/api/*`
- **RPC**: `https://your-site-name.netlify.app/api/rpc`
- **Docs**: `https://your-site-name.netlify.app/docs`
- **Extension**: `https://your-site-name.netlify.app/pol-sandbox-extension.tar.gz`

## 🎯 Benefits of Netlify Deployment

✅ **Global CDN**: Fast loading worldwide
✅ **HTTPS**: Free SSL certificate
✅ **Serverless Functions**: API endpoints included
✅ **Automatic Deployments**: Git-based deployments
✅ **Custom Domains**: Easy domain setup
✅ **Analytics**: Built-in performance monitoring
✅ **Rollbacks**: Easy deployment rollbacks
✅ **Split Testing**: A/B testing capabilities

## 🔄 Continuous Deployment

Netlify automatically deploys when you push to GitHub:
```bash
git add .
git commit -m "Update: Feature description"
git push origin main
```

Your POL Sandbox will be live and seamlessly connecting to Trust Wallet and other supported wallets! 🚀