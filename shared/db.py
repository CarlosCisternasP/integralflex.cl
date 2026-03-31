import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_conn():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", "5432")),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        cursor_factory=RealDictCursor,
    )

def fetch_user_by_identifier(identifier: str):
    query = '''
        SELECT id, username, email, rut, password_hash, rol
        FROM public.usuarios
        WHERE email = %s OR username = %s OR rut = %s
        LIMIT 1
    '''
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (identifier, identifier, identifier))
            return cur.fetchone()

def fetch_user_by_rut(rut: str):
    query = '''
        SELECT id, username, email, rut, password_hash, rol
        FROM public.usuarios
        WHERE rut = %s
        LIMIT 1
    '''
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (rut,))
            return cur.fetchone()
