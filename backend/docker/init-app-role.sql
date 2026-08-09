-- Runs once, on first container init, before any migrations. The app must
-- never connect as the POSTGRES_USER bootstrap role -- that role is a
-- superuser, and Postgres unconditionally exempts superusers from Row Level
-- Security (even with FORCE ROW LEVEL SECURITY). This role is the one the
-- running application actually connects as; migrations still run as the
-- superuser bootstrap role so they retain DDL rights.
CREATE ROLE repstack_app WITH LOGIN PASSWORD 'repstack_app';
GRANT CONNECT ON DATABASE repstack TO repstack_app;
GRANT USAGE ON SCHEMA public TO repstack_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO repstack_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO repstack_app;
