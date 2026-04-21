from database import SessionLocal
from models import MenuItem

def restore_menu():
    db = SessionLocal()
    items = db.query(MenuItem).filter(MenuItem.available == 0).all()
    count = 0
    for item in items:
        item.available = 1
        count += 1
    db.commit()
    print(f"Successfully restored {count} original dishes to the menu!")

if __name__ == "__main__":
    restore_menu()
