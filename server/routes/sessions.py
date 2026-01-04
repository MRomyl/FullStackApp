from datetime import date
from flask import Blueprint, request, session, jsonify
from models import db, StudySession, Course

sessions_bp = Blueprint("sessions_bp", __name__)


def _json_error(message: str, status: int = 400):
    return jsonify({"error": message}), status


def _require_user_id():
    user_id = session.get("user_id")
    if not user_id:
        return None, _json_error("Not logged in", 401)
    return user_id, None


def _parse_date(iso: str):
    try:
        return date.fromisoformat(iso)
    except Exception:
        return None


@sessions_bp.get("")
def list_sessions():
    user_id, err = _require_user_id()
    if err:
        return err

    course_id = request.args.get("course_id", type=int)

    q = StudySession.query.filter_by(user_id=user_id)
    if course_id is not None:
        q = q.filter_by(course_id=course_id)

    sessions_list = q.order_by(StudySession.date.desc(), StudySession.id.desc()).all()
    return jsonify([s.to_dict() for s in sessions_list]), 200


@sessions_bp.post("")
def create_session():
    user_id, err = _require_user_id()
    if err:
        return err

    data = request.get_json(silent=True) or {}

    course_id = data.get("course_id") or data.get("courseId") or data.get("course_id")
    course_id = int(course_id) if course_id is not None else None

    iso_date = data.get("date")
    minutes = data.get("minutes")
    notes = (data.get("notes") or "").strip() or None

    if not course_id:
        return _json_error("course_id is required.", 400)

    course = Course.query.filter_by(id=course_id, user_id=user_id).first()
    if not course:
        return _json_error("Course not found.", 404)

    d = _parse_date(iso_date) if iso_date else None
    if not d:
        return _json_error("Valid date is required (YYYY-MM-DD).", 400)

    try:
        mins = int(minutes)
    except Exception:
        return _json_error("minutes must be a number.", 400)

    if mins <= 0:
        return _json_error("minutes must be greater than 0.", 400)

    study_session = StudySession(
        user_id=user_id,
        course_id=course_id,
        date=d,
        minutes=mins,
        notes=notes
    )

    db.session.add(study_session)
    db.session.commit()
    return jsonify(study_session.to_dict()), 201


@sessions_bp.patch("/<int:session_id>")
def update_session(session_id: int):
    user_id, err = _require_user_id()
    if err:
        return err

    study_session = StudySession.query.filter_by(id=session_id, user_id=user_id).first()
    if not study_session:
        return _json_error("Session not found.", 404)

    data = request.get_json(silent=True) or {}

    if "date" in data:
        d = _parse_date(data.get("date") or "")
        if not d:
            return _json_error("Valid date is required (YYYY-MM-DD).", 400)
        study_session.date = d

    if "minutes" in data:
        try:
            mins = int(data.get("minutes"))
        except Exception:
            return _json_error("minutes must be a number.", 400)
        if mins <= 0:
            return _json_error("minutes must be greater than 0.", 400)
        study_session.minutes = mins

    if "notes" in data:
        notes = (data.get("notes") or "").strip()
        study_session.notes = notes or None

    # Prevent changing ownership/course to other user's course
    if "course_id" in data:
        new_course_id = int(data.get("course_id"))
        course = Course.query.filter_by(id=new_course_id, user_id=user_id).first()
        if not course:
            return _json_error("Course not found.", 404)
        study_session.course_id = new_course_id

    db.session.commit()
    return jsonify(study_session.to_dict()), 200


@sessions_bp.delete("/<int:session_id>")
def delete_session(session_id: int):
    user_id, err = _require_user_id()
    if err:
        return err

    study_session = StudySession.query.filter_by(id=session_id, user_id=user_id).first()
    if not study_session:
        return _json_error("Session not found.", 404)

    db.session.delete(study_session)
    db.session.commit()
    return jsonify({"ok": True}), 200
