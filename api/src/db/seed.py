"""
Seed script — run with: uv run python -m src.db.seed
Populates the DB with the same data as mock-data.ts
"""
import asyncio
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from src.db.setup import sqlalchemy_config
from src.db.models.user import User
from src.db.models.team import Team, TeamMember
from src.db.models.contact import Contact
from src.db.models.session import OutreachSession
from src.services.auth_service import hash_password

# Fixed deterministic UUIDs so FK relationships are stable
def uid(key: str) -> uuid.UUID:
    return uuid.uuid5(uuid.NAMESPACE_DNS, key)


# ── Users ──────────────────────────────────────────────────────────────
USERS = [
    dict(id=uid("pastor1"), email="pastor@manifest.ke", password="pastor123", role="pastor",
         full_name="Pastor David Kamau", phone="0712000001", location="Nairobi"),
    dict(id=uid("admin1"), email="admin@manifest.ke", password="admin123", role="admin",
         full_name="Admin Grace Njeri", phone="0712000002", location="Nairobi"),
    dict(id=uid("e1"), email="evangelist@manifest.ke", password="evangelist123", role="evangelist",
         full_name="John Mwangi", phone="0712000003", location="Westlands"),
    dict(id=uid("e2"), email="sarah.w@manifest.ke", password="sarah123", role="evangelist",
         full_name="Sarah Wanjiku", phone="0712000004", location="CBD"),
    dict(id=uid("e3"), email="peter.n@manifest.ke", password="peter123", role="evangelist",
         full_name="Peter Ndung'u", phone="0712000005", location="Kibera"),
    dict(id=uid("e4"), email="mary.a@manifest.ke", password="mary123", role="evangelist",
         full_name="Mary Akinyi", phone="0712000006", location="Nairobi East"),
    dict(id=uid("e5"), email="james.k@manifest.ke", password="james123", role="evangelist",
         full_name="James Kariuki", phone="0712000007", location="Westlands"),
    dict(id=uid("e6"), email="faith.m@manifest.ke", password="faith123", role="evangelist",
         full_name="Faith Mutua", phone="0712000008", location="CBD"),
    dict(id=uid("e7"), email="samuel.o@manifest.ke", password="samuel123", role="evangelist",
         full_name="Samuel Odhiambo", phone="0712000009", location="Kibera"),
    dict(id=uid("e8"), email="esther.n@manifest.ke", password="esther123", role="evangelist",
         full_name="Esther Njoroge", phone="0712000010", location="Nairobi East"),
]

# ── Teams ──────────────────────────────────────────────────────────────
TEAMS = [
    dict(id=uid("t1"), name="Westlands Outreach", zone="Westlands",
         lead_evangelist_id=uid("e1"), outreach_days=["Monday", "Thursday"],
         active_zones=["Westlands", "Parklands", "Kangemi"]),
    dict(id=uid("t2"), name="CBD Market Ministry", zone="CBD",
         lead_evangelist_id=uid("e2"), outreach_days=["Tuesday", "Friday"],
         active_zones=["CBD", "River Road", "Tom Mboya"]),
    dict(id=uid("t3"), name="Kibera Hope Group", zone="Kibera",
         lead_evangelist_id=uid("e3"), outreach_days=["Wednesday", "Saturday"],
         active_zones=["Kibera", "Olympic", "Mashimoni"]),
    dict(id=uid("t4"), name="Nairobi East Team", zone="Nairobi East",
         lead_evangelist_id=uid("e4"), outreach_days=["Thursday", "Sunday"],
         active_zones=["Eastleigh", "Umoja", "Dandora"]),
]

# ── Team Members ───────────────────────────────────────────────────────
TEAM_MEMBERS = [
    dict(id=uid("tm1"), team_id=uid("t1"), user_id=uid("e1"), team_role="lead"),
    dict(id=uid("tm2"), team_id=uid("t1"), user_id=uid("e5"), team_role="member"),
    dict(id=uid("tm3"), team_id=uid("t1"), user_id=uid("admin1"), team_role="member"),
    dict(id=uid("tm4"), team_id=uid("t2"), user_id=uid("e2"), team_role="lead"),
    dict(id=uid("tm5"), team_id=uid("t2"), user_id=uid("e6"), team_role="member"),
    dict(id=uid("tm6"), team_id=uid("t3"), user_id=uid("e3"), team_role="lead"),
    dict(id=uid("tm7"), team_id=uid("t3"), user_id=uid("e7"), team_role="member"),
    dict(id=uid("tm8"), team_id=uid("t4"), user_id=uid("e4"), team_role="lead"),
    dict(id=uid("tm9"), team_id=uid("t4"), user_id=uid("e8"), team_role="member"),
]

# ── Contacts ───────────────────────────────────────────────────────────
CONTACTS = [
    dict(id=uid("c1"), full_name="Moses Kamau", phone="0723001001", gender="Male",
         age_range="18-25", born_again="Yes", discipleship_status="In Progress",
         baptized="No", location="Westlands", is_student=True, institution="University of Nairobi",
         course="Computer Science", follow_up_method="WhatsApp", status="Actively Discipling",
         tags=["student", "youth"], evangelist_id=uid("e1"), team_id=uid("t1")),
    dict(id=uid("c2"), full_name="Faith Wambui", phone="0723001002", gender="Female",
         age_range="26-35", born_again="Yes", discipleship_status="Done",
         baptized="Yes", location="Westlands", is_student=False,
         follow_up_method="Church Invitation", status="Connected to Church",
         tags=["connected"], evangelist_id=uid("e1"), team_id=uid("t1")),
    dict(id=uid("c3"), full_name="Daniel Ochieng", phone="0723001003", gender="Male",
         age_range="18-25", born_again="No", discipleship_status="Not Started",
         baptized="No", location="CBD", is_student=True, institution="Kenyatta University",
         course="Business", follow_up_method="Call", status="Needs Follow-up",
         tags=["student", "new"], evangelist_id=uid("e2"), team_id=uid("t2")),
    dict(id=uid("c4"), full_name="Grace Njeri", phone="0723001004", gender="Female",
         age_range="36-50", born_again="Yes", discipleship_status="Done",
         baptized="Yes", location="CBD", is_student=False,
         follow_up_method="Visit", status="Connected to Church",
         tags=["elder"], evangelist_id=uid("e2"), team_id=uid("t2")),
    dict(id=uid("c5"), full_name="Samuel Otieno", phone="0723001005", gender="Male",
         age_range="Under 18", born_again="Not Sure", discipleship_status="Not Started",
         baptized="No", location="Kibera", is_student=True,
         follow_up_method="WhatsApp", status="New",
         tags=["youth", "new"], evangelist_id=uid("e3"), team_id=uid("t3")),
    dict(id=uid("c6"), full_name="Esther Auma", phone="0723001006", gender="Female",
         age_range="18-25", born_again="Yes", discipleship_status="In Progress",
         baptized="No", location="Kibera", is_student=False,
         follow_up_method="WhatsApp", status="Actively Discipling",
         tags=["youth"], evangelist_id=uid("e3"), team_id=uid("t3")),
    dict(id=uid("c7"), full_name="Brian Mutua", phone="0723001007", gender="Male",
         age_range="26-35", born_again="Yes", discipleship_status="Done",
         baptized="Yes", location="Eastleigh", is_student=False,
         follow_up_method="Church Invitation", status="Connected to Church",
         tags=[], evangelist_id=uid("e4"), team_id=uid("t4")),
    dict(id=uid("c8"), full_name="Jane Wanjiku", phone="0723001008", gender="Female",
         age_range="18-25", born_again="No", discipleship_status="Not Started",
         baptized="No", location="Eastleigh", is_student=True,
         institution="Multimedia University", course="Media",
         follow_up_method="Call", status="Needs Follow-up",
         tags=["student"], evangelist_id=uid("e4"), team_id=uid("t4")),
    dict(id=uid("c9"), full_name="Kevin Kipkoech", phone="0723001009", gender="Male",
         age_range="18-25", born_again="Yes", discipleship_status="In Progress",
         baptized="No", location="Westlands", is_student=False,
         follow_up_method="WhatsApp", status="Actively Discipling",
         tags=["youth"], evangelist_id=uid("e5"), team_id=uid("t1")),
    dict(id=uid("c10"), full_name="Lydia Chebet", phone="0723001010", gender="Female",
         age_range="26-35", born_again="Yes", discipleship_status="Done",
         baptized="Yes", location="CBD", is_student=False,
         follow_up_method="Church Invitation", status="Connected to Church",
         tags=[], evangelist_id=uid("e6"), team_id=uid("t2")),
    dict(id=uid("c11"), full_name="Tom Mwenda", phone="0723001011", gender="Male",
         age_range="36-50", born_again="Not Sure", discipleship_status="Not Started",
         baptized="No", location="Kibera", is_student=False,
         follow_up_method="Visit", status="Needs Follow-up",
         tags=[], evangelist_id=uid("e7"), team_id=uid("t3")),
    dict(id=uid("c12"), full_name="Alice Moraa", phone="0723001012", gender="Female",
         age_range="18-25", born_again="Yes", discipleship_status="In Progress",
         baptized="No", location="Umoja", is_student=True,
         institution="Strathmore University", course="Law",
         follow_up_method="WhatsApp", status="Actively Discipling",
         tags=["student"], evangelist_id=uid("e8"), team_id=uid("t4")),
]

# ── Outreach Sessions ──────────────────────────────────────────────────
from datetime import date, timedelta
today = date.today()

SESSIONS = [
    dict(id=uid("s1"), date=today - timedelta(days=1), team_id=uid("t1"), location="Westlands CBD",
         evangelists_present=5, contacts_made=18, saved_count=4, prayer_count=12, created_by=uid("e1")),
    dict(id=uid("s2"), date=today - timedelta(days=3), team_id=uid("t2"), location="River Road Market",
         evangelists_present=4, contacts_made=22, saved_count=6, prayer_count=15, created_by=uid("e2")),
    dict(id=uid("s3"), date=today - timedelta(days=5), team_id=uid("t3"), location="Kibera Olympic",
         evangelists_present=6, contacts_made=30, saved_count=8, prayer_count=20, created_by=uid("e3")),
    dict(id=uid("s4"), date=today - timedelta(days=7), team_id=uid("t4"), location="Eastleigh 1st Avenue",
         evangelists_present=4, contacts_made=15, saved_count=3, prayer_count=10, created_by=uid("e4")),
    dict(id=uid("s5"), date=today - timedelta(days=10), team_id=uid("t1"), location="Parklands Shopping",
         evangelists_present=3, contacts_made=12, saved_count=2, prayer_count=8, created_by=uid("e5")),
    dict(id=uid("s6"), date=today - timedelta(days=14), team_id=uid("t2"), location="Tom Mboya Street",
         evangelists_present=5, contacts_made=25, saved_count=7, prayer_count=18, created_by=uid("e2")),
    dict(id=uid("s7"), date=today - timedelta(days=17), team_id=uid("t3"), location="Mashimoni",
         evangelists_present=7, contacts_made=35, saved_count=10, prayer_count=25, created_by=uid("e3")),
    dict(id=uid("s8"), date=today - timedelta(days=21), team_id=uid("t4"), location="Umoja Estate",
         evangelists_present=4, contacts_made=20, saved_count=5, prayer_count=14, created_by=uid("e4")),
]


async def seed():
    async with sqlalchemy_config.get_session() as db:
        # Users
        for u in USERS:
            user = User(
                id=u["id"], email=u["email"],
                password_hash=hash_password(u["password"]),
                role=u["role"], full_name=u["full_name"],
                phone=u["phone"], location=u["location"],
            )
            db.add(user)
        await db.flush()

        # Teams
        for t in TEAMS:
            team = Team(
                id=t["id"], name=t["name"], zone=t["zone"],
                lead_evangelist_id=t["lead_evangelist_id"],
                outreach_days=t["outreach_days"],
                active_zones=t["active_zones"],
            )
            db.add(team)
        await db.flush()

        # Team members
        for tm in TEAM_MEMBERS:
            member = TeamMember(
                id=tm["id"], team_id=tm["team_id"],
                user_id=tm["user_id"], team_role=tm["team_role"],
            )
            db.add(member)
        await db.flush()

        # Contacts
        for c in CONTACTS:
            contact = Contact(
                id=c["id"], full_name=c["full_name"], phone=c["phone"],
                gender=c.get("gender"), age_range=c.get("age_range"),
                born_again=c["born_again"], discipleship_status=c["discipleship_status"],
                baptized=c["baptized"], location=c["location"],
                is_student=c.get("is_student", False),
                institution=c.get("institution"), course=c.get("course"),
                follow_up_method=c["follow_up_method"],
                status=c.get("status", "New"),
                tags=c.get("tags", []),
                evangelist_id=c["evangelist_id"], team_id=c["team_id"],
            )
            db.add(contact)
        await db.flush()

        # Sessions
        for s in SESSIONS:
            session = OutreachSession(
                id=s["id"], date=s["date"], team_id=s["team_id"],
                location=s["location"],
                evangelists_present=s["evangelists_present"],
                contacts_made=s["contacts_made"],
                saved_count=s["saved_count"],
                prayer_count=s["prayer_count"],
                created_by=s["created_by"],
            )
            db.add(session)

        await db.commit()
        print("✓ Seed complete: users, teams, contacts, sessions loaded.")


if __name__ == "__main__":
    # Import all models so create_all registers tables
    import src.db.models.user  # noqa: F401
    import src.db.models.team  # noqa: F401
    import src.db.models.contact  # noqa: F401
    import src.db.models.session  # noqa: F401

    asyncio.run(seed())
