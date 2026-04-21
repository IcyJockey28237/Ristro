from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import MenuItem

def seed_menu():
    # Make sure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if we already seeded
    if db.query(MenuItem).count() > 0:
        print("Menu already seeded!")
        return

    items = [
        MenuItem(
            title="Artisanal Café Latte",
            description="Our signature dark roast espresso blended with steamed micro-foam and intricate fern latte art.",
            price=450,  # $4.50
            category="Coffee",
            image_url="/dishes/coffee_latte.png"
        ),
        MenuItem(
            title="Golden Butter Croissant",
            description="Beautifully flaky, golden-brown artisanal butter croissant with crisp layers.",
            price=500,  # $5.00
            category="Pastries",
            image_url="/dishes/croissant.png"
        ),
        MenuItem(
            title="Truffle Mushroom Pasta",
            description="Creamy tagliatelle garnished with fresh shaved black truffles and a sprig of parsley.",
            price=2200,  # $22.00
            category="Mains",
            image_url="/dishes/pasta_truffle.png"
        ),
        MenuItem(
            title="New York Style Cheesecake",
            description="Premium cheesecake with a glossy dark berry compote.",
            price=850,  # $8.50
            category="Desserts",
            image_url="/dishes/cheesecake.png"
        )
    ]

    db.add_all(items)
    db.commit()
    print("Successfully seeded the database with premium menu items!")

if __name__ == "__main__":
    seed_menu()
