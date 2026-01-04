from flask import Flask, jsonify
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

    # DB / crypto
    db.init_app(app)
    bcrypt.init_app(app)
    Migrate(app, db)

    # CORS: with Vite proxy you *won't* need this, but it won't hurt.
    # If you deploy separately, set origins to your frontend domain.
    CORS(app, supports_credentials=True)

    # Health check
    @app.get("/api/health")
    def health():
        return jsonify({"ok": True}), 200

    # Register blueprints (namespaced)
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(courses_bp, url_prefix="/api/courses")
    app.register_blueprint(sessions_bp, url_prefix="/api/sessions")

    return app


app = create_app()

if __name__ == "__main__":
    app.run(port=5555, debug=True)
