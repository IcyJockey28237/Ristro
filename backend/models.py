"""
Ristro Backend — Database Models
"""

from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="customer")  # "customer" or "admin"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', role='{self.role}')>"


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    price = Column(Integer, nullable=False)  # Stored in cents, or we can use Float. Let's use Float for simplicity.
    category = Column(String(50), nullable=False) 
    image_url = Column(String(255), nullable=True)
    available = Column(Integer, nullable=False, default=1)  # Boolean alternative (1/0) or just boolean

    def __repr__(self):
        return f"<MenuItem(id={self.id}, title='{self.title}', price={self.price})>"

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_price = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False, default="pending")  # pending, completed, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_at_time = Column(Integer, nullable=False)
