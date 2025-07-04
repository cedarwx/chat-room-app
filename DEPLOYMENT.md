# Deployment Guide

This guide will help you deploy your chat room application to production.

## 🚀 Quick Deployment Steps

### 1. Deploy Backend First

You need to deploy your backend server before deploying the frontend. Here are the recommended options:

#### Option A: Railway (Recommended - Free tier available)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy your server
cd server
railway up
```

#### Option B: Render (Free tier available)
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the root directory to `server`
5. Build command: `npm install`
6. Start command: `node server.js`

#### Option C: Heroku
```bash
# Create a Procfile in the server directory
echo "web: node server.js" > server/Procfile

# Deploy to Heroku
cd server
heroku create your-app-name
git push heroku main
```

### 2. Get Your Backend URL

After deploying your backend, you'll get a URL like:
- Railway: `https://your-app.railway.app`
- Render: `https://your-app.onrender.com`
- Heroku: `https://your-app.herokuapp.com`

### 3. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure the build settings:
   - Framework Preset: `Create React App`
   - Build Command: `yarn build`
   - Output Directory: `build`
   - Install Command: `yarn install`

4. **Set Environment Variables** in Vercel:
   - `REACT_APP_WEBSOCKET_URL`: `wss://your-backend-domain.com` (replace with your actual backend URL)
   - `REACT_APP_API_URL`: `https://your-backend-domain.com` (replace with your actual backend URL)

5. Deploy!

### 4. Update Backend CORS Settings

In your backend deployment, set the environment variable:
- `CORS_ORIGIN`: `https://your-vercel-app.vercel.app` (your frontend URL)

## 🔧 Environment Variables Reference

### Frontend (Vercel)
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_WEBSOCKET_URL` | WebSocket connection URL | `wss://your-app.railway.app` |
| `REACT_APP_API_URL` | API endpoint URL | `https://your-app.railway.app` |

### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port (auto-set by platform) | `3001` |
| `CORS_ORIGIN` | Allowed frontend domain | `https://your-app.vercel.app` |

## 🐛 Common Issues

### Issue: "WebSocket connection failed"
**Solution**: Make sure your `REACT_APP_WEBSOCKET_URL` uses the correct protocol:
- Use `wss://` for secure connections (production)
- Use `ws://` for non-secure connections (development)

### Issue: "CORS error"
**Solution**: Update your backend `CORS_ORIGIN` environment variable to match your frontend domain exactly.

### Issue: "Users not appearing in real-time"
**Solution**: 
1. Check that your WebSocket URL is correct
2. Verify your backend is running and accessible
3. Check browser console for connection errors

### Issue: "Backend not starting"
**Solution**: 
1. Make sure `package.json` has a `start` script: `"start": "node server.js"`
2. Check that all dependencies are in `package.json`
3. Verify the port configuration in `server.js`

## 📝 Testing Your Deployment

1. **Test WebSocket Connection**: Open browser dev tools and check for WebSocket connection logs
2. **Test User Registration**: Try creating a new user
3. **Test Real-time Features**: Open multiple browser tabs to test real-time messaging
4. **Test File Upload**: Try uploading a file (if implemented)

## 🔒 Security Considerations

1. **Use HTTPS/WSS**: Always use secure connections in production
2. **Environment Variables**: Never commit sensitive data to your repository
3. **CORS**: Only allow your specific frontend domain
4. **Rate Limiting**: Consider implementing rate limiting on your backend
5. **Input Validation**: Validate all user inputs on the backend

## 📊 Monitoring

Consider adding monitoring to your production deployment:
- **Uptime Monitoring**: Use services like UptimeRobot
- **Error Tracking**: Use Sentry for error monitoring
- **Performance Monitoring**: Use tools like New Relic or DataDog

## 🆘 Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Check your backend logs
3. Verify all environment variables are set correctly
4. Test with a simple WebSocket client to verify backend connectivity 