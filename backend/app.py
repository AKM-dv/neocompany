"""
Service Booking — single-file Flask API (see OVERVIEW.TXT).
"""
from __future__ import annotations

import os
import secrets
import string
import json
import csv
import io
import re
from urllib import parse, request as urlrequest
from datetime import date, datetime, timedelta
from functools import wraps
from pathlib import Path

import bcrypt
import mysql.connector
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory, session
from flask_cors import CORS
from flask_mail import Mail, Message
from werkzeug.utils import secure_filename

load_dotenv(Path(__file__).resolve().parent / ".env")

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp", "svg", "ico"}


def create_app() -> Flask:
    app = Flask(__name__, static_folder=str(BASE_DIR / "static"))
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["SESSION_COOKIE_HTTPONLY"] = True

    app.config["MAIL_SERVER"] = os.environ.get("MAIL_SERVER", "localhost")
    app.config["MAIL_PORT"] = int(os.environ.get("MAIL_PORT", "587"))
    app.config["MAIL_USE_TLS"] = os.environ.get("MAIL_USE_TLS", "True").lower() in (
        "1",
        "true",
        "yes",
    )
    app.config["MAIL_USERNAME"] = os.environ.get("MAIL_USERNAME", "")
    app.config["MAIL_PASSWORD"] = os.environ.get("MAIL_PASSWORD", "")
    app.config["MAIL_DEFAULT_SENDER"] = os.environ.get("MAIL_USERNAME", "noreply@localhost")

    mail = Mail(app)

    # Allow any Origin (regex); required for credentialed requests — "*" alone is invalid with cookies.
    CORS(
        app,
        supports_credentials=True,
        origins=re.compile(r".*"),
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    def get_db():
        return mysql.connector.connect(
            host=os.environ.get("DB_HOST", "localhost"),
            user=os.environ.get("DB_USER", "root"),
            password=os.environ.get("DB_PASSWORD", ""),
            database=os.environ.get("DB_NAME", "service_booking"),
        )

    def ensure_category_columns():
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SHOW COLUMNS FROM categories")
        cols = {r[0] for r in cur.fetchall()}
        if "description" not in cols:
            cur.execute("ALTER TABLE categories ADD COLUMN description TEXT")
        if "image_url" not in cols:
            cur.execute("ALTER TABLE categories ADD COLUMN image_url VARCHAR(255) DEFAULT ''")
        if "priority" not in cols:
            cur.execute("ALTER TABLE categories ADD COLUMN priority INT DEFAULT 0")
        conn.commit()
        cur.close()
        conn.close()

    ensure_category_columns()

    def ensure_service_columns():
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SHOW COLUMNS FROM services")
        cols = {r[0] for r in cur.fetchall()}
        if "image_urls" not in cols:
            cur.execute("ALTER TABLE services ADD COLUMN image_urls LONGTEXT")
        conn.commit()
        cur.close()
        conn.close()

    ensure_service_columns()

    def ensure_location_columns():
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SHOW COLUMNS FROM cities")
        city_cols = {r[0] for r in cur.fetchall()}
        if "state" not in city_cols:
            cur.execute("ALTER TABLE cities ADD COLUMN state VARCHAR(120) DEFAULT ''")
        if "country" not in city_cols:
            cur.execute("ALTER TABLE cities ADD COLUMN country VARCHAR(120) DEFAULT ''")
        if "support_phone" not in city_cols:
            cur.execute("ALTER TABLE cities ADD COLUMN support_phone VARCHAR(40) DEFAULT ''")
        if "city_pincode" not in city_cols:
            cur.execute("ALTER TABLE cities ADD COLUMN city_pincode VARCHAR(20) DEFAULT ''")
        if "base_fee" not in city_cols:
            cur.execute("ALTER TABLE cities ADD COLUMN base_fee DECIMAL(10,2) DEFAULT 0")
        if "min_booking_amount" not in city_cols:
            cur.execute("ALTER TABLE cities ADD COLUMN min_booking_amount DECIMAL(10,2) DEFAULT 0")
        if "avg_eta_minutes" not in city_cols:
            cur.execute("ALTER TABLE cities ADD COLUMN avg_eta_minutes INT DEFAULT 60")
        if "priority" not in city_cols:
            cur.execute("ALTER TABLE cities ADD COLUMN priority INT DEFAULT 0")

        cur.execute("SHOW COLUMNS FROM areas")
        area_cols = {r[0] for r in cur.fetchall()}
        if "postal_code" not in area_cols:
            cur.execute("ALTER TABLE areas ADD COLUMN postal_code VARCHAR(20) DEFAULT ''")
        if "extra_fee" not in area_cols:
            cur.execute("ALTER TABLE areas ADD COLUMN extra_fee DECIMAL(10,2) DEFAULT 0")
        if "avg_eta_minutes" not in area_cols:
            cur.execute("ALTER TABLE areas ADD COLUMN avg_eta_minutes INT DEFAULT 60")
        if "priority" not in area_cols:
            cur.execute("ALTER TABLE areas ADD COLUMN priority INT DEFAULT 0")
        if "notes" not in area_cols:
            cur.execute("ALTER TABLE areas ADD COLUMN notes TEXT")
        conn.commit()
        cur.close()
        conn.close()

    ensure_location_columns()

    def ensure_booking_columns():
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SHOW COLUMNS FROM bookings")
        cols = {r[0] for r in cur.fetchall()}
        if "user_latitude" not in cols:
            cur.execute("ALTER TABLE bookings ADD COLUMN user_latitude DECIMAL(10, 7) NULL")
        if "user_longitude" not in cols:
            cur.execute("ALTER TABLE bookings ADD COLUMN user_longitude DECIMAL(10, 7) NULL")
        conn.commit()
        cur.close()
        conn.close()

    ensure_booking_columns()

    def ensure_blog_table():
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS blogs (
              id INT AUTO_INCREMENT PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              slug VARCHAR(255) NOT NULL UNIQUE,
              meta_description TEXT,
              excerpt TEXT,
              author_name VARCHAR(120) DEFAULT '',
              author_avatar_url VARCHAR(255) DEFAULT '',
              category VARCHAR(100) DEFAULT '',
              tags LONGTEXT,
              featured_image_url VARCHAR(255) DEFAULT '',
              content LONGTEXT,
              read_time_minutes INT DEFAULT 5,
              is_featured TINYINT(1) DEFAULT 0,
              is_published TINYINT(1) DEFAULT 1,
              published_at DATETIME NULL,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()
        cur.close()
        conn.close()

    ensure_blog_table()

    def ensure_bug_reports_table():
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS bug_reports (
              id INT AUTO_INCREMENT PRIMARY KEY,
              description TEXT NOT NULL,
              image_url VARCHAR(255) DEFAULT '',
              page_url VARCHAR(500) DEFAULT '',
              user_agent VARCHAR(500) DEFAULT '',
              status VARCHAR(20) DEFAULT 'open',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()
        cur.close()
        conn.close()

    ensure_bug_reports_table()

    def ensure_contact_messages_table():
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS contact_messages (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(150) NOT NULL,
              email VARCHAR(180) NOT NULL,
              subject VARCHAR(255) DEFAULT '',
              message TEXT NOT NULL,
              page_url VARCHAR(500) DEFAULT '',
              user_agent VARCHAR(500) DEFAULT '',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()
        cur.close()
        conn.close()

    ensure_contact_messages_table()

    def row_to_dict(cur, row):
        if row is None:
            return None
        d = dict(zip([d[0] for d in cur.description], row))
        if "image_urls" in d:
            try:
                parsed = json.loads(d["image_urls"] or "[]")
                d["image_urls"] = parsed if isinstance(parsed, list) else []
            except Exception:
                d["image_urls"] = []
        if "tags" in d:
            try:
                parsed = json.loads(d["tags"] or "[]")
                d["tags"] = parsed if isinstance(parsed, list) else []
            except Exception:
                d["tags"] = []
        return d

    def all_cms_dict():
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT setting_key, setting_value FROM cms_settings")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return {k: (v or "") for k, v in rows}

    def admin_required(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            if not session.get("admin_id"):
                return jsonify({"error": "Unauthorized"}), 401
            return f(*args, **kwargs)

        return wrapped

    @app.route("/uploads/<path:filename>")
    def serve_upload(filename):
        return send_from_directory(UPLOAD_DIR, filename)

    # ------------------------------------------------------------------
    # AUTH
    # ------------------------------------------------------------------
    @app.post("/api/admin/login")
    def admin_login():
        data = request.get_json(silent=True) or {}
        username = (data.get("username") or "").strip()
        password = (data.get("password") or "").encode("utf-8")
        if not username or not password:
            return jsonify({"error": "Username and password required"}), 400
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, password_hash FROM admin_users WHERE username = %s",
            (username,),
        )
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row or not bcrypt.checkpw(password, row[1].encode("utf-8")):
            return jsonify({"error": "Invalid credentials"}), 401
        session["admin_id"] = row[0]
        session["admin_username"] = username
        session.permanent = True
        return jsonify({"ok": True, "username": username})

    @app.post("/api/admin/logout")
    @admin_required
    def admin_logout():
        session.clear()
        return jsonify({"ok": True})

    @app.get("/api/admin/me")
    def admin_me():
        if not session.get("admin_id"):
            return jsonify({"logged_in": False})
        return jsonify(
            {
                "logged_in": True,
                "username": session.get("admin_username"),
            }
        )

    # ------------------------------------------------------------------
    # CMS
    # ------------------------------------------------------------------
    @app.get("/api/cms")
    def get_cms():
        return jsonify(all_cms_dict())

    @app.get("/api/fonts/google")
    def google_fonts():
        api_key = os.environ.get("GOOGLE_FONTS_API_KEY", "").strip()
        if not api_key:
            return (
                jsonify(
                    {
                        "items": [],
                        "error": "GOOGLE_FONTS_API_KEY is not configured",
                    }
                ),
                200,
            )
        try:
            q = parse.urlencode({"key": api_key, "sort": "alpha"})
            with urlrequest.urlopen(
                f"https://www.googleapis.com/webfonts/v1/webfonts?{q}", timeout=10
            ) as res:
                payload = json.loads(res.read().decode("utf-8"))
            items = payload.get("items") or []
            cleaned = []
            for it in items:
                family = (it or {}).get("family")
                if not family:
                    continue
                cleaned.append(
                    {
                        "family": family,
                        "category": (it or {}).get("category", "sans-serif"),
                        "variants": (it or {}).get("variants", []),
                    }
                )
            return jsonify({"items": cleaned})
        except Exception as e:  # noqa: BLE001
            return jsonify({"items": [], "error": str(e)}), 200

    @app.put("/api/admin/cms")
    @admin_required
    def put_cms():
        data = request.get_json(silent=True) or {}
        if not isinstance(data, dict) or not data:
            return jsonify({"error": "Invalid body"}), 400
        conn = get_db()
        cur = conn.cursor()
        for key, value in data.items():
            if not isinstance(key, str) or not key:
                continue
            val = value if isinstance(value, str) else str(value)
            cur.execute(
                """
                INSERT INTO cms_settings (setting_key, setting_value)
                VALUES (%s, %s)
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()
                """,
                (key, val),
            )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify(all_cms_dict())

    @app.post("/api/admin/cms/upload")
    @admin_required
    def cms_upload():
        if "file" not in request.files:
            return jsonify({"error": "No file"}), 400
        f = request.files["file"]
        if not f or not f.filename:
            return jsonify({"error": "Empty file"}), 400
        ext = f.filename.rsplit(".", 1)[-1].lower() if "." in f.filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            return jsonify({"error": "File type not allowed"}), 400
        name = f"{secrets.token_hex(8)}.{ext}"
        path = UPLOAD_DIR / name
        f.save(path)
        # URL relative to API host
        base = request.host_url.rstrip("/")
        return jsonify({"url": f"{base}/uploads/{name}"})

    @app.post("/api/bug-report/upload")
    def bug_report_upload():
        if "file" not in request.files:
            return jsonify({"error": "No file"}), 400
        f = request.files["file"]
        if not f or not f.filename:
            return jsonify({"error": "Empty file"}), 400
        ext = f.filename.rsplit(".", 1)[-1].lower() if "." in f.filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            return jsonify({"error": "File type not allowed"}), 400
        name = f"bug_{secrets.token_hex(8)}.{ext}"
        path = UPLOAD_DIR / name
        f.save(path)
        base = request.host_url.rstrip("/")
        return jsonify({"url": f"{base}/uploads/{name}"})

    @app.post("/api/bug-report")
    def create_bug_report():
        data = request.get_json(silent=True) or {}
        description = (data.get("description") or "").strip()
        if not description:
            return jsonify({"error": "Description is required"}), 400
        image_url = (data.get("image_url") or "").strip()
        page_url = (data.get("page_url") or "").strip()
        user_agent = (request.headers.get("User-Agent") or "")[:500]
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO bug_reports (description, image_url, page_url, user_agent, status)
            VALUES (%s, %s, %s, %s, 'open')
            """,
            (description, image_url, page_url, user_agent),
        )
        conn.commit()
        bug_id = cur.lastrowid
        cur.close()
        conn.close()
        return jsonify({"ok": True, "id": bug_id, "message": "Bug reported successfully"}), 201

    # ------------------------------------------------------------------
    # CATEGORIES
    # ------------------------------------------------------------------
    @app.get("/api/categories")
    def list_categories_public():
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, name, description, image_url, icon_url, priority
            FROM categories
            WHERE is_active = 1
            ORDER BY priority ASC, name ASC
            """
        )
        rows = [row_to_dict(cur, r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return jsonify(rows)

    @app.get("/api/admin/categories")
    @admin_required
    def list_categories_admin():
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, name, description, image_url, icon_url, priority, is_active
            FROM categories
            ORDER BY priority ASC, name ASC
            """
        )
        rows = [row_to_dict(cur, r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return jsonify(rows)

    @app.post("/api/admin/categories")
    @admin_required
    def create_category():
        data = request.get_json(silent=True) or {}
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "Name required"}), 400
        description = (data.get("description") or "").strip()
        image_url = (data.get("image_url") or "").strip()
        icon_url = (data.get("icon_url") or "").strip()
        try:
            priority = int(data.get("priority", 0))
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid priority"}), 400
        service_ids = data.get("service_ids") or []
        if not isinstance(service_ids, list):
            return jsonify({"error": "service_ids must be list"}), 400
        cleaned_service_ids = []
        for sid in service_ids:
            try:
                cleaned_service_ids.append(int(sid))
            except (TypeError, ValueError):
                continue
        is_active = 1 if data.get("is_active", True) else 0
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO categories (name, description, image_url, icon_url, priority, is_active)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (name, description, image_url, icon_url, priority, is_active),
        )
        conn.commit()
        new_id = cur.lastrowid
        if cleaned_service_ids:
            placeholders = ",".join(["%s"] * len(cleaned_service_ids))
            cur.execute(
                f"UPDATE services SET category_id = %s WHERE id IN ({placeholders})",
                [new_id, *cleaned_service_ids],
            )
            conn.commit()
        cur.close()
        conn.close()
        return jsonify({"id": new_id}), 201

    @app.put("/api/admin/categories/<int:cid>")
    @admin_required
    def update_category(cid):
        data = request.get_json(silent=True) or {}
        fields = []
        params = []
        if "name" in data:
            fields.append("name = %s")
            params.append((data.get("name") or "").strip())
        if "description" in data:
            fields.append("description = %s")
            params.append((data.get("description") or "").strip())
        if "image_url" in data:
            fields.append("image_url = %s")
            params.append((data.get("image_url") or "").strip())
        if "icon_url" in data:
            fields.append("icon_url = %s")
            params.append((data.get("icon_url") or "").strip())
        if "priority" in data:
            try:
                fields.append("priority = %s")
                params.append(int(data.get("priority", 0)))
            except (TypeError, ValueError):
                return jsonify({"error": "Invalid priority"}), 400
        if "is_active" in data:
            fields.append("is_active = %s")
            params.append(1 if data.get("is_active") else 0)
        service_ids = data.get("service_ids")
        if service_ids is not None and not isinstance(service_ids, list):
            return jsonify({"error": "service_ids must be list"}), 400
        if not fields and service_ids is None:
            return jsonify({"error": "No fields"}), 400
        conn = get_db()
        cur = conn.cursor()
        if fields:
            params.append(cid)
            cur.execute(
                f"UPDATE categories SET {', '.join(fields)} WHERE id = %s", params
            )
        if service_ids is not None:
            cleaned_service_ids = []
            for sid in service_ids:
                try:
                    cleaned_service_ids.append(int(sid))
                except (TypeError, ValueError):
                    continue
            if cleaned_service_ids:
                placeholders = ",".join(["%s"] * len(cleaned_service_ids))
                cur.execute(
                    f"UPDATE services SET category_id = %s WHERE id IN ({placeholders})",
                    [cid, *cleaned_service_ids],
                )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"ok": True})

    @app.delete("/api/admin/categories/<int:cid>")
    @admin_required
    def delete_category(cid):
        conn = get_db()
        cur = conn.cursor()
        try:
            cur.execute(
                """
                SELECT COUNT(*) FROM booking_items bi
                INNER JOIN services s ON s.id = bi.service_id
                WHERE s.category_id = %s
                """,
                (cid,),
            )
            if cur.fetchone()[0] > 0:
                conn.rollback()
                return jsonify(
                    {
                        "error": (
                            "Cannot delete this category while services in it are referenced "
                            "by bookings. Move services to another category or remove services "
                            "that have no booking history first."
                        ),
                    }
                ), 409

            cur.execute("DELETE FROM categories WHERE id = %s", (cid,))
            conn.commit()
            return jsonify({"ok": True})
        except mysql.connector.Error:
            conn.rollback()
            raise
        finally:
            cur.close()
            conn.close()

    # ------------------------------------------------------------------
    # SERVICES
    # ------------------------------------------------------------------
    @app.get("/api/services")
    def list_services():
        category_id = request.args.get("category_id", type=int)
        conn = get_db()
        cur = conn.cursor()
        if category_id:
            cur.execute(
                """
                SELECT s.id, s.name, s.description, s.price, s.duration_minutes, s.image_url,
                       s.image_urls, s.category_id, c.name AS category_name
                FROM services s
                JOIN categories c ON c.id = s.category_id
                WHERE s.is_active = 1 AND c.is_active = 1 AND s.category_id = %s
                ORDER BY s.name
                """,
                (category_id,),
            )
        else:
            cur.execute(
                """
                SELECT s.id, s.name, s.description, s.price, s.duration_minutes, s.image_url,
                       s.image_urls, s.category_id, c.name AS category_name
                FROM services s
                JOIN categories c ON c.id = s.category_id
                WHERE s.is_active = 1 AND c.is_active = 1
                ORDER BY s.name
                """
            )
        rows = [row_to_dict(cur, r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return jsonify(rows)

    @app.get("/api/services/<int:sid>")
    def get_service(sid):
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT s.id, s.name, s.description, s.price, s.duration_minutes, s.image_url,
                   s.image_urls, s.category_id, c.name AS category_name
            FROM services s
            JOIN categories c ON c.id = s.category_id
            WHERE s.id = %s AND s.is_active = 1 AND c.is_active = 1
            """,
            (sid,),
        )
        row = cur.fetchone()
        if not row:
            cur.close()
            conn.close()
            return jsonify({"error": "Not found"}), 404
        d = row_to_dict(cur, row)
        cur.close()
        conn.close()
        return jsonify(d)

    @app.get("/api/admin/services")
    @admin_required
    def list_services_admin():
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT s.id, s.name, s.description, s.price, s.duration_minutes, s.image_url,
                   s.image_urls, s.category_id, s.is_active, c.name AS category_name
            FROM services s
            JOIN categories c ON c.id = s.category_id
            ORDER BY s.name
            """
        )
        rows = [row_to_dict(cur, r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return jsonify(rows)

    @app.post("/api/admin/services")
    @admin_required
    def create_service():
        data = request.get_json(silent=True) or {}
        try:
            cid = int(data["category_id"])
        except (KeyError, TypeError, ValueError):
            return jsonify({"error": "category_id required"}), 400
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "Name required"}), 400
        desc = data.get("description") or ""
        try:
            price = float(data.get("price", 0))
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid price"}), 400
        try:
            duration = int(data.get("duration_minutes", 60))
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid duration"}), 400
        image_url = (data.get("image_url") or "").strip()
        image_urls = data.get("image_urls") or []
        if not isinstance(image_urls, list):
            return jsonify({"error": "image_urls must be a list"}), 400
        if len(image_urls) > 5:
            return jsonify({"error": "Maximum 5 images allowed"}), 400
        image_urls = [str(u).strip() for u in image_urls if str(u).strip()][:5]
        if image_urls and not image_url:
            image_url = image_urls[0]
        is_active = 1 if data.get("is_active", True) else 0
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO services (category_id, name, description, price, duration_minutes, image_url, image_urls, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (cid, name, desc, price, duration, image_url, json.dumps(image_urls), is_active),
        )
        conn.commit()
        new_id = cur.lastrowid
        cur.close()
        conn.close()
        return jsonify({"id": new_id}), 201

    @app.put("/api/admin/services/<int:sid>")
    @admin_required
    def update_service(sid):
        data = request.get_json(silent=True) or {}
        fields = []
        params = []
        mapping = {
            "name": "name",
            "description": "description",
            "category_id": "category_id",
            "image_url": "image_url",
        }
        for key, col in mapping.items():
            if key in data:
                fields.append(f"{col} = %s")
                params.append(data.get(key))
        if "price" in data:
            try:
                fields.append("price = %s")
                params.append(float(data["price"]))
            except (TypeError, ValueError):
                return jsonify({"error": "Invalid price"}), 400
        if "duration_minutes" in data:
            try:
                fields.append("duration_minutes = %s")
                params.append(int(data["duration_minutes"]))
            except (TypeError, ValueError):
                return jsonify({"error": "Invalid duration"}), 400
        if "is_active" in data:
            fields.append("is_active = %s")
            params.append(1 if data.get("is_active") else 0)
        if "image_urls" in data:
            image_urls = data.get("image_urls") or []
            if not isinstance(image_urls, list):
                return jsonify({"error": "image_urls must be a list"}), 400
            if len(image_urls) > 5:
                return jsonify({"error": "Maximum 5 images allowed"}), 400
            image_urls = [str(u).strip() for u in image_urls if str(u).strip()][:5]
            fields.append("image_urls = %s")
            params.append(json.dumps(image_urls))
            if image_urls and "image_url" not in data:
                fields.append("image_url = %s")
                params.append(image_urls[0])
        if not fields:
            return jsonify({"error": "No fields"}), 400
        params.append(sid)
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"UPDATE services SET {', '.join(fields)} WHERE id = %s", params
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"ok": True})

    @app.delete("/api/admin/services/<int:sid>")
    @admin_required
    def delete_service(sid):
        conn = get_db()
        cur = conn.cursor()
        try:
            cur.execute(
                "SELECT COUNT(*) FROM booking_items WHERE service_id = %s",
                (sid,),
            )
            if cur.fetchone()[0] > 0:
                conn.rollback()
                return jsonify(
                    {
                        "error": (
                            "Cannot delete this service because it appears in one or more bookings."
                        ),
                    }
                ), 409

            cur.execute("DELETE FROM services WHERE id = %s", (sid,))
            conn.commit()
            return jsonify({"ok": True})
        except mysql.connector.Error:
            conn.rollback()
            raise
        finally:
            cur.close()
            conn.close()

    # ------------------------------------------------------------------
    # BLOGS
    # ------------------------------------------------------------------
    @app.get("/api/blogs")
    def list_blogs_public():
        q = (request.args.get("q") or "").strip().lower()
        category = (request.args.get("category") or "").strip()
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, title, slug, meta_description, excerpt, author_name, author_avatar_url,
                   category, tags, featured_image_url, read_time_minutes, is_featured,
                   published_at, updated_at
            FROM blogs
            WHERE is_published = 1
            ORDER BY is_featured DESC, published_at DESC, created_at DESC
            """
        )
        rows = [row_to_dict(cur, r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        if category:
            rows = [r for r in rows if (r.get("category") or "").lower() == category.lower()]
        if q:
            rows = [
                r
                for r in rows
                if q in (r.get("title") or "").lower()
                or q in (r.get("excerpt") or "").lower()
                or q in (r.get("meta_description") or "").lower()
                or any(q in str(t).lower() for t in (r.get("tags") or []))
            ]
        for r in rows:
            for k in ("published_at", "updated_at"):
                if r.get(k) is not None and hasattr(r[k], "isoformat"):
                    r[k] = str(r[k])
        return jsonify(rows)

    @app.get("/api/blogs/<slug>")
    def get_blog_public(slug):
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, title, slug, meta_description, excerpt, author_name, author_avatar_url,
                   category, tags, featured_image_url, content, read_time_minutes, is_featured,
                   published_at, updated_at, created_at
            FROM blogs
            WHERE slug = %s AND is_published = 1
            """,
            (slug,),
        )
        row = cur.fetchone()
        if not row:
            cur.close()
            conn.close()
            return jsonify({"error": "Not found"}), 404
        blog = row_to_dict(cur, row)
        cur.execute(
            """
            SELECT id, title, slug, excerpt, featured_image_url, category, published_at
            FROM blogs
            WHERE is_published = 1 AND slug != %s
              AND (category = %s OR is_featured = 1)
            ORDER BY is_featured DESC, published_at DESC
            LIMIT 3
            """,
            (slug, blog.get("category") or ""),
        )
        related = [row_to_dict(cur, r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        for obj in [blog, *related]:
            for k in ("published_at", "updated_at", "created_at"):
                if obj.get(k) is not None and hasattr(obj[k], "isoformat"):
                    obj[k] = str(obj[k])
        blog["related"] = related
        return jsonify(blog)

    @app.get("/api/admin/blogs")
    @admin_required
    def list_blogs_admin():
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, title, slug, meta_description, excerpt, author_name, author_avatar_url,
                   category, tags, featured_image_url, content, read_time_minutes,
                   is_featured, is_published, published_at, updated_at, created_at
            FROM blogs
            ORDER BY created_at DESC
            """
        )
        rows = [row_to_dict(cur, r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        for r in rows:
            for k in ("published_at", "updated_at", "created_at"):
                if r.get(k) is not None and hasattr(r[k], "isoformat"):
                    r[k] = str(r[k])
        return jsonify(rows)

    @app.post("/api/admin/blogs")
    @admin_required
    def create_blog():
        data = request.get_json(silent=True) or {}
        title = (data.get("title") or "").strip()
        slug = (data.get("slug") or "").strip()
        if not title or not slug:
            return jsonify({"error": "title and slug are required"}), 400
        tags = data.get("tags") or []
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(",") if t.strip()]
        if not isinstance(tags, list):
            return jsonify({"error": "tags must be list or comma-separated string"}), 400
        read_time = data.get("read_time_minutes", 5)
        try:
            read_time = max(1, int(read_time))
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid read_time_minutes"}), 400
        published_at = (data.get("published_at") or "").strip() or datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )
        is_featured = 1 if data.get("is_featured") else 0
        is_published = 1 if data.get("is_published", True) else 0
        conn = get_db()
        cur = conn.cursor()
        try:
            cur.execute(
                """
                INSERT INTO blogs (
                  title, slug, meta_description, excerpt, author_name, author_avatar_url,
                  category, tags, featured_image_url, content, read_time_minutes,
                  is_featured, is_published, published_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    title,
                    slug,
                    (data.get("meta_description") or "").strip(),
                    (data.get("excerpt") or "").strip(),
                    (data.get("author_name") or "").strip(),
                    (data.get("author_avatar_url") or "").strip(),
                    (data.get("category") or "").strip(),
                    json.dumps([str(t).strip() for t in tags if str(t).strip()]),
                    (data.get("featured_image_url") or "").strip(),
                    data.get("content") or "",
                    read_time,
                    is_featured,
                    is_published,
                    published_at,
                ),
            )
            conn.commit()
            new_id = cur.lastrowid
        except mysql.connector.IntegrityError:
            cur.close()
            conn.close()
            return jsonify({"error": "Slug already exists"}), 400
        cur.close()
        conn.close()
        return jsonify({"id": new_id}), 201

    @app.put("/api/admin/blogs/<int:bid>")
    @admin_required
    def update_blog(bid):
        data = request.get_json(silent=True) or {}
        fields = []
        params = []
        mapping = {
            "title": "title",
            "slug": "slug",
            "meta_description": "meta_description",
            "excerpt": "excerpt",
            "author_name": "author_name",
            "author_avatar_url": "author_avatar_url",
            "category": "category",
            "featured_image_url": "featured_image_url",
            "content": "content",
            "published_at": "published_at",
        }
        for key, col in mapping.items():
            if key in data:
                fields.append(f"{col} = %s")
                params.append((data.get(key) or "").strip() if isinstance(data.get(key), str) else data.get(key))
        if "read_time_minutes" in data:
            try:
                fields.append("read_time_minutes = %s")
                params.append(max(1, int(data.get("read_time_minutes", 5))))
            except (TypeError, ValueError):
                return jsonify({"error": "Invalid read_time_minutes"}), 400
        if "is_featured" in data:
            fields.append("is_featured = %s")
            params.append(1 if data.get("is_featured") else 0)
        if "is_published" in data:
            fields.append("is_published = %s")
            params.append(1 if data.get("is_published") else 0)
        if "tags" in data:
            tags = data.get("tags") or []
            if isinstance(tags, str):
                tags = [t.strip() for t in tags.split(",") if t.strip()]
            if not isinstance(tags, list):
                return jsonify({"error": "tags must be list or comma-separated string"}), 400
            fields.append("tags = %s")
            params.append(json.dumps([str(t).strip() for t in tags if str(t).strip()]))
        if not fields:
            return jsonify({"error": "No fields"}), 400
        params.append(bid)
        conn = get_db()
        cur = conn.cursor()
        try:
            cur.execute(f"UPDATE blogs SET {', '.join(fields)} WHERE id = %s", params)
            conn.commit()
        except mysql.connector.IntegrityError:
            cur.close()
            conn.close()
            return jsonify({"error": "Slug already exists"}), 400
        cur.close()
        conn.close()
        return jsonify({"ok": True})

    @app.delete("/api/admin/blogs/<int:bid>")
    @admin_required
    def delete_blog(bid):
        conn = get_db()
        cur = conn.cursor()
        cur.execute("DELETE FROM blogs WHERE id = %s", (bid,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"ok": True})

    # ------------------------------------------------------------------
    # CITIES & AREAS
    # ------------------------------------------------------------------
    @app.get("/api/cities")
    def list_cities():
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, name, state, country, support_phone, base_fee, min_booking_amount,
                   avg_eta_minutes, priority, city_pincode
            FROM cities
            WHERE is_active = 1
            ORDER BY priority ASC, name ASC
            """
        )
        rows = [row_to_dict(cur, r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return jsonify(rows)

    @app.get("/api/areas")
    def list_areas():
        city_id = request.args.get("city_id", type=int)
        if not city_id:
            return jsonify({"error": "city_id required"}), 400
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, name, city_id, postal_code, extra_fee, avg_eta_minutes, priority, notes
            FROM areas
            WHERE city_id = %s AND is_active = 1
            ORDER BY priority ASC, name ASC
            """,
            (city_id,),
        )
        rows = [row_to_dict(cur, r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return jsonify(rows)

    @app.post("/api/admin/cities")
    @admin_required
    def create_city():
        data = request.get_json(silent=True) or {}
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "Name required"}), 400
        state = (data.get("state") or "").strip()
        country = (data.get("country") or "").strip()
        support_phone = (data.get("support_phone") or "").strip()
        city_pincode = (data.get("city_pincode") or "").strip()
        try:
            base_fee = float(data.get("base_fee", 0) or 0)
            min_booking_amount = float(data.get("min_booking_amount", 0) or 0)
            avg_eta_minutes = int(data.get("avg_eta_minutes", 60) or 60)
            priority = int(data.get("priority", 0) or 0)
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid numeric field"}), 400
        is_active = 1 if data.get("is_active", True) else 0
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO cities (
              name, state, country, support_phone, base_fee, min_booking_amount,
              avg_eta_minutes, priority, city_pincode, is_active
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                name,
                state,
                country,
                support_phone,
                base_fee,
                min_booking_amount,
                avg_eta_minutes,
                priority,
                city_pincode,
                is_active,
            ),
        )
        conn.commit()
        new_id = cur.lastrowid
        cur.close()
        conn.close()
        return jsonify({"id": new_id}), 201

    @app.put("/api/admin/cities/<int:city_id>")
    @admin_required
    def update_city(city_id):
        data = request.get_json(silent=True) or {}
        fields = []
        params = []
        if "name" in data:
            fields.append("name = %s")
            params.append((data.get("name") or "").strip())
        if "is_active" in data:
            fields.append("is_active = %s")
            params.append(1 if data.get("is_active") else 0)
        for key in ("state", "country", "support_phone", "city_pincode"):
            if key in data:
                fields.append(f"{key} = %s")
                params.append((data.get(key) or "").strip())
        for key in ("base_fee", "min_booking_amount"):
            if key in data:
                try:
                    fields.append(f"{key} = %s")
                    params.append(float(data.get(key) or 0))
                except (TypeError, ValueError):
                    return jsonify({"error": f"Invalid {key}"}), 400
        for key in ("avg_eta_minutes", "priority"):
            if key in data:
                try:
                    fields.append(f"{key} = %s")
                    params.append(int(data.get(key) or 0))
                except (TypeError, ValueError):
                    return jsonify({"error": f"Invalid {key}"}), 400
        if not fields:
            return jsonify({"error": "No fields"}), 400
        params.append(city_id)
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"UPDATE cities SET {', '.join(fields)} WHERE id = %s", params)
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"ok": True})

    @app.post("/api/admin/areas")
    @admin_required
    def create_area():
        data = request.get_json(silent=True) or {}
        try:
            city_id = int(data["city_id"])
        except (KeyError, TypeError, ValueError):
            return jsonify({"error": "city_id required"}), 400
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "Name required"}), 400
        postal_code = (data.get("postal_code") or "").strip()
        notes = (data.get("notes") or "").strip()
        try:
            extra_fee = float(data.get("extra_fee", 0) or 0)
            avg_eta_minutes = int(data.get("avg_eta_minutes", 60) or 60)
            priority = int(data.get("priority", 0) or 0)
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid numeric field"}), 400
        is_active = 1 if data.get("is_active", True) else 0
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO areas (city_id, name, postal_code, extra_fee, avg_eta_minutes, priority, notes, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (city_id, name, postal_code, extra_fee, avg_eta_minutes, priority, notes, is_active),
        )
        conn.commit()
        new_id = cur.lastrowid
        cur.close()
        conn.close()
        return jsonify({"id": new_id}), 201

    @app.put("/api/admin/areas/<int:aid>")
    @admin_required
    def update_area(aid):
        data = request.get_json(silent=True) or {}
        fields = []
        params = []
        if "name" in data:
            fields.append("name = %s")
            params.append((data.get("name") or "").strip())
        if "is_active" in data:
            fields.append("is_active = %s")
            params.append(1 if data.get("is_active") else 0)
        for key in ("postal_code", "notes"):
            if key in data:
                fields.append(f"{key} = %s")
                params.append((data.get(key) or "").strip())
        if "extra_fee" in data:
            try:
                fields.append("extra_fee = %s")
                params.append(float(data.get("extra_fee") or 0))
            except (TypeError, ValueError):
                return jsonify({"error": "Invalid extra_fee"}), 400
        for key in ("avg_eta_minutes", "priority"):
            if key in data:
                try:
                    fields.append(f"{key} = %s")
                    params.append(int(data.get(key) or 0))
                except (TypeError, ValueError):
                    return jsonify({"error": f"Invalid {key}"}), 400
        if "city_id" in data:
            try:
                fields.append("city_id = %s")
                params.append(int(data["city_id"]))
            except (TypeError, ValueError):
                return jsonify({"error": "Invalid city_id"}), 400
        if not fields:
            return jsonify({"error": "No fields"}), 400
        params.append(aid)
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"UPDATE areas SET {', '.join(fields)} WHERE id = %s", params)
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"ok": True})

    @app.get("/api/admin/cities")
    @admin_required
    def list_cities_admin():
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, name, state, country, support_phone, base_fee, min_booking_amount,
                   avg_eta_minutes, priority, city_pincode, is_active
            FROM cities
            ORDER BY priority ASC, name ASC
            """
        )
        rows = [row_to_dict(cur, r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return jsonify(rows)

    @app.get("/api/admin/areas")
    @admin_required
    def list_areas_admin():
        city_id = request.args.get("city_id", type=int)
        conn = get_db()
        cur = conn.cursor()
        if city_id:
            cur.execute(
                """
                SELECT id, city_id, name, postal_code, extra_fee, avg_eta_minutes, priority,
                       notes, is_active
                FROM areas WHERE city_id = %s ORDER BY priority ASC, name ASC
                """,
                (city_id,),
            )
        else:
            cur.execute(
                """
                SELECT id, city_id, name, postal_code, extra_fee, avg_eta_minutes, priority,
                       notes, is_active
                FROM areas ORDER BY city_id, priority ASC, name ASC
                """
            )
        rows = [row_to_dict(cur, r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return jsonify(rows)

    def generate_booking_ref():
        chars = string.ascii_uppercase + string.digits
        for _ in range(12):
            ref = "".join(secrets.choice(chars) for _ in range(8))
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT 1 FROM bookings WHERE booking_ref = %s", (ref,))
            exists = cur.fetchone()
            cur.close()
            conn.close()
            if not exists:
                return ref
        return secrets.token_hex(4).upper()

    def resolve_booking_location(cur, city_id_raw, area_id_raw):
        try:
            city_id = int(city_id_raw) if city_id_raw not in (None, "", 0, "0") else None
        except (TypeError, ValueError):
            city_id = None
        try:
            area_id = int(area_id_raw) if area_id_raw not in (None, "", 0, "0") else None
        except (TypeError, ValueError):
            area_id = None

        if city_id and area_id:
            cur.execute(
                """
                SELECT a.id, a.city_id
                FROM areas a
                JOIN cities c ON c.id = a.city_id
                WHERE a.id = %s AND a.city_id = %s AND a.is_active = 1 AND c.is_active = 1
                LIMIT 1
                """,
                (area_id, city_id),
            )
            row = cur.fetchone()
            if row:
                return int(row[1]), int(row[0])

        cur.execute(
            """
            SELECT c.id, a.id
            FROM cities c
            JOIN areas a ON a.city_id = c.id
            WHERE c.is_active = 1 AND a.is_active = 1
            ORDER BY c.priority ASC, c.name ASC, a.priority ASC, a.name ASC
            LIMIT 1
            """
        )
        fallback = cur.fetchone()
        if not fallback:
            return None, None
        return int(fallback[0]), int(fallback[1])

    def booking_window_hours_from_cms(cms_dict):
        try:
            start_h = int(str(cms_dict.get("booking_hour_start", "6")).strip())
        except ValueError:
            start_h = 6
        try:
            end_h = int(str(cms_dict.get("booking_hour_end", "23")).strip())
        except ValueError:
            end_h = 23
        start_h = max(0, min(23, start_h))
        end_h = max(0, min(23, end_h))
        if start_h > end_h:
            start_h, end_h = end_h, start_h
        return start_h, end_h

    def hour_from_scheduled_time(sched_time):
        if sched_time is None:
            return None
        s = str(sched_time).strip()
        if not s:
            return None
        parts = s.replace(".", ":").split(":")
        try:
            return int(parts[0])
        except (ValueError, IndexError):
            return None

    def send_mail_safe(subject, recipients, body_html, body_text=""):
        if not app.config.get("MAIL_USERNAME"):
            return
        try:
            msg = Message(
                subject=subject,
                recipients=recipients,
                body=body_text or subject,
                html=body_html,
            )
            mail.send(msg)
        except Exception as e:  # noqa: BLE001
            app.logger.exception("Mail send failed: %s", e)

    # ------------------------------------------------------------------
    # BOOKINGS
    # ------------------------------------------------------------------
    @app.post("/api/bookings")
    def create_booking():
        data = request.get_json(silent=True) or {}
        items = data.get("items") or []
        if not isinstance(items, list) or not items:
            return jsonify({"error": "items required"}), 400
        guest_name = (data.get("guest_name") or "").strip()
        guest_email = (data.get("guest_email") or "").strip()
        guest_phone = (data.get("guest_phone") or "").strip()
        address = (data.get("address") or "").strip()
        if not all([guest_name, guest_phone, address]):
            return jsonify({"error": "Missing guest or address fields"}), 400
        sched_date = data.get("scheduled_date")
        sched_time = data.get("scheduled_time")
        if not sched_date or not sched_time:
            return jsonify({"error": "Schedule required"}), 400
        cms_booking = all_cms_dict()
        win_start, win_end = booking_window_hours_from_cms(cms_booking)
        sched_hour = hour_from_scheduled_time(sched_time)
        if sched_hour is None:
            return jsonify({"error": "Invalid scheduled time"}), 400
        if not (win_start <= sched_hour <= win_end):
            return (
                jsonify(
                    {
                        "error": (
                            f"Choose a time between {win_start:02d}:00 and {win_end:02d}:00"
                        )
                    }
                ),
                400,
            )
        user_latitude = data.get("user_latitude")
        user_longitude = data.get("user_longitude")
        if user_latitude in ("", None):
            user_latitude = None
        if user_longitude in ("", None):
            user_longitude = None
        try:
            if user_latitude is not None:
                user_latitude = float(user_latitude)
            if user_longitude is not None:
                user_longitude = float(user_longitude)
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid location coordinates"}), 400

        conn = get_db()
        cur = conn.cursor()
        city_id, area_id = resolve_booking_location(
            cur, data.get("city_id"), data.get("area_id")
        )
        if not city_id or not area_id:
            cur.close()
            conn.close()
            return jsonify({"error": "No service location is configured in system"}), 400
        line_total = 0.0
        line_rows = []
        for it in items:
            try:
                sid = int(it.get("service_id"))
                qty = int(it.get("quantity", 1))
            except (TypeError, ValueError):
                cur.close()
                conn.close()
                return jsonify({"error": "Invalid line item"}), 400
            if qty < 1:
                qty = 1
            cur.execute(
                """
                SELECT s.id, s.name, s.price
                FROM services s
                JOIN categories c ON c.id = s.category_id
                WHERE s.id = %s AND s.is_active = 1 AND c.is_active = 1
                """,
                (sid,),
            )
            sv = cur.fetchone()
            if not sv:
                cur.close()
                conn.close()
                return jsonify({"error": f"Service {sid} unavailable"}), 400
            price = float(sv[2])
            line_total += price * qty
            line_rows.append((sv[1], float(price), qty, sid))

        total = round(line_total, 2)
        ref = generate_booking_ref()
        payment_method = (data.get("payment_method") or "COD").strip() or "COD"

        try:
            cur.execute(
                """
                INSERT INTO bookings (booking_ref, guest_name, guest_email, guest_phone,
                  city_id, area_id, address, scheduled_date, scheduled_time, total_amount,
                  payment_method, status, user_latitude, user_longitude)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending', %s, %s)
                """,
                (
                    ref,
                    guest_name,
                    guest_email,
                    guest_phone,
                    city_id,
                    area_id,
                    address,
                    sched_date,
                    sched_time,
                    total,
                    payment_method,
                    user_latitude,
                    user_longitude,
                ),
            )
            bid = cur.lastrowid
            for name, price, qty, sid in line_rows:
                cur.execute(
                    """
                    INSERT INTO booking_items (booking_id, service_id, service_name, price, quantity)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (bid, sid, name, price, qty),
                )
            conn.commit()
        except Exception as e:  # noqa: BLE001
            conn.rollback()
            cur.close()
            conn.close()
            return jsonify({"error": str(e)}), 500
        cur.close()
        conn.close()

        cms = all_cms_dict()
        site = cms.get("site_name", "Service Booking")
        items_html = "".join(
            f"<li>{n} x {q} — ${p * q:.2f}</li>" for n, p, q, _ in line_rows
        )
        admin_email = os.environ.get("ADMIN_EMAIL", "")
        guest_body = f"""
        <h2>Booking confirmed</h2>
        <p>Reference: <strong>{ref}</strong></p>
        <p>Total: <strong>${total:.2f}</strong> (COD)</p>
        <p>Scheduled: {sched_date} {sched_time}</p>
        <ul>{items_html}</ul>
        <p>Thank you for choosing {site}.</p>
        """
        if guest_email:
            send_mail_safe(
                f"[{site}] Booking {ref}",
                [guest_email],
                guest_body,
            )
        if admin_email:
            admin_body = f"""
            <h2>New booking {ref}</h2>
            <p><strong>Customer:</strong> {guest_name} {f"&lt;{guest_email}&gt;" if guest_email else ""} {guest_phone}</p>
            <p><strong>Address:</strong> {address}</p>
            <p><strong>Scheduled:</strong> {sched_date} {sched_time}</p>
            <p><strong>Total:</strong> ${total:.2f}</p>
            <ul>{items_html}</ul>
            """
            send_mail_safe(f"[{site}] New booking {ref}", [admin_email], admin_body)

        return (
            jsonify(
                {
                    "booking_ref": ref,
                    "total_amount": total,
                    "scheduled_date": str(sched_date),
                    "scheduled_time": str(sched_time),
                    "user_latitude": user_latitude,
                    "user_longitude": user_longitude,
                }
            ),
            201,
        )

    @app.get("/api/bookings/<ref>")
    def get_booking_guest(ref):
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT b.*, ci.name AS city_name, ar.name AS area_name
            FROM bookings b
            JOIN cities ci ON ci.id = b.city_id
            JOIN areas ar ON ar.id = b.area_id
            WHERE b.booking_ref = %s
            """,
            (ref,),
        )
        b = cur.fetchone()
        if not b:
            cur.close()
            conn.close()
            return jsonify({"error": "Not found"}), 404
        booking = row_to_dict(cur, b)
        cur.execute(
            """
            SELECT service_name, price, quantity
            FROM booking_items WHERE booking_id = %s
            """,
            (booking["id"],),
        )
        its = [row_to_dict(cur, r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        booking["items"] = its
        for k in ("scheduled_date", "scheduled_time", "created_at"):
            if booking.get(k) is not None and hasattr(booking[k], "isoformat"):
                booking[k] = str(booking[k])
        return jsonify(booking)

    @app.get("/api/admin/dashboard")
    @admin_required
    def dashboard_stats():
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM bookings")
        total = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM bookings WHERE status = 'pending'")
        pending = cur.fetchone()[0]
        today = date.today().isoformat()
        cur.execute(
            "SELECT COUNT(*) FROM bookings WHERE scheduled_date = %s", (today,)
        )
        today_count = cur.fetchone()[0]
        cur.execute(
            """
            SELECT COALESCE(SUM(total_amount), 0) FROM bookings
            WHERE status IN ('completed', 'confirmed', 'in_progress', 'pending')
            """
        )
        revenue = float(cur.fetchone()[0])
        cur.execute(
            """
            SELECT status, COUNT(*) AS c FROM bookings GROUP BY status
            """
        )
        status_rows = {row[0]: row[1] for row in cur.fetchall()}
        cur.execute(
            """
            SELECT bi.service_name, SUM(bi.quantity) AS q
            FROM booking_items bi
            GROUP BY bi.service_name
            ORDER BY q DESC
            LIMIT 5
            """
        )
        top_services = [{"name": r[0], "count": int(r[1])} for r in cur.fetchall()]
        cur.execute(
            """
            SELECT b.booking_ref, b.guest_name, b.scheduled_date, b.total_amount, b.status,
                   ci.name AS city_name, ar.name AS area_name
            FROM bookings b
            JOIN cities ci ON ci.id = b.city_id
            JOIN areas ar ON ar.id = b.area_id
            ORDER BY b.created_at DESC
            LIMIT 10
            """
        )
        recent = []
        for r in cur.fetchall():
            recent.append(
                {
                    "booking_ref": r[0],
                    "guest_name": r[1],
                    "scheduled_date": str(r[2]),
                    "total_amount": float(r[3]),
                    "status": r[4],
                    "city_name": r[5],
                    "area_name": r[6],
                }
            )
        cur.close()
        conn.close()
        return jsonify(
            {
                "total_bookings": total,
                "pending_bookings": pending,
                "today_bookings": today_count,
                "total_revenue": revenue,
                "bookings_by_status": status_rows,
                "top_services": top_services,
                "recent_bookings": recent,
            }
        )

    @app.post("/api/admin/demo/seed")
    @admin_required
    def seed_demo_data():
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM bookings")
        existing_bookings = int(cur.fetchone()[0] or 0)
        if existing_bookings >= 20:
            cur.close()
            conn.close()
            return jsonify({"ok": True, "message": "Demo data already available"})

        # Ensure baseline cities/areas
        city_names = ["Mumbai", "Delhi", "Bengaluru", "Pune"]
        city_ids = []
        for name in city_names:
            cur.execute("SELECT id FROM cities WHERE name = %s LIMIT 1", (name,))
            row = cur.fetchone()
            if row:
                city_ids.append(int(row[0]))
                continue
            cur.execute(
                """
                INSERT INTO cities (name, state, country, city_pincode, support_phone, base_fee, min_booking_amount, avg_eta_minutes, priority, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 1)
                """,
                (name, "State", "India", "400001", "+91-9999999999", 49.0, 199.0, 60, len(city_ids)),
            )
            city_ids.append(cur.lastrowid)

        area_samples = [
            ["Downtown", "Central", "North Zone", "West End"],
            ["Connaught", "South Block", "Dwarka", "Rohini"],
            ["Indiranagar", "Whitefield", "HSR", "Jayanagar"],
            ["Baner", "Kothrud", "Viman Nagar", "Hadapsar"],
        ]
        area_ids = []
        for idx, city_id in enumerate(city_ids):
            for n, area in enumerate(area_samples[idx]):
                cur.execute(
                    "SELECT id FROM areas WHERE city_id = %s AND name = %s LIMIT 1",
                    (city_id, area),
                )
                row = cur.fetchone()
                if row:
                    area_ids.append((city_id, int(row[0])))
                    continue
                cur.execute(
                    """
                    INSERT INTO areas (city_id, name, postal_code, extra_fee, avg_eta_minutes, priority, notes, is_active)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, 1)
                    """,
                    (
                        city_id,
                        area,
                        f"{400000 + n + idx * 10}",
                        float(n * 10),
                        45 + (n * 5),
                        n,
                        "Demo coverage area",
                    ),
                )
                area_ids.append((city_id, cur.lastrowid))

        city_coords = {
            "Mumbai": (19.0760, 72.8777),
            "Delhi": (28.6139, 77.2090),
            "Bengaluru": (12.9716, 77.5946),
            "Pune": (18.5204, 73.8567),
        }
        city_coord_rows = {}
        for city_id in city_ids:
            cur.execute("SELECT name FROM cities WHERE id = %s", (city_id,))
            row = cur.fetchone()
            if not row:
                continue
            base = city_coords.get((row[0] or "").strip())
            if base:
                city_coord_rows[city_id] = base

        # Ensure baseline categories/services
        categories = [
            ("Home Cleaning", "Professional deep and regular cleaning"),
            ("Appliance Repair", "Quick fix by verified technicians"),
            ("Beauty & Wellness", "Salon and wellness at home"),
        ]
        cat_ids = []
        for i, (cat, desc) in enumerate(categories):
            cur.execute("SELECT id FROM categories WHERE name = %s LIMIT 1", (cat,))
            row = cur.fetchone()
            if row:
                cat_ids.append(int(row[0]))
                continue
            cur.execute(
                """
                INSERT INTO categories (name, description, image_url, icon_url, priority, is_active)
                VALUES (%s, %s, %s, '', %s, 1)
                """,
                (
                    cat,
                    desc,
                    "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1200&auto=format&fit=crop",
                    i,
                ),
            )
            cat_ids.append(cur.lastrowid)

        service_templates = [
            ("Deep Home Cleaning", 129.0, 180),
            ("Sofa Shampooing", 89.0, 120),
            ("AC Service", 79.0, 90),
            ("Refrigerator Repair", 99.0, 100),
            ("Hair Spa", 59.0, 75),
            ("Manicure Pedicure", 69.0, 90),
        ]
        service_ids = []
        for i, tpl in enumerate(service_templates):
            name, price, duration = tpl
            cid = cat_ids[i % len(cat_ids)]
            cur.execute("SELECT id FROM services WHERE name = %s LIMIT 1", (name,))
            row = cur.fetchone()
            if row:
                service_ids.append(int(row[0]))
                continue
            cur.execute(
                """
                INSERT INTO services (category_id, name, description, price, duration_minutes, image_url, image_urls, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, 1)
                """,
                (
                    cid,
                    name,
                    f"{name} demo service description for admin preview.",
                    price,
                    duration,
                    "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop",
                    json.dumps(
                        [
                            "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
                        ]
                    ),
                ),
            )
            service_ids.append(cur.lastrowid)

        # Seed bookings + items
        today = date.today()
        statuses = ["pending", "confirmed", "in_progress", "completed", "cancelled"]
        for i in range(24):
            ref = generate_booking_ref()
            city_id = city_ids[i % len(city_ids)]
            candidate_areas = [a for c, a in area_ids if c == city_id] or [area_ids[0][1]]
            area_id = candidate_areas[i % len(candidate_areas)]
            base_lat, base_lon = city_coord_rows.get(city_id, (19.0760, 72.8777))
            lat_offset = ((i % 5) - 2) * 0.0087
            lon_offset = ((i % 7) - 3) * 0.0093
            user_latitude = round(base_lat + lat_offset, 7)
            user_longitude = round(base_lon + lon_offset, 7)
            sched_date = today - timedelta(days=(i % 10))
            sched_time = f"{9 + (i % 8):02d}:00:00"
            status = statuses[i % len(statuses)]
            amount = round(59 + (i % 6) * 35 + (i % 3) * 14.5, 2)
            cur.execute(
                """
                INSERT INTO bookings (booking_ref, guest_name, guest_email, guest_phone, city_id, area_id, address, scheduled_date, scheduled_time, total_amount, payment_method, status, user_latitude, user_longitude)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'COD', %s, %s, %s)
                """,
                (
                    ref,
                    f"Demo Customer {i+1}",
                    f"demo{i+1}@example.com",
                    f"+91-98{(10000000+i):08d}",
                    city_id,
                    area_id,
                    f"Demo Address Line {i+1}",
                    sched_date.isoformat(),
                    sched_time,
                    amount,
                    status,
                    user_latitude,
                    user_longitude,
                ),
            )
            bid = cur.lastrowid
            sid = service_ids[i % len(service_ids)]
            qty = 1 + (i % 2)
            cur.execute(
                "SELECT name, price FROM services WHERE id = %s",
                (sid,),
            )
            srow = cur.fetchone()
            if srow:
                cur.execute(
                    """
                    INSERT INTO booking_items (booking_id, service_id, service_name, price, quantity)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (bid, sid, srow[0], float(srow[1]), qty),
                )

        # Seed blogs preview if empty
        cur.execute("SELECT COUNT(*) FROM blogs")
        if int(cur.fetchone()[0] or 0) == 0:
            for i in range(4):
                cur.execute(
                    """
                    INSERT INTO blogs (title, slug, meta_description, excerpt, author_name, category, tags, featured_image_url, content, read_time_minutes, is_featured, is_published, published_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1, NOW())
                    """,
                    (
                        f"Demo Blog Post {i+1}",
                        f"demo-blog-{i+1}",
                        "Demo meta description for blog card preview",
                        "Demo excerpt for listing preview.",
                        "Admin Team",
                        "Guides",
                        json.dumps(["demo", "tips"]),
                        "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop",
                        "<h2>Demo Heading</h2><p>This is demo blog content for preview in admin and user panels.</p>",
                        6 + i,
                        1 if i == 0 else 0,
                    ),
                )

        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"ok": True, "message": "Demo data seeded successfully"})

    @app.get("/api/admin/reports")
    @admin_required
    def admin_reports():
        start = (request.args.get("start_date") or "").strip()
        end = (request.args.get("end_date") or "").strip()
        conn = get_db()
        cur = conn.cursor()
        where = ""
        params = []
        if start and end:
            where = "WHERE b.scheduled_date BETWEEN %s AND %s"
            params = [start, end]
        cur.execute(
            f"""
            SELECT
              COUNT(*) AS total_bookings,
              COALESCE(SUM(b.total_amount), 0) AS total_revenue,
              COALESCE(AVG(b.total_amount), 0) AS avg_order_value
            FROM bookings b
            {where}
            """,
            params,
        )
        summary_row = cur.fetchone() or (0, 0, 0)
        cur.execute(
            f"""
            SELECT b.status, COUNT(*) AS c
            FROM bookings b
            {where}
            GROUP BY b.status
            """,
            params,
        )
        by_status = {r[0]: int(r[1]) for r in cur.fetchall()}
        cur.execute(
            f"""
            SELECT DATE_FORMAT(b.scheduled_date, '%%Y-%%m-%%d') AS d, COUNT(*) AS c, COALESCE(SUM(b.total_amount),0) AS rev
            FROM bookings b
            {where}
            GROUP BY b.scheduled_date
            ORDER BY b.scheduled_date ASC
            """,
            params,
        )
        trend = [
            {"date": r[0], "bookings": int(r[1]), "revenue": float(r[2])}
            for r in cur.fetchall()
        ]
        cur.execute(
            f"""
            SELECT bi.service_name, SUM(bi.quantity) AS qty
            FROM booking_items bi
            JOIN bookings b ON b.id = bi.booking_id
            {where}
            GROUP BY bi.service_name
            ORDER BY qty DESC
            LIMIT 10
            """,
            params,
        )
        top_services = [{"name": r[0], "count": int(r[1])} for r in cur.fetchall()]
        cur.execute(
            f"""
            SELECT ci.name AS city_name, COUNT(*) AS c
            FROM bookings b
            JOIN cities ci ON ci.id = b.city_id
            {where}
            GROUP BY ci.name
            ORDER BY c DESC
            LIMIT 10
            """,
            params,
        )
        by_city = [{"city": r[0], "count": int(r[1])} for r in cur.fetchall()]
        cur.close()
        conn.close()
        return jsonify(
            {
                "range": {"start_date": start or None, "end_date": end or None},
                "summary": {
                    "total_bookings": int(summary_row[0] or 0),
                    "total_revenue": float(summary_row[1] or 0),
                    "avg_order_value": float(summary_row[2] or 0),
                },
                "bookings_by_status": by_status,
                "trend": trend,
                "top_services": top_services,
                "bookings_by_city": by_city,
            }
        )

    @app.get("/api/admin/export")
    @admin_required
    def admin_export():
        kind = (request.args.get("kind") or "bookings").strip().lower()
        fmt = (request.args.get("format") or "csv").strip().lower()
        start = (request.args.get("start_date") or "").strip()
        end = (request.args.get("end_date") or "").strip()

        conn = get_db()
        cur = conn.cursor()
        where = ""
        params = []
        if start and end:
            where = " WHERE b.scheduled_date BETWEEN %s AND %s "
            params = [start, end]

        if kind == "bookings":
            cur.execute(
                f"""
                SELECT b.booking_ref, b.guest_name, b.guest_email, b.guest_phone,
                       ci.name AS city_name, ar.name AS area_name, b.address,
                       b.scheduled_date, b.scheduled_time, b.status, b.payment_method,
                       b.total_amount, b.created_at
                FROM bookings b
                JOIN cities ci ON ci.id = b.city_id
                JOIN areas ar ON ar.id = b.area_id
                {where}
                ORDER BY b.created_at DESC
                """,
                params,
            )
        elif kind == "services":
            cur.execute(
                """
                SELECT s.id, s.name, c.name AS category_name, s.price, s.duration_minutes,
                       s.is_active
                FROM services s
                JOIN categories c ON c.id = s.category_id
                ORDER BY c.name, s.name
                """
            )
        elif kind == "customers":
            cur.execute(
                f"""
                SELECT b.guest_name, b.guest_email, b.guest_phone,
                       COUNT(*) AS total_bookings,
                       COALESCE(SUM(b.total_amount), 0) AS total_spent,
                       MAX(b.created_at) AS last_booking_at
                FROM bookings b
                {where}
                GROUP BY b.guest_name, b.guest_email, b.guest_phone
                ORDER BY total_spent DESC
                """,
                params,
            )
        else:
            cur.close()
            conn.close()
            return jsonify({"error": "Invalid kind"}), 400

        rows = [row_to_dict(cur, r) for r in cur.fetchall()]
        cur.close()
        conn.close()

        if fmt == "json":
            return jsonify({"kind": kind, "count": len(rows), "items": rows})
        if fmt != "csv":
            return jsonify({"error": "Invalid format"}), 400

        output = io.StringIO()
        fieldnames = list(rows[0].keys()) if rows else []
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        if fieldnames:
            writer.writeheader()
            writer.writerows(rows)
        csv_data = output.getvalue()
        output.close()
        from flask import Response

        filename = f"{kind}_export.csv"
        return Response(
            csv_data,
            mimetype="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )

    @app.get("/api/admin/bookings")
    @admin_required
    def list_bookings_admin():
        status = request.args.get("status")
        city_id = request.args.get("city_id", type=int)
        q = (request.args.get("q") or "").strip()
        date_from = request.args.get("from")
        date_to = request.args.get("to")
        conn = get_db()
        cur = conn.cursor()
        sql = """
            SELECT b.id, b.booking_ref, b.guest_name, b.guest_email, b.scheduled_date,
                   b.scheduled_time, b.total_amount, b.status, b.created_at,
                   ci.name AS city_name, ar.name AS area_name
            FROM bookings b
            JOIN cities ci ON ci.id = b.city_id
            JOIN areas ar ON ar.id = b.area_id
            WHERE 1=1
        """
        params = []
        if status:
            sql += " AND b.status = %s"
            params.append(status)
        if city_id:
            sql += " AND b.city_id = %s"
            params.append(city_id)
        if date_from:
            sql += " AND b.scheduled_date >= %s"
            params.append(date_from)
        if date_to:
            sql += " AND b.scheduled_date <= %s"
            params.append(date_to)
        if q:
            sql += " AND (b.booking_ref LIKE %s OR b.guest_name LIKE %s OR b.guest_email LIKE %s)"
            like = f"%{q}%"
            params.extend([like, like, like])
        sql += " ORDER BY b.created_at DESC LIMIT 500"
        cur.execute(sql, params)
        rows = []
        for r in cur.fetchall():
            d = row_to_dict(cur, r)
            d["scheduled_date"] = str(d["scheduled_date"]) if d.get("scheduled_date") else None
            if d.get("scheduled_time") is not None:
                d["scheduled_time"] = str(d["scheduled_time"])
            if d.get("created_at") is not None:
                d["created_at"] = str(d["created_at"])
            rows.append(d)
        cur.close()
        conn.close()
        return jsonify(rows)

    @app.get("/api/admin/bookings/<int:bid>")
    @admin_required
    def get_booking_admin(bid):
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT b.*, ci.name AS city_name, ar.name AS area_name
            FROM bookings b
            JOIN cities ci ON ci.id = b.city_id
            JOIN areas ar ON ar.id = b.area_id
            WHERE b.id = %s
            """,
            (bid,),
        )
        b = cur.fetchone()
        if not b:
            cur.close()
            conn.close()
            return jsonify({"error": "Not found"}), 404
        booking = row_to_dict(cur, b)
        cur.execute(
            "SELECT service_name, price, quantity, service_id FROM booking_items WHERE booking_id = %s",
            (bid,),
        )
        booking["items"] = [row_to_dict(cur, r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        for k in ("scheduled_date", "scheduled_time", "created_at"):
            if booking.get(k) is not None:
                booking[k] = str(booking[k])
        return jsonify(booking)

    @app.put("/api/admin/bookings/<int:bid>/status")
    @admin_required
    def update_booking_status(bid):
        data = request.get_json(silent=True) or {}
        status = (data.get("status") or "").strip()
        allowed = {"pending", "confirmed", "in_progress", "completed", "cancelled"}
        if status not in allowed:
            return jsonify({"error": "Invalid status"}), 400
        notes = data.get("admin_notes")
        conn = get_db()
        cur = conn.cursor()
        if notes is not None:
            cur.execute(
                "UPDATE bookings SET status = %s, admin_notes = %s WHERE id = %s",
                (status, notes, bid),
            )
        else:
            cur.execute(
                "UPDATE bookings SET status = %s WHERE id = %s",
                (status, bid),
            )
        cur.execute(
            "SELECT guest_email, booking_ref, guest_name FROM bookings WHERE id = %s", (bid,)
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        if row and row[0]:
            email, ref, name = row[0], row[1], row[2]
            cms = all_cms_dict()
            site = cms.get("site_name", "Service Booking")
            body = f"""
            <p>Hi {name},</p>
            <p>Your booking <strong>{ref}</strong> is now: <strong>{status}</strong>.</p>
            <p>— {site}</p>
            """
            send_mail_safe(
                f"[{site}] Booking {ref} updated",
                [email],
                body,
            )
        return jsonify({"ok": True})

    @app.post("/api/contact")
    def contact_form():
        data = request.get_json(silent=True) or {}
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip()
        subject = (data.get("subject") or "").strip()
        message = (data.get("message") or "").strip()
        if not all([name, email, message]):
            return jsonify({"error": "Required fields missing"}), 400
        page_url = (data.get("page_url") or "").strip()[:500]
        user_agent = (request.headers.get("User-Agent") or "")[:500]
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO contact_messages (name, email, subject, message, page_url, user_agent)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (name, email, subject, message, page_url, user_agent),
        )
        conn.commit()
        msg_id = cur.lastrowid
        cur.close()
        conn.close()
        admin_email = os.environ.get("ADMIN_EMAIL")
        if not admin_email:
            return jsonify({"ok": True, "id": msg_id, "warning": "Admin email not configured"})
        cms = all_cms_dict()
        site = cms.get("site_name", "Service Booking")
        body = f"""
        <p><strong>From:</strong> {name} &lt;{email}&gt;</p>
        <p><strong>Subject:</strong> {subject}</p>
        <p>{message.replace(chr(10), '<br/>')}</p>
        """
        send_mail_safe(f"[{site}] Contact: {subject or 'Message'}", [admin_email], body)
        return jsonify({"ok": True, "id": msg_id})

    @app.get("/api/admin/contact-messages")
    @admin_required
    def list_contact_messages_admin():
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, name, email, subject, message, page_url, created_at
            FROM contact_messages
            ORDER BY created_at DESC
            LIMIT 1000
            """
        )
        rows = [row_to_dict(cur, r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        for row in rows:
            if row.get("created_at") is not None:
                row["created_at"] = str(row["created_at"])
        return jsonify(rows)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "5001")), debug=True)
