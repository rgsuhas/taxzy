#!/usr/bin/env python3
"""First-run setup CLI for TaxEase AI backend."""
import json
import os
import sys
from pathlib import Path

try:
    import questionary
except ImportError:
    print("Run: pip install questionary")
    sys.exit(1)


ENV_FILE = Path(__file__).parent / ".env"
ENV_EXAMPLE = Path(__file__).parent / ".env.example"


def test_gemini(api_key: str) -> bool:
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content("Reply with just the word: OK")
        return "ok" in response.text.lower()
    except Exception as e:
        print(f"  Gemini ping failed: {e}")
        return False


def test_db(url: str) -> bool:
    try:
        from sqlalchemy import create_engine, text
        engine = create_engine(url, pool_pre_ping=True)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"  DB connection failed: {e}")
        return False


def create_tables(db_url: str):
    os.environ["DATABASE_URL"] = db_url
    sys.path.insert(0, str(Path(__file__).parent))
    from core.database import Base, engine
    import models.user, models.conversation, models.message  # noqa: F401
    import models.tax_profile, models.document, models.marketplace  # noqa: F401
    Base.metadata.create_all(bind=engine)
    print("  Database tables created.")


def create_admin(db_url: str, username: str, password: str):
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from core.security import hash_password
    from models.user import User

    engine = create_engine(db_url)
    Session = sessionmaker(bind=engine)
    db = Session()
    existing = db.query(User).filter(User.username == username).first()
    if existing:
        print(f"  User '{username}' already exists — skipping.")
    else:
        user = User(username=username, hashed_password=hash_password(password))
        db.add(user)
        db.commit()
        print(f"  Admin user '{username}' created.")
    db.close()


def write_env(config: dict):
    lines = []
    for key, value in config.items():
        lines.append(f"{key}={value}")
    ENV_FILE.write_text("\n".join(lines) + "\n")
    print(f"  .env written to {ENV_FILE}")


def main():
    print("\n=== TaxEase AI — First-Run Setup ===\n")

    if ENV_FILE.exists():
        overwrite = questionary.confirm(".env already exists. Overwrite?", default=False).ask()
        if not overwrite:
            print("Keeping existing .env. Running table creation only.")
            from dotenv import load_dotenv
            load_dotenv(ENV_FILE)
            db_url = os.getenv("DATABASE_URL", "")
            if db_url:
                create_tables(db_url)
            print("\nSetup complete. Run: uvicorn main:app --reload")
            return

    # Gemini API Key
    gemini_key = questionary.text(
        "Gemini API Key (get from https://aistudio.google.com/app/apikey):",
        validate=lambda v: len(v) > 10 or "Key too short",
    ).ask()

    print("  Testing Gemini connection...")
    if test_gemini(gemini_key):
        print("  Gemini connection OK.")
    else:
        proceed = questionary.confirm("Gemini ping failed. Continue anyway?", default=True).ask()
        if not proceed:
            sys.exit(1)

    # Database URL
    db_url = questionary.text(
        "PostgreSQL URL:",
        default="postgresql://postgres:password@localhost:5432/taxease",
    ).ask()

    print("  Testing database connection...")
    if test_db(db_url):
        print("  Database connection OK.")
    else:
        proceed = questionary.confirm("DB connection failed. Continue anyway?", default=False).ask()
        if not proceed:
            sys.exit(1)

    # JWT Secret
    import secrets
    default_jwt = secrets.token_hex(32)
    jwt_secret = questionary.text(
        "JWT Secret (leave blank for auto-generated):",
        default=default_jwt,
    ).ask()

    # Setu API Key (optional)
    setu_key = questionary.text(
        "Setu PAN API Key (optional, press Enter to skip — mock verification will be used):",
        default="",
    ).ask()

    # Admin user
    admin_username = questionary.text("Admin username:", default="admin").ask()
    admin_password = questionary.password(
        "Admin password:",
        validate=lambda v: len(v) >= 8 or "Password must be at least 8 characters",
    ).ask()

    config = {
        "DATABASE_URL": db_url,
        "GEMINI_API_KEY": gemini_key,
        "JWT_SECRET": jwt_secret,
        "JWT_ALGORITHM": "HS256",
        "JWT_EXPIRY_HOURS": "24",
        "SETU_API_KEY": setu_key,
        "SETU_API_URL": "https://dg-sandbox.setu.co",
    }

    write_env(config)

    print("\n  Creating database tables...")
    create_tables(db_url)

    print(f"\n  Creating admin user '{admin_username}'...")
    create_admin(db_url, admin_username, admin_password)

    print("\n=== Setup Complete ===")
    print("Run the server with:")
    print("  cd backend && uvicorn main:app --reload")
    print("\nSwagger docs will be available at: http://localhost:8000/docs")


if __name__ == "__main__":
    main()
