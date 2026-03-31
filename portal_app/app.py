import os
from urllib.parse import urlencode
from flask import Flask, render_template, request, redirect, url_for, session, flash
from dotenv import load_dotenv
from shared.db import fetch_user_by_identifier
from shared.auth import verify_password, issue_sso_token

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "dev-session-key")

def launch_target(target: str, token: str):
    target_map = {
        "certidesk": os.getenv("CERTIDESK_SSO_URL"),
        "centraldesk": os.getenv("CENTRALDESK_SSO_URL"),
        "logisdesk": os.getenv("LOGISDESK_SSO_URL"),
    }
    url = target_map.get(target)
    if not url:
        return redirect(url_for("dashboard"))
    return redirect(f"{url}?{urlencode({'token': token})}")

@app.context_processor
def inject_globals():
    return {
        "contact_email": os.getenv("CONTACT_EMAIL", "contacto@integralflex.cl"),
        "whatsapp_number": os.getenv("WHATSAPP_NUMBER", "56942379468"),
    }

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        identifier = request.form.get("identifier", "").strip()
        password = request.form.get("password", "")
        user = fetch_user_by_identifier(identifier)

        if not user:
            flash("Usuario no encontrado.", "error")
            return redirect(url_for("login"))

        if not verify_password(password, user["password_hash"]):
            flash("Credenciales incorrectas.", "error")
            return redirect(url_for("login"))

        session["user"] = {
            "id": user["id"],
            "username": user.get("username"),
            "email": user.get("email"),
            "rut": user.get("rut"),
            "rol": user.get("rol"),
        }
        return redirect(url_for("dashboard"))

    return render_template("login.html")

@app.route("/app")
def dashboard():
    user = session.get("user")
    if not user:
        return redirect(url_for("login"))
    return render_template("app.html", user=user)

@app.route("/sso-launch/<target>")
def sso_launch(target: str):
    user = session.get("user")
    if not user:
        return redirect(url_for("login"))
    token = issue_sso_token(user)
    return launch_target(target, token)

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.getenv("PORT", "5000")))
