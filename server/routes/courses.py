from flask import Blueprint, request, session, jsonify
from models import db, Course

courses_bp = Blueprint("courses_bp", __name__)


def _json_error(message: str, status: int = 400):
    return jsonify({"error": message}), status


def _require_user_id():
    user_id = session.get("user_id")
    if not user_id:
        return None, _json_error("Not logged in", 401)
    return user_id, None


@courses_bp.get("")
def list_courses():
    user_id, err = _require_user_id()
    if err:
        return err

    courses = Course.query.filter_by(user_id=user_id).order_by(Course.id.desc()).all()
    return jsonify([c.to_dict() for c in courses]), 200


@courses_bp.post("")
def create_course():
    user_id, err = _require_user_id()
    if err:
        return err

    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    if not title:
        return _json_error("Title is required.", 400)

    course = Course(title=title, user_id=user_id)
    db.session.add(course)
    db.session.commit()
    return jsonify(course.to_dict()), 201


@courses_bp.get("/<int:course_id>")
def get_course(course_id: int):
    user_id, err = _require_user_id()
    if err:
        return err

    course = Course.query.filter_by(id=course_id, user_id=user_id).first()
    if not course:
        return _json_error("Course not found.", 404)

    return jsonify(course.to_dict()), 200


@courses_bp.patch("/<int:course_id>")
def update_course(course_id: int):
    user_id, err = _require_user_id()
    if err:
        return err

    course = Course.query.filter_by(id=course_id, user_id=user_id).first()
    if not course:
        return _json_error("Course not found.", 404)

    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    if title:
        course.title = title

    db.session.commit()
    return jsonify(course.to_dict()), 200


@courses_bp.delete("/<int:course_id>")
def delete_course(course_id: int):
    user_id, err = _require_user_id()
    if err:
        return err

    course = Course.query.filter_by(id=course_id, user_id=user_id).first()
    if not course:
        return _json_error("Course not found.", 404)

    # cascade deletes sessions via relationship config
    db.session.delete(course)
    db.session.commit()
    return jsonify({"ok": True}), 200
