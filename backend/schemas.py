"""
Ristro Backend — Pydantic Schemas
Request/response validation for the API.
"""

from pydantic import BaseModel, EmailStr


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
    available: int = 1

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemResponse(MenuItemBase):
    id: int

    class Config:
        from_attributes = True

# ─── Order Schemas ────────────────────────────────────────────

class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int
    price_at_time: int

class OrderCreate(BaseModel):
    items: list[OrderItemCreate]
    total_price: int

class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_price: int
    status: str

    class Config:
        from_attributes = True
