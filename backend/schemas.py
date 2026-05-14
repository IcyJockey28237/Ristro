"""
Ristro Backend — Pydantic Schemas
Request/response validation for the API.
"""

from pydantic import BaseModel, EmailStr
from datetime import datetime


# ─── Auth Schemas ─────────────────────────────────────────────

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True

# ─── Menu Schemas ─────────────────────────────────────────────

class MenuItemBase(BaseModel):
    title: str
    description: str | None = None
    price: int
    category: str
    image_url: str | None = None
    available: bool = True

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemResponse(MenuItemBase):
    id: int
    is_deleted: bool

    class Config:
        from_attributes = True

class MenuAvailabilityUpdate(BaseModel):
    available: bool

# ─── Order Schemas ────────────────────────────────────────────

class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int
    price_at_time: int

class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    menu_item_id: int
    quantity: int
    price_at_time: int
    menu_item: MenuItemResponse | None = None

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    items: list[OrderItemCreate]
    total_price: int
    table_number: str | None = None

class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_price: int
    status: str
    table_number: str | None = None
    created_at: datetime
    items: list[OrderItemResponse] = []

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str
