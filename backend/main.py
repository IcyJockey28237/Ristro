"""
Ristro Backend — FastAPI Main Application
Entry point for the backend server.
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


from database import engine, get_db, Base
from models import User, MenuItem, Order, OrderItem
from schemas import (
    SignupRequest, LoginRequest, TokenResponse, UserResponse,
    MenuItemResponse, MenuItemCreate, OrderCreate, OrderResponse,
    MenuAvailabilityUpdate, OrderStatusUpdate
)
from auth import hash_password, verify_password, create_access_token, decode_access_token

def require_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_id = int(payload.get("sub"))
    db_user = db.query(User).filter(User.id == user_id).first()

    if not db_user or db_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized as admin")

    return db_user


# ─── Create all tables on startup ────────────────────────────
Base.metadata.create_all(bind=engine)

# ─── App Instance ────────────────────────────────────────────
app = FastAPI(
    title="Ristro API",
    description="Backend API for the Ristro Restaurant & Café app.",
    version="1.0.0",
)

# ─── CORS Middleware (allow React frontend) ──────────────────
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://ristro-baie.vercel.app",
    "https://ristro-baie.vercel.app/",
    "https://ristro-restaurant.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

import logging
from fastapi.responses import JSONResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global error on {request.method} {request.url}: {exc}", exc_info=True)
    # Ensure CORS headers are added to the error response
    response = JSONResponse(
        status_code=500, 
        content={"detail": "Internal Server Error", "message": str(exc)}
    )
    # We can't easily access the middleware-added headers here, 
    # but the browser needs them to see the error detail
    origin = request.headers.get("origin")
    if origin in origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


# ─── Health Check ────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Welcome to Ristro API", "status": "running"}


# ─── SIGN UP ─────────────────────────────────────────────────
@app.post("/api/auth/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """
    Register a new user. Default role is 'customer'.
    Admin roles must be set manually in the database.
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    # Validate password length
    if len(request.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters.",
        )

    # Create user
    new_user = User(
        name=request.name.strip(),
        email=request.email.lower().strip(),
        hashed_password=hash_password(request.password),
        role="customer",  # Always default to customer for security
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ─── LOG IN ──────────────────────────────────────────────────
@app.post("/api/auth/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate a user and return a JWT token with their role.
    """
    # Find user by email
    user = db.query(User).filter(User.email == request.email.lower().strip()).first()

    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create JWT with user info embedded
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role,
        }
    )

    return TokenResponse(
        access_token=access_token,
        role=user.role,
    )


# ─── MENU ────────────────────────────────────────────────────
@app.get("/api/menu", response_model=list[MenuItemResponse])
def get_menu(db: Session = Depends(get_db)):
    """Fetch all menu items that are not deleted."""
    return db.query(MenuItem).filter(MenuItem.is_deleted == False).all()

@app.post("/api/menu", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
def create_menu_item(item: MenuItemCreate, db: Session = Depends(get_db), admin: dict = Depends(require_admin)):
    new_item = MenuItem(**item.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.put("/api/menu/{item_id}", response_model=MenuItemResponse)
def update_menu_item(item_id: int, item: MenuItemCreate, db: Session = Depends(get_db), admin: dict = Depends(require_admin)):
    db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    for key, value in item.model_dump().items():
        setattr(db_item, key, value)

    db.commit()
    db.refresh(db_item)
    return db_item

@app.patch("/api/menu/{item_id}/availability", response_model=MenuItemResponse)
def update_menu_item_availability(item_id: int, request: MenuAvailabilityUpdate, db: Session = Depends(get_db), admin: dict = Depends(require_admin)):
    db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    db_item.available = request.available
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/api/menu/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu_item(item_id: int, db: Session = Depends(get_db), admin: dict = Depends(require_admin)):
    db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Soft delete
    db_item.is_deleted = True
    db.commit()
    return None


# ─── ORDERS ──────────────────────────────────────────────────
@app.post("/api/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(request: OrderCreate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """Submit a new customer order."""
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = int(payload.get("sub"))

    new_order = Order(
        user_id=user_id,
        total_price=request.total_price,
        status="pending",
        table_number=request.table_number
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    for item in request.items:
        order_item = OrderItem(
            order_id=new_order.id,
            menu_item_id=item.menu_item_id,
            quantity=item.quantity,
            price_at_time=item.price_at_time
        )
        db.add(order_item)

    db.commit()
    return new_order

@app.get("/api/orders", response_model=list[OrderResponse])
def get_orders(db: Session = Depends(get_db), admin: dict = Depends(require_admin)):
    """Fetch all orders (Admin only)."""
    return db.query(Order).order_by(Order.created_at.desc()).all()

@app.patch("/api/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, request: OrderStatusUpdate, db: Session = Depends(get_db), admin: dict = Depends(require_admin)):
    """Update order status (Admin only)."""
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    db_order.status = request.status
    db.commit()
    db.refresh(db_order)
    return db_order

@app.delete("/api/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db), admin: dict = Depends(require_admin)):
    """Delete a specific order (Admin only)."""
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(db_order)
    db.commit()
    return None

@app.delete("/api/orders", status_code=status.HTTP_204_NO_CONTENT)
def clear_all_orders(db: Session = Depends(get_db), admin: dict = Depends(require_admin)):
    """Delete all orders and order items (Admin only)."""
    # Delete all items first (though cascade handles it, explicit can be safer for bulk)
    db.query(OrderItem).delete()
    db.query(Order).delete()
    db.commit()
    return None


# ─── Run with: uvicorn main:app --reload ────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


