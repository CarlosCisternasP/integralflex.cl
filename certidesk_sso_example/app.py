import os
from flask import Flask, request, session, redirect, url_for
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from dotenv import load_dotenv
from shared.db import fetch_user_by_rut
from shared.auth import decode_sso_token

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "dev-session-key")

login_manager = LoginManager()
login_manager.init_app(app)

class User(UserMixin):
    def __init__(self, row):
        self.id = str(row["id"])
        self.username = row.get("username")
        self.email = row.get("email")
        self.rut = row.get("rut")
        self.rol = row.get("rol")

@login_manager.user_loader
def load_user(user_id):
    return None

@app.route("/")
def home():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    return "<h1>CertiDesk</h1><p>Usa /sso/login?token=...</p>"

@app.route("/sso/login")
def sso_login():
    token = request.args.get("token")
    if not token:
        return "Token faltante", 400
    try:
        payload = decode_sso_token(token)
    except Exception as exc:
        return f"Token inválido o expirado: {exc}", 401

    user_row = fetch_user_by_rut(payload["rut"])
    if not user_row:
        return "Usuario no existe en este sistema", 403

    user = User(user_row)
    login_user(user)
    session["sso"] = True
    return redirect(url_for("dashboard"))

@app.route("/dashboard")
@login_required
def dashboard():
    return f"<h1>CertiDesk Dashboard</h1><p>Bienvenido {current_user.username or current_user.email} | RUT: {current_user.rut}</p><p><a href='/logout'>Logout</a></p>"

@app.route("/logout")
@login_required
def logout():
    logout_user()
    session.clear()
    return redirect(url_for("home"))

if __name__ == "__main__":
    app.run(debug=True, port=5001)
