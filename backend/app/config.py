import os
from dotenv import load_dotenv

load_dotenv()

EMAIL_CONFIG = {
    "SMTP_SERVER": os.getenv("SMTP_SERVER", "smtp.gmail.com"),
    "SMTP_PORT": int(os.getenv("SMTP_PORT", "587")),
    "EMAIL_ADDRESS": os.getenv("EMAIL_ADDRESS", "your-email@example.com"),
    "EMAIL_PASSWORD": os.getenv("EMAIL_PASSWORD", "app-password"),
}

OTP_CONFIG = {
    "LENGTH": int(os.getenv("OTP_LENGTH", "6")),
    "EXPIRY_MINUTES": int(os.getenv("OTP_EXPIRY_MINUTES", "5")),
    "MAX_ATTEMPTS": int(os.getenv("OTP_MAX_ATTEMPTS", "3")),
}
