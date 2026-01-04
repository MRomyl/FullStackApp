from flask import Flask, jsonify, request, session
from flask_migrate import Migrate
from flask_cors import CORS

from config import Config
from models import db, bcrypt

from routes.auth import auth_bp
from routes.courses import courses_bp
from routes.sessions import sessions_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # DB / migrations / hashing
    db.init_app(app)
    bcrypt.init_app(app)
    Migrate(app, db)

    # ✅ IMPORTANT: allow your Vercel frontend to call this API + send cookies
    allowed_origins = [
        "https://studybuddy-sooty-one.vercel.app"
        # If you use a custom domain later, add it here too.
        # "https://yourdomain.com"
    ]

    CORS(
        app,
        supports_credentials=True,
        origins=allowed_origins,
        allow_headers=["Content-Type"],
        methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    )

    # Helpful health route
    @app.get("/api/health")
    def health():
        return jsonify({"ok": True}), 200

    # OPTIONAL: make root not confusing (so base URL isn't 404)
    @app.get("/")
    def root():
        return jsonify({"message": "API running. Try /api/health"}), 200

    # Blueprints (namespaced)
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(courses_bp, url_prefix="/api/courses")
    app.register_blueprint(sessions_bp, url_prefix="/api/sessions")

    return app


app = create_app()

if __name__ == "__main__":
    app.run(port=5555, debug=True)
