import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")

    # Render will provide DATABASE_URL (Postgres). Locally you can use sqlite:///app.db
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///app.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Sessions (cookies)
    SESSION_COOKIE_HTTPONLY = True

    # Cross-site cookies required when frontend + backend are on different domains (Vercel + Render)
    # Must be "None" + Secure for modern browsers over HTTPS.
    SESSION_COOKIE_SAMESITE = "None"
    SESSION_COOKIE_SECURE = True
