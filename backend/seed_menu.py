from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import MenuItem, Order, OrderItem, User
from auth import hash_password

def seed_menu():
    # Force recreation of tables to ensure schema matches models
    print("Dropping and recreating tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # --- USERS ---
    users = [
        User(
            name="Admin User",
            email="admin@ristro.com",
            hashed_password=hash_password("admin@Ristro28237"),
            role="admin"
        ),
        User(
            name="Sample Customer",
            email="customer@ristro.com",
            hashed_password=hash_password("customer123"),
            role="customer"
        )
    ]
    db.add_all(users)
    db.commit()

    items = [
        # --- COFFEE & BEVERAGES ---
        MenuItem(
            title="Artisanal Café Latte",
            description="Our signature dark roast espresso blended with steamed micro-foam and intricate fern latte art.",
            price=28000, # ₹280
            category="Coffee",
            image_url="/dishes/coffee_latte.png"
        ),
        MenuItem(
            title="Cold Brew with Salted Caramel",
            description="12-hour steeped cold brew served over ice with a thick layer of salted caramel cold foam.",
            price=32000, # ₹320
            category="Coffee",
            image_url="https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800"
        ),
        MenuItem(
            title="Ceremonial Matcha Latte",
            description="Stone-ground Japanese matcha whisked with creamy oat milk and a hint of organic agave.",
            price=45000, # ₹450
            category="Beverages",
            image_url="https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&q=80&w=800"
        ),
        MenuItem(
            title="Hibiscus Berry Iced Tea",
            description="Refreshing infusion of dried hibiscus flowers, forest berries, and fresh mint leaves.",
            price=24000, # ₹240
            category="Beverages",
            image_url="https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800"
        ),

        # --- BREAKFAST & BRUNCH ---
        MenuItem(
            title="Avocado Sourdough Toast",
            description="Crushed Hass avocado on toasted sourdough, topped with poached eggs, chili flakes, and micro-greens.",
            price=55000, # ₹550
            category="Breakfast",
            image_url="https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800"
        ),
        MenuItem(
            title="Golden Butter Croissant",
            description="Beautifully flaky, golden-brown artisanal butter croissant with crisp layers.",
            price=18000, # ₹180
            category="Pastries",
            image_url="/dishes/croissant.png"
        ),
        MenuItem(
            title="Blueberry Buttermilk Pancakes",
            description="Stack of three fluffy pancakes bursting with fresh blueberries, served with Vermont maple syrup.",
            price=42000, # ₹420
            category="Breakfast",
            image_url="https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&q=80&w=800"
        ),
        MenuItem(
            title="Smoked Salmon Benedict",
            description="Poached eggs and premium smoked salmon on toasted English muffins, draped in silky hollandaise.",
            price=75000, # ₹750
            category="Breakfast",
            image_url="https://images.unsplash.com/photo-1600335895229-6e75511892c8?auto=format&fit=crop&q=80&w=800"
        ),

        # --- STARTERS & SALADS ---
        MenuItem(
            title="Roasted Garlic Hummus Trio",
            description="Smooth hummus in three flavors: Classic, Beetroot, and Roasted Red Pepper. Served with warm pita.",
            price=38000, # ₹380
            category="Starters",
            image_url="https://images.unsplash.com/photo-1577906030551-59758a913697?auto=format&fit=crop&q=80&w=800"
        ),
        MenuItem(
            title="Truffle Parmesan Fries",
            description="Hand-cut russet potatoes tossed in truffle oil, aged parmesan, and fresh chopped parsley.",
            price=32000, # ₹320
            category="Starters",
            image_url="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=800"
        ),
        MenuItem(
            title="Burrata & Heirloom Tomato",
            description="Creamy burrata cheese served with seasonal heirloom tomatoes, balsamic glaze, and basil oil.",
            price=62000, # ₹620
            category="Salads",
            image_url="https://images.unsplash.com/photo-1608897013039-887f3c0cac56?auto=format&fit=crop&q=80&w=800"
        ),

        # --- MAIN COURSES ---
        MenuItem(
            title="Truffle Mushroom Pasta",
            description="Creamy tagliatelle garnished with fresh shaved black truffles and a sprig of parsley.",
            price=85000, # ₹850
            category="Mains",
            image_url="/dishes/pasta_truffle.png"
        ),
        MenuItem(
            title="Pan-Seared Atlantic Salmon",
            description="Crispy-skinned salmon fillet served with lemon-butter asparagus and wild rice pilaf.",
            price=125000, # ₹1250
            category="Mains",
            image_url="https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800"
        ),
        MenuItem(
            title="Signature Wagyu Burger",
            description="Wagyu beef patty, caramelized onions, gruyère cheese, and truffle mayo on a brioche bun.",
            price=145000, # ₹1450
            category="Mains",
            image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800"
        ),
        MenuItem(
            title="Wild Mushroom Risotto",
            description="Slow-cooked Arborio rice with a medley of forest mushrooms, finished with truffle oil and aged pecorino.",
            price=78000, # ₹780
            category="Mains",
            image_url="https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=800"
        ),

        # --- DESSERTS ---
        MenuItem(
            title="New York Style Cheesecake",
            description="Premium cheesecake with a glossy dark berry compote.",
            price=45000, # ₹450
            category="Desserts",
            image_url="/dishes/cheesecake.png"
        ),
        MenuItem(
            title="Molten Chocolate Lava Cake",
            description="Decadent dark chocolate cake with a gooey center, served with vanilla bean gelato.",
            price=48000, # ₹480
            category="Desserts",
            image_url="https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&q=80&w=800"
        ),
        MenuItem(
            title="Classic Tiramisu",
            description="Layers of espresso-soaked ladyfingers and whipped mascarpone cream, dusted with cocoa.",
            price=42000, # ₹420
            category="Desserts",
            image_url="https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=800"
        )
    ]

    db.add_all(items)
    db.commit()
    print("Successfully seeded the database with premium menu items!")

if __name__ == "__main__":
    seed_menu()
