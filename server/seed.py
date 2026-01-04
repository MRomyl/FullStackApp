from app import app
from models import db, User, Course, StudySession
from datetime import date

with app.app_context():
    print("Seeding database...")

    StudySession.query.delete()
    Course.query.delete()
    User.query.delete()
    db.session.commit()

    user = User(username="demo")
    user.set_password("demo")
    db.session.add(user)
    db.session.commit()

    c1 = Course(title="Biology", user_id=user.id)
    c2 = Course(title="History", user_id=user.id)
    db.session.add_all([c1, c2])
    db.session.commit()

    s1 = StudySession(user_id=user.id, course_id=c1.id, date=date.today(), minutes=45, notes="Cells & organelles")
    s2 = StudySession(user_id=user.id, course_id=c2.id, date=date.today(), minutes=30, notes="Cold War timeline")
    db.session.add_all([s1, s2])
    db.session.commit()

    print("Seed complete. Login: demo / demo")
