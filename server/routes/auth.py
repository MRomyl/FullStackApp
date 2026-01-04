from flask import Blueprint, request, session, jsonify
from models import db, User

auth_bp = Blueprint("auth_bp", __name__)


def _json_error(message: str, status: int = 400):
    return jsonify({"error": message}), status


@auth_bp.get("/me")
def me():
    user_id = session.get("user_id")
    if not user_id:
        return _json_error("Not logged in", 401)

    user = db.session.get(User, user_id)
    if not user:
        session.clear()
        return _json_error("Not logged in", 401)

    return jsonify(user.to_dict()), 200


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return _json_error("Username and password are required.", 400)

    existing = User.query.filter_by(username=username).first()
    if existing:
        return _json_error("Username is already taken.", 409)

    user = User(username=username)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    session["user_id"] = user.id
    return jsonify(user.to_dict()), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return _json_error("Username and password are required.", 400)

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return _json_error("Invalid username or password.", 401)

    session["user_id"] = user.id
    return jsonify(user.to_dict()), 200


@auth_bp.post("/logout")
def logout():
    session.clear()
    return jsonify({"ok": True}), 200
