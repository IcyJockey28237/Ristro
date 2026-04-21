from database import SessionLocal
from models import User
from auth import hash_password

def promote_user(email: str):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.role = "admin"
        db.commit()
        print(f"Successfully promoted {email} to admin!")
    else:
        print(f"User {email} not found. Creating new admin account...")
        new_user = User(
            name="Admin User",
            email=email,
            hashed_password=hash_password("Password123!"),
            role="admin"
        )
        db.add(new_user)
        db.commit()
        print(f"Created new admin account for {email} with password 'Password123!'")

if __name__ == "__main__":
    promote_user("admin@ristro.com")
