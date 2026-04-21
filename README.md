# Ristro - Restaurant & Café App

A modern restaurant ordering system with separate customer and admin interfaces.

## Tech Stack

- **Frontend:** React 19 + Vite + TailwindCSS 4
- **Backend:** FastAPI (Python) + SQLAlchemy
- **Database:** PostgreSQL (Supabase)
- **Deployment:** Vercel (Frontend) + Railway/Render (Backend)

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL database (or Supabase free tier)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/Ristro.git
cd Ristro
```

### 2. Setup Database (Supabase - Free)

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Go to **SQL Editor** and run the contents of `backend/supabase_schema.sql`
3. Go to **Project Settings** → **Database** → **Connection string**
4. Copy the **URI** connection string (looks like `postgresql://postgres.xxx:password@db.xxx.supabase.co:5432/postgres`)

### 3. Setup Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder:
```env
DATABASE_URL=your_supabase_connection_string_here
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Run the backend:
```bash
uvicorn main:app --reload --port 8000
```

### 4. Setup Frontend

```bash
cd ..
npm install
```

Create a `.env.local` file in the root:
```env
VITE_API_URL=http://localhost:8000/api
```

Run the frontend:
```bash
npm run dev
```

---

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repo
3. Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`
4. Deploy

### Backend (Railway - Free $5 credit)

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Set Root Directory: `backend`
4. Add environment variables:
   - `DATABASE_URL`: Your Supabase connection string
   - `SECRET_KEY`: Your secret key
   - `ALGORITHM`: `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `1440`
5. Deploy

### Alternative: Render (Free tier)

1. Go to [render.com](https://render.com)
2. New Web Service → Connect GitHub repo
3. Root Directory: `backend`
4. Build: `pip install -r requirements.txt`
5. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## Default Credentials

After running the schema, you can login with:
- **Admin:** admin@ristro.com / admin123

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/signup | Register new user | No |
| POST | /api/auth/login | Login user | No |
| GET | /api/menu | Get all menu items | No |
| POST | /api/menu | Create menu item | Admin |
| PUT | /api/menu/:id | Update menu item | Admin |
| DELETE | /api/menu/:id | Delete menu item | Admin |
| POST | /api/orders | Create order | User |

---

## License

MIT
