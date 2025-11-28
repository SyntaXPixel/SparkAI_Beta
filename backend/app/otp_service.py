import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from .config import EMAIL_CONFIG, OTP_CONFIG


class OTPService:
    def __init__(self):
        self.smtp_server = EMAIL_CONFIG["SMTP_SERVER"]
        self.smtp_port = EMAIL_CONFIG["SMTP_PORT"]
        self.email_address = EMAIL_CONFIG["EMAIL_ADDRESS"]
        self.email_password = EMAIL_CONFIG["EMAIL_PASSWORD"]
        self.otp_storage = {}
        self.test_mode = False

    def generate_otp(self, length=None):
        if length is None:
            length = OTP_CONFIG["LENGTH"]
        return "".join(random.choices(string.digits, k=length))

    def send_otp_email(self, email, otp):
        if self.test_mode:
            print(f"\n{'=' * 50}")
            print(f"🔐 OTP FOR {email}")
            print(f"📧 Your verification code is: {otp}")
            print(f"⏰ Expires in {OTP_CONFIG['EXPIRY_MINUTES']} minutes")
            print(f"{'=' * 50}\n")
            return True

        try:
            msg = MIMEMultipart()
            msg["From"] = self.email_address
            msg["To"] = email
            msg["Subject"] = "Email Verification OTP"

            body = f"""
            <html>
            <body>
                <h2 style="color: #007bff;" >Nexus Track </h2>
                <h3 style="line-height: 0.2;">Email Verification</h3>
                <p style="line-height: 0.2;">Your verification code is: <strong style="font-size: 20px; color: #007bff;">{otp}</strong></p>
                <p style="line-height: 0.2;">This code will expire in <strong style="color: rgb(239, 0, 0);"> 60 seconds.</strong></p>
                <p style="line-height: 0.1;">If you didn't request this code, please ignore this email.</p>
                <p style="line-height: 1.1;">Best regards,<br>Nexus Track Team</p>
            </body>
            </html>
            """

            msg.attach(MIMEText(body, "html"))

            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.email_address, self.email_password)
            server.sendmail(self.email_address, email, msg.as_string())
            server.quit()

            return True

        except Exception as e:
            print(f"Error sending email: {e}")
            return False

    def create_otp(self, email):
        otp = self.generate_otp()
        expiry_time = datetime.now() + timedelta(minutes=OTP_CONFIG["EXPIRY_MINUTES"])

        self.otp_storage[email] = {
            "otp": otp,
            "expiry": expiry_time,
            "attempts": 0,
        }

        if self.send_otp_email(email, otp):
            return {"success": True, "message": "OTP sent successfully"}
        return {"success": False, "message": "Failed to send OTP"}

    def verify_otp(self, email, otp):
        if email not in self.otp_storage:
            return {"success": False, "message": "No OTP found for this email"}

        stored_data = self.otp_storage[email]

        if datetime.now() > stored_data["expiry"]:
            del self.otp_storage[email]
            return {"success": False, "message": "OTP has expired"}

        if stored_data["attempts"] >= OTP_CONFIG["MAX_ATTEMPTS"]:
            del self.otp_storage[email]
            return {
                "success": False,
                "message": "Too many attempts. Please request a new OTP",
            }

        stored_data["attempts"] += 1

        if stored_data["otp"] == otp:
            del self.otp_storage[email]
            return {"success": True, "message": "OTP verified successfully"}

        return {"success": False, "message": "Invalid OTP"}

    def resend_otp(self, email):
        return self.create_otp(email)


otp_service = OTPService()
