from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Runtime app connection -- a non-superuser role, so Postgres RLS actually applies.
    database_url: str = "postgresql+asyncpg://repstack_app:repstack_app@localhost:5434/repstack"
    # Migrations need DDL rights, so they run as the superuser bootstrap role instead.
    migrations_database_url: str = "postgresql+asyncpg://repstack:repstack@localhost:5434/repstack"
    jwt_secret: str = "change-me-to-a-long-random-string"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    root_domain: str = "lvh.me"
    # Secure cookies require HTTPS -- disable only for plain-HTTP local dev.
    cookie_secure: bool = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
