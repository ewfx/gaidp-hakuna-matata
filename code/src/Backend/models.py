import sqlite3
import os


def init_db():
    print("init db called")
    for db in ["rules.db", "flagged_items.db", "uploads.db"]:
        if not os.path.exists(db):
            open(db, 'w').close()

    conn = sqlite3.connect("rules.db")
    conn.execute("""
    CREATE TABLE IF NOT EXISTS rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rule_name TEXT,
        rule_description TEXT,
        rule_condition TEXT,
        error_message TEXT,
        source_document TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.close()

    conn = sqlite3.connect("flagged_items.db")
    conn.execute("""
    CREATE TABLE IF NOT EXISTS flagged_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rule_id INTEGER,
        rule_name TEXT,
        row_index INTEGER,
        field_name TEXT,
        field_value TEXT,
        error_message TEXT,
        status TEXT DEFAULT 'open',
        remediation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(rule_id) REFERENCES rules(id)
    )
    """)
    conn.close()
    conn = sqlite3.connect("uploads.db")
    conn.execute("""
    CREATE TABLE IF NOT EXISTS uploads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fileName TEXT,
        index TEXT,
    )
    """)
    conn.close()