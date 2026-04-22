# Railway Deployment Guide

This project has a separate frontend and backend that should be deployed as **two separate services** on Railway.

## Prerequisites

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

---

## Step 1: Deploy the Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Initialize Railway project:
   ```bash
   railway init
   ```

3. Create a new service named `ristro-backend`:
   ```bash
   railway add --service ristro-backend
   ```

4. Link the service:
   ```bash
   railway link
   ```

5. Add environment variables:
   ```bash
   railway variables set SECRET_KEY=your-secret-key-here
   railway variables set ALGORITHM=HS256
   railway variables set ACCESS_TOKEN_EXPIRE_MINUTES=1440
   railway variables set DATABASE_URL=your-database-url
   ```

6. Deploy:
   ```bash
   railway up
   ```

7. Get the backend URL:
   ```bash
   railway domain
   ```
   Save this URL - you'll need it for the frontend config.

---

## Step 2: Deploy the Frontend

1. Go back to root directory:
   ```bash
   cd ..
   ```

2. Initialize Railway project (if not already done):
   ```bash
   railway init
   ```

3. Create a new service named `ristro-frontend`:
   ```bash
   railway add --service ristro-frontend
   ```

4. Link the service:
   ```bash
   railway link
   ```

5. Set the backend API URL:
   ```bash
   railway variables set VITE_API_URL=https://your-backend-url.railway.app
   ```

6. Deploy:
   ```bash
   railway up
   ```

7. Get the frontend URL:
   ```bash
   railway domain
   ```

---

## Environment Variables

### Backend (`backend/.env`)
```
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=postgresql://user:password@host:port/database
```

### Frontend (`.env`)
```
VITE_API_URL=https://your-backend-url.railway.app
```

---

## Troubleshooting

### Backend Issues

1. **Database connection errors**: Make sure `DATABASE_URL` is correctly set
2. **Import errors**: Check `requirements.txt` is up to date
3. **Port errors**: Railway automatically sets `$PORT` environment variable

### Frontend Issues

1. **Build fails**: Run `npm install` locally first to ensure dependencies are correct
2. **API calls fail**: Check `VITE_API_URL` is set correctly
3. **404 on refresh**: The `railway.json` includes rewrite rules for SPA routing

---

## Useful Commands

```bash
# View logs
railway logs

# View service status
railway status

# Open service in browser
railway open

# List all services
railway list

# Delete a service
railway destroy
```
