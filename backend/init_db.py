from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

def create_test_user():
    # Connect to MongoDB
    client = MongoClient(os.getenv("MONGODB_URL"))
    db = client[os.getenv("DB_NAME", "sparkai")]
    
    # Test user data
    test_user = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "test123",  # In production, this should be hashed
        "full_name": "Test User",
        "disabled": False
    }
    
    # Insert test user
    result = db.users.update_one(
        {"email": "test@example.com"},
        {"$set": test_user},
        upsert=True
    )
    
    print(f"Test user created/updated with email: test@example.com")
    print(f"Password: test123")

if __name__ == "__main__":
    create_test_user()
