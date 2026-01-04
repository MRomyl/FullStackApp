from datetime import date
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    courses = db.relationship("Course", back_populates="user", cascade="all, delete-orphan")
    sessions = db.relationship("StudySession", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password: str) -> None:
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password: str) -> bool:
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {"id": self.id, "username": self.username}


class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(160), nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    user = db.relationship("User", back_populates="courses")

    sessions = db.relationship(
        "StudySession",
        back_populates="course",
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {"id": self.id, "title": self.title, "user_id": self.user_id}


class StudySession(db.Model):
    __tablename__ = "study_sessions"

    id = db.Column(db.Integer, primary_key=True)
    # store as date (client sends YYYY-MM-DD)
    date = db.Column(db.Date, nullable=False, default=date.today)
    minutes = db.Column(db.Integer, nullable=False, default=30)
    notes = db.Column(db.String(500), nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    user = db.relationship("User", back_populates="sessions")

    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False, index=True)
    course = db.relationship("Course", back_populates="sessions")

    def to_dict(self):
        return {
            "id": self.id,
            "date": self.date.isoformat(),
            "minutes": self.minutes,
            "notes": self.notes,
            "user_id": self.user_id,
            "course_id": self.course_id
        }
