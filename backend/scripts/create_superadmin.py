"""Bootstrap the first super-admin user.

There's no tenant-admin UI to create this account from -- it has to be
inserted directly. Run from backend/: python -m scripts.create_superadmin
"""

import argparse
import asyncio
import getpass

from sqlalchemy import select, text

from app.core.security import hash_password
from app.db.base import AsyncSessionLocal
from app.models.user import User


async def create_superadmin(email: str, password: str) -> None:
    async with AsyncSessionLocal() as db:
        await db.execute(text("SET LOCAL app.bypass_rls = 'true'"))
        existing = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
        if existing is not None:
            print(f"A user with email {email} already exists.")
            return

        user = User(email=email, hashed_password=hash_password(password), is_super_admin=True)
        db.add(user)
        await db.commit()
        print(f"Super-admin created: {email} (id={user.id})")


def main() -> None:
    parser = argparse.ArgumentParser(description="Create the first super-admin user.")
    parser.add_argument("--email")
    parser.add_argument("--password")
    args = parser.parse_args()

    email = args.email or input("Super-admin email: ").strip()
    password = args.password or getpass.getpass("Super-admin password: ")

    asyncio.run(create_superadmin(email, password))


if __name__ == "__main__":
    main()
