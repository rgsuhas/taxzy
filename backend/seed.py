import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from core.database import engine
from models.user import User
from models.tax_profile import TaxProfile
from models.conversation import Conversation
from models.message import Message
from models.document import Document
from models.marketplace import Redemption

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def dt(days_ago=0, hours_ago=0):
    return datetime.now(timezone.utc) - timedelta(days=days_ago, hours=hours_ago)


def main():
    with Session(engine) as db:
        existing = db.query(User).count()
        if existing:
            print(f"DB already has {existing} users — skipping seed. Drop tables first to re-seed.")
            return

        users_data = [
            ("demo",   "demo1234",   "Rahul Sharma", "1990-04-15", "salaried",   "ABCDE1234F", True),
            ("priya",  "priya1234",  "Priya Mehta",  "1988-07-22", "freelancer", "PQRST5678G", True),
            ("amit",   "amit1234",   "Amit Verma",   "1995-01-10", "both",       "LMNOP9012H", False),
            ("sneha",  "sneha1234",  "Sneha Joshi",  "1992-11-05", "salaried",   None,         False),
            ("rajesh", "rajesh1234", "Rajesh Kumar", "1985-03-30", "salaried",   "XYZAB3456I", True),
        ]

        users = []
        for uname, raw_pw, name, dob, ftype, pan, pan_verified in users_data:
            u = User(username=uname, hashed_password=pwd.hash(raw_pw[:72]), created_at=dt(days_ago=30))
            db.add(u)
            users.append((u, name, dob, ftype, pan, pan_verified))
        db.flush()

        profiles = [
            (1200000, 85000,  {"80c": 150000, "80d": 25000, "hra": 120000}, "old", "2024-25"),
            (1800000, 210000, {"80c": 50000,  "80d": 15000, "hra": None},   "new", "2024-25"),
            (950000,  45000,  {"80c": 100000, "80d": 20000, "hra": 60000},  "old", "2024-25"),
            (650000,  30000,  {"80c": 80000,  "80d": None,  "hra": None},   "new", "2024-25"),
            (2200000, 320000, {"80c": 150000, "80d": 50000, "hra": 180000}, "old", "2024-25"),
        ]

        for (u, name, dob, ftype, pan, pan_verified), (income, tds, ded, regime, ay) in zip(users, profiles):
            db.add(TaxProfile(
                user_id=u.id, pan=pan, pan_verified=pan_verified,
                full_name=name, dob=dob, filing_type=ftype, ay=ay,
                gross_income=income, tds_paid=tds,
                deductions=ded, regime=regime,
                updated_at=dt(days_ago=5),
            ))
        db.flush()

        demo_user = users[0][0]
        conv_data = [
            (20, [
                ("user",      "Hi, I need to file my taxes for this year."),
                ("assistant", "Hey! Welcome to Taxzy 😊 Are you filing as a salaried employee, freelancer, or both?"),
                ("user",      "I'm salaried. My CTC is 12 lakhs."),
                ("assistant", "Got it — ₹12,00,000 gross income. Has your employer deducted any TDS? Check Form 16 or AIS."),
                ("user",      "Yes, about 85,000 was deducted as TDS."),
                ("assistant", "Perfect — ₹85,000 TDS noted. Do you have any 80C investments like PF, ELSS, or LIC?"),
            ]),
            (10, [
                ("user",      "I invested 1.5 lakh in PPF and 25000 in health insurance."),
                ("assistant", "Great — ₹1,50,000 under 80C (maxed out!) and ₹25,000 under 80D. Do you pay rent?"),
                ("user",      "Yes, 10k per month in Bangalore."),
                ("assistant", "₹1,20,000 annual rent noted for HRA. Which tax regime do you prefer — old or new?"),
                ("user",      "I'm not sure, which is better for me?"),
                ("assistant", "Based on your profile, the Old Regime saves you more — your deductions total ₹2,95,000 which reduces taxable income significantly. Want me to show the full comparison?"),
            ]),
            (2, [
                ("user",      "What is Form 26AS?"),
                ("assistant", "Form 26AS is your annual tax statement from the Income Tax Department. It shows all TDS deducted on your income, advance tax paid, and any refunds received. You can download it from the IT portal under 'Annual Information Statement'."),
            ]),
        ]

        for days_ago, msgs in conv_data:
            conv = Conversation(user_id=demo_user.id, created_at=dt(days_ago=days_ago))
            db.add(conv)
            db.flush()
            for i, (role, content) in enumerate(msgs):
                db.add(Message(
                    conversation_id=conv.id, role=role, content=content,
                    created_at=dt(days_ago=days_ago, hours_ago=-(i * 2)),
                ))

        for doc_type, filename, parsed in [
            ("form16_pdf",  "Form16_FY2024-25_Rahul.pdf", {"employer": "Infosys Ltd", "gross_salary": 1200000, "tds": 85000}),
            ("ais_json",    "AIS_2024-25_Rahul.json",     {"total_tds": 85000, "interest_income": 12000}),
            ("form26as_pdf","Form26AS_Rahul.pdf",          {"tds_entries": 3, "total_tds": 85000}),
        ]:
            db.add(Document(user_id=demo_user.id, doc_type=doc_type, filename=filename,
                            raw_blob=None, parsed_data=parsed, uploaded_at=dt(days_ago=7)))

        for offer_id, voucher, amount, days_ago in [
            ("cleartax_50off", "CLEAR-TXZY-4821", 499.0, 15),
            ("hdfc_cashback",  "HDFC-CB-7743",    200.0, 8),
        ]:
            db.add(Redemption(user_id=demo_user.id, offer_id=offer_id, voucher_code=voucher,
                              amount=amount, redeemed_at=dt(days_ago=days_ago)))

        db.commit()
        print("Seeded: 5 users, 5 tax profiles, 3 conversations, 8 messages, 3 documents, 2 redemptions")
        print("Demo login: username=demo  password=demo1234")


if __name__ == "__main__":
    main()
