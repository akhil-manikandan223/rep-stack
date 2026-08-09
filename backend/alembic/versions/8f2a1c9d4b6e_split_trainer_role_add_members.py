"""split trainer role, add staff availability, add members table

Revision ID: 8f2a1c9d4b6e
Revises: 306d78b7eb3d
Create Date: 2026-08-09 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '8f2a1c9d4b6e'
down_revision: Union[str, Sequence[str], None] = '306d78b7eb3d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Postgres can't add an enum value and use it in the same transaction --
    # autocommit_block() runs these outside the migration's normal transaction.
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'general_coach'")
        op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'personal_trainer'")

    # Existing trainers default to the least-privileged of the two new roles;
    # promotable to personal_trainer later via the Staff screen. Postgres has
    # no DROP VALUE for enum types, so the now-unused 'trainer' label stays.
    op.execute("UPDATE users SET role = 'general_coach' WHERE role = 'trainer'")

    staff_availability = postgresql.ENUM(
        'available', 'off_shift', name='staff_availability', create_type=False,
    )
    staff_availability.create(op.get_bind())
    op.add_column('users', sa.Column('availability_status', staff_availability, nullable=True))

    member_status = postgresql.ENUM(
        'active', 'frozen', 'cancelled', name='member_status', create_type=False,
    )
    member_status.create(op.get_bind())
    op.create_table(
        'members',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('tenant_id', sa.Uuid(), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('status', member_status, nullable=False),
        sa.Column('has_pt_plan', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('assigned_trainer_id', sa.Uuid(), nullable=True),
        sa.Column('join_date', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(
            ['assigned_trainer_id'], ['users.id'],
            name=op.f('fk_members_assigned_trainer_id_users'), ondelete='SET NULL',
        ),
        sa.ForeignKeyConstraint(
            ['tenant_id'], ['tenants.id'],
            name=op.f('fk_members_tenant_id_tenants'), ondelete='CASCADE',
        ),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_members')),
    )
    op.create_index(op.f('ix_members_tenant_id'), 'members', ['tenant_id'], unique=False)

    # --- Row Level Security, same pattern as users/tenant_features/audit_logs. ---
    op.execute("ALTER TABLE members ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE members FORCE ROW LEVEL SECURITY")
    op.execute(
        """
        CREATE POLICY tenant_isolation ON members
        USING (
            current_setting('app.bypass_rls', true) = 'true'
            OR tenant_id::text = current_setting('app.tenant_id', true)
        )
        """
    )


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS tenant_isolation ON members")
    op.drop_index(op.f('ix_members_tenant_id'), table_name='members')
    op.drop_table('members')
    op.execute("DROP TYPE IF EXISTS member_status")

    op.drop_column('users', 'availability_status')
    op.execute("DROP TYPE IF EXISTS staff_availability")

    # Best-effort revert -- loses the distinction between the two new roles,
    # since Postgres has no DROP VALUE to remove them from the enum type.
    op.execute("UPDATE users SET role = 'trainer' WHERE role IN ('general_coach', 'personal_trainer')")
