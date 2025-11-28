from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from .otp_service import otp_service
from uuid import uuid4
from typing import List

# Load environment variables
load_dotenv()

# MongoDB setup
MONGODB_URL = os.getenv("MONGODB_URL")
DB_NAME = os.getenv("DB_NAME", "sparkai")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 480))

# Initialize FastAPI
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Models
class User(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    disabled: Optional[bool] = None
    chat_count: int = 0

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class SignUpRequest(BaseModel):
    username: str
    email: str
    password: str

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str
    # Optional fields for profile completion
    name: Optional[str] = None
    phone_number: Optional[str] = None
    course: Optional[str] = None
    branch: Optional[str] = None
    subject: Optional[str] = None
    theme_color: Optional[str] = None
    theme_mode: Optional[str] = None
    profile_image: Optional[str] = None

class ResendOTPRequest(BaseModel):
    email: str

class ForgotPasswordRequest(BaseModel):
    email: str

class VerifyResetOTPRequest(BaseModel):
    email: str
    otp: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

class TodoCreate(BaseModel):
    text: str

class TodoUpdate(BaseModel):
    completed: bool

class TodoResponse(BaseModel):
    id: str
    text: str
    completed: bool
    created_at: datetime

# MongoDB connection
def get_db():
    client = MongoClient(MONGODB_URL)
    db = client[DB_NAME]
    try:
        yield db
    finally:
        client.close()

# Password hashing
def verify_password(plain_password, hashed_password):
    return plain_password == hashed_password

def get_password_hash(password):
    return password

# JWT functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = db.users.find_one({"email": token_data.email})
    if user is None:
        raise credentials_exception
    return user

# Routes
@app.post("/api/auth/login", response_model=Token)
async def login_for_access_token(login_data: LoginRequest, db = Depends(get_db)):
    user = db.users.find_one({"email": login_data.email})

    if not user or not verify_password(login_data.password, user.get("password")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.get("is_verified", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified",
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

import random

# ... (existing imports)

# Helper to generate unique Spark ID
def generate_spark_id(db):
    while True:
        # Generate SPK + 6 random digits
        random_digits = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        spark_id = f"SPK{random_digits}"
        
        # Check if it exists
        if not db.users.find_one({"spark_id": spark_id}):
            return spark_id

@app.post("/api/auth/register")
async def register_user(signup_data: SignUpRequest, db = Depends(get_db)):
    try:
        existing_user = db.users.find_one({"email": signup_data.email})
        hashed_password = get_password_hash(signup_data.password)

        if existing_user:
            if existing_user.get("is_verified", True):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered",
                )
            
            # If re-registering unverified user, ensure they have a spark_id
            spark_id = existing_user.get("spark_id")
            if not spark_id:
                spark_id = generate_spark_id(db)

            try:
                db.users.update_one(
                    {"email": signup_data.email},
                    {
                        "$set": {
                            "username": signup_data.username,
                            "password": hashed_password,
                            "spark_id": spark_id,
                            "is_verified": False,
                            "updated_at": datetime.utcnow(),
                        }
                    },
                )
            except DuplicateKeyError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username not available. Please choose a different one.",
                )
        else:
            spark_id = generate_spark_id(db)
            try:
                db.users.insert_one(
                    {
                        "username": signup_data.username,
                        "email": signup_data.email,
                        "password": hashed_password,
                        "spark_id": spark_id,
                        "is_verified": False,
                        "disabled": False,
                        "chat_count": 0,
                        "created_at": datetime.utcnow(),
                    }
                )
            except DuplicateKeyError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username not available. Please choose a different one.",
                )

        otp_result = otp_service.create_otp(signup_data.email)
        if not otp_result["success"]:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=otp_result["message"],
            )

        return {}
    except Exception as e:
        if "duplicate key error" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username not available. Please choose a different one.",
            )
        raise

@app.post("/api/auth/verify-otp")
async def verify_user_otp(payload: VerifyOTPRequest, db = Depends(get_db)):
    user = db.users.find_one({"email": payload.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # LOGIC FIX: Only check OTP if user is NOT verified.
    # If they are already verified, we assume this is a profile update request.
    if not user.get("is_verified"):
        otp_result = otp_service.verify_otp(payload.email, payload.otp)
        if not otp_result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=otp_result["message"],
            )

    # Prepare update data
    user_update = {
        "is_verified": True,
        "verified_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    # Only add fields if they are provided in the request
    if payload.name: user_update["name"] = payload.name
    if payload.phone_number: user_update["phone_number"] = payload.phone_number
    if payload.course: user_update["course"] = payload.course
    if payload.branch: user_update["branch"] = payload.branch
    if payload.subject: user_update["subject"] = payload.subject
    if payload.theme_color: user_update["theme_color"] = payload.theme_color
    if payload.theme_mode: user_update["theme_mode"] = payload.theme_mode
    if payload.profile_image: user_update["profile_image"] = payload.profile_image

    db.users.update_one(
        {"email": payload.email},
        {"$set": user_update}
    )

    return {"message": "OTP verified and user details saved successfully"}

@app.post("/api/auth/resend-otp")
async def resend_user_otp(payload: ResendOTPRequest, db = Depends(get_db)):
    user = db.users.find_one({"email": payload.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.get("is_verified"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified",
        )

    otp_result = otp_service.resend_otp(payload.email)
    if not otp_result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=otp_result["message"],
        )

    return {"message": "Email resent successfully"}

@app.post("/api/auth/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, db = Depends(get_db)):
    user = db.users.find_one({"email": payload.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address",
        )

    if not user.get("is_verified", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not verified. Please complete registration first.",
        )

    otp_result = otp_service.create_otp(payload.email)
    if not otp_result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=otp_result["message"],
        )

    return {"message": "Password reset OTP sent to your email"}

@app.post("/api/auth/verify-reset-otp")
async def verify_reset_otp(payload: VerifyResetOTPRequest, db = Depends(get_db)):
    user = db.users.find_one({"email": payload.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    otp_result = otp_service.verify_otp(payload.email, payload.otp)
    if not otp_result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=otp_result["message"],
        )

    return {"message": "OTP verified successfully"}

@app.post("/api/auth/reset-password")
async def reset_password(payload: ResetPasswordRequest, db = Depends(get_db)):
    user = db.users.find_one({"email": payload.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Hash the new password
    hashed_password = get_password_hash(payload.new_password)
    
    # Update password in database
    db.users.update_one(
        {"email": payload.email},
        {
            "$set": {
                "password": hashed_password,
                "updated_at": datetime.utcnow()
            }
        }
    )

    return {"message": "Password reset successfully"}

class UserUpdate(BaseModel):
    name: Optional[str] = None
    course: Optional[str] = None
    branch: Optional[str] = None
    subject: Optional[str] = None
    theme_color: Optional[str] = None
    theme_mode: Optional[str] = None
    profile_image: Optional[str] = None
    chat_count: Optional[int] = None

# ... (existing code)

@app.get("/api/users/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    user_data = dict(current_user)
    user_data['_id'] = str(user_data['_id'])
    user_data.pop('password', None)
    user_data.pop('hashed_password', None)
    return user_data

@app.put("/api/users/me")
async def update_user_me(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    
    if not update_data:
        return {"message": "No changes provided"}

    update_data["updated_at"] = datetime.utcnow()

    db.users.update_one(
        {"email": current_user["email"]},
        {"$set": update_data}
    )

    return {"message": "Profile updated successfully"}

@app.get("/api/todos", response_model=List[TodoResponse])
async def get_todos(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    todos_cursor = db.todos.find({"user_email": current_user["email"]}).sort("created_at", -1)
    todos = []
    for todo in todos_cursor:
        todos.append(TodoResponse(
            id=todo["id"],
            text=todo["text"],
            completed=todo["completed"],
            created_at=todo["created_at"]
        ))
    return todos

@app.post("/api/todos", response_model=TodoResponse)
async def create_todo(todo: TodoCreate, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    new_todo = {
        "id": str(uuid4()),
        "user_email": current_user["email"],
        "text": todo.text,
        "completed": False,
        "created_at": datetime.utcnow()
    }
    db.todos.insert_one(new_todo)
    return TodoResponse(**new_todo)

@app.put("/api/todos/{todo_id}", response_model=TodoResponse)
async def update_todo(todo_id: str, todo_update: TodoUpdate, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    result = db.todos.find_one_and_update(
        {"id": todo_id, "user_email": current_user["email"]},
        {"$set": {"completed": todo_update.completed}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Todo not found")
    return TodoResponse(
        id=result["id"],
        text=result["text"],
        completed=result["completed"],
        created_at=result["created_at"]
    )

@app.delete("/api/todos/{todo_id}")
async def delete_todo(todo_id: str, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    result = db.todos.delete_one({"id": todo_id, "user_email": current_user["email"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Todo deleted"}

# Saves Models
class SaveCreate(BaseModel):
    content: str
    bot_type: str = "chat"

class SaveResponse(BaseModel):
    id: str
    content: str
    bot_type: str
    created_at: datetime

# Saves Endpoints
@app.get("/api/saves", response_model=List[SaveResponse])
async def get_saves(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    saves_cursor = db.saves.find({"user_email": current_user["email"]}).sort("created_at", -1)
    saves = []
    for save in saves_cursor:
        saves.append(SaveResponse(
            id=save["id"],
            content=save["content"],
            bot_type=save.get("bot_type", "chat"),
            created_at=save["created_at"]
        ))
    return saves

@app.post("/api/saves", response_model=SaveResponse)
async def create_save(save: SaveCreate, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    new_save = {
        "id": str(uuid4()),
        "user_email": current_user["email"],
        "content": save.content,
        "bot_type": save.bot_type,
        "created_at": datetime.utcnow()
    }
    db.saves.insert_one(new_save)
    return SaveResponse(**new_save)

@app.delete("/api/saves/{save_id}")
async def delete_save(save_id: str, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    result = db.saves.delete_one({"id": save_id, "user_email": current_user["email"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Save not found")
    return {"message": "Save deleted"}

# Friend Models
class AddFriendRequest(BaseModel):
    spark_id: str

class FriendResponse(BaseModel):
    id: str
    name: str
    spark_id: str
    email: str

# Friend Endpoints
@app.post("/api/friends", response_model=FriendResponse)
async def add_friend(friend_req: AddFriendRequest, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    # Find the friend by spark_id
    friend = db.users.find_one({"spark_id": friend_req.spark_id})
    if not friend:
        raise HTTPException(status_code=404, detail="User not found with this ID")
    
    if friend["email"] == current_user["email"]:
        raise HTTPException(status_code=400, detail="You cannot add yourself as a friend")

    # Check if already friends
    current_user_friends = current_user.get("friends", [])
    
    # Check if already in list
    for f in current_user_friends:
        if f["spark_id"] == friend_req.spark_id:
            raise HTTPException(status_code=400, detail="User is already in your friends list")

    new_friend_data = {
        "user_id": str(friend["_id"]),
        "spark_id": friend["spark_id"],
        "name": friend.get("username") or friend.get("full_name") or "Unknown",
        "email": friend["email"]
    }

    # Add to current user's friend list
    db.users.update_one(
        {"email": current_user["email"]},
        {"$push": {"friends": new_friend_data}}
    )
    
    return FriendResponse(
        id=new_friend_data["user_id"],
        name=new_friend_data["name"],
        spark_id=new_friend_data["spark_id"],
        email=new_friend_data["email"]
    )

@app.get("/api/friends", response_model=List[FriendResponse])
async def get_friends(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    # Refresh user data to get latest friends
    user = db.users.find_one({"email": current_user["email"]})
    friends_data = user.get("friends", [])
    return [
        FriendResponse(
            id=f["user_id"],
            name=f["name"],
            spark_id=f["spark_id"],
            email=f["email"]
        ) for f in friends_data
    ]

# Message Models
class MessageCreate(BaseModel):
    receiver_spark_id: str
    content: str
    bot_type: str

class MessageResponse(BaseModel):
    id: str
    sender_id: str
    sender_name: str
    sender_avatar: Optional[str] = None
    receiver_id: str
    receiver_name: str
    receiver_avatar: Optional[str] = None
    content: str
    bot_type: str
    timestamp: datetime

# Message Endpoints
@app.post("/api/messages", response_model=MessageResponse)
async def send_message(message: MessageCreate, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    # Find receiver
    receiver = db.users.find_one({"spark_id": message.receiver_spark_id})
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    new_message = {
        "id": str(uuid4()),
        "sender_id": current_user["spark_id"],
        "sender_name": current_user.get("username") or current_user.get("full_name") or "Unknown",
        "receiver_id": receiver["spark_id"],
        "receiver_name": receiver.get("username") or receiver.get("full_name") or "Unknown",
        "content": message.content,
        "bot_type": message.bot_type,
        "timestamp": datetime.utcnow()
    }
    
    db.messages.insert_one(new_message)
    
    # Return response with avatars (fetched from current state)
    return MessageResponse(
        **new_message,
        sender_avatar=current_user.get("profile_image"),
        receiver_avatar=receiver.get("profile_image")
    )

@app.get("/api/messages", response_model=List[MessageResponse])
async def get_messages(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    user_spark_id = current_user["spark_id"]
    
    # Fetch messages where current user is sender OR receiver
    # AND the message is NOT deleted by them
    messages_cursor = db.messages.find({
        "$or": [
            {
                "sender_id": user_spark_id,
                "sender_deleted": {"$ne": True}
            },
            {
                "receiver_id": user_spark_id,
                "receiver_deleted": {"$ne": True}
            }
        ]
    }).sort("timestamp", -1)
    
    messages = []
    # Cache for user profiles to avoid repeated DB lookups
    user_cache = {}

    def get_user_avatar(spark_id):
        if spark_id in user_cache:
            return user_cache[spark_id]
        
        user = db.users.find_one({"spark_id": spark_id})
        avatar = user.get("profile_image") if user else None
        user_cache[spark_id] = avatar
        return avatar

    for msg in messages_cursor:
        messages.append(MessageResponse(
            id=msg["id"],
            sender_id=msg["sender_id"],
            sender_name=msg["sender_name"],
            sender_avatar=get_user_avatar(msg["sender_id"]),
            receiver_id=msg["receiver_id"],
            receiver_name=msg["receiver_name"],
            receiver_avatar=get_user_avatar(msg["receiver_id"]),
            content=msg["content"],
            bot_type=msg["bot_type"],
            timestamp=msg["timestamp"]
        ))
    return messages

@app.delete("/api/messages/{message_id}")
async def delete_message(message_id: str, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    message = db.messages.find_one({"id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    user_spark_id = current_user["spark_id"]
    
    update_field = None
    if message["sender_id"] == user_spark_id:
        update_field = "sender_deleted"
    elif message["receiver_id"] == user_spark_id:
        update_field = "receiver_deleted"
    else:
        raise HTTPException(status_code=403, detail="Not authorized to delete this message")

    db.messages.update_one(
        {"id": message_id},
        {"$set": {update_field: True}}
    )
    
    return {"message": "Message deleted"}

@app.get("/")
async def root():
    return {"message": "Welcome to the SparkAI API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)