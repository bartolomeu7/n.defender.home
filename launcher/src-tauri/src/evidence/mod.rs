use chrono::Utc;
use rusqlite::Connection;
use std::path::PathBuf;

pub fn default_db_path() -> PathBuf {
    let mut dir = dirs_fallback();
    dir.push("nexus-defender");
    let _ = std::fs::create_dir_all(&dir);
    dir.push("vault.sqlite");
    dir
}

fn dirs_fallback() -> PathBuf {
    std::env::var("LOCALAPPDATA")
        .or_else(|_| std::env::var("HOME"))
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("."))
}

pub fn open() -> Result<Connection, rusqlite::Error> {
    let conn = Connection::open(default_db_path())?;
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS audit (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ts TEXT NOT NULL,
            event TEXT NOT NULL
         );
         CREATE TABLE IF NOT EXISTS evidence (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ts TEXT NOT NULL,
            kind TEXT NOT NULL,
            label TEXT NOT NULL,
            sha256 TEXT
         );",
    )?;
    Ok(conn)
}

pub fn append_audit(event: &str) -> Result<(), rusqlite::Error> {
    let conn = open()?;
    conn.execute(
        "INSERT INTO audit (ts, event) VALUES (?1, ?2)",
        (Utc::now().to_rfc3339(), event),
    )?;
    Ok(())
}

pub fn list_audit(limit: usize) -> Result<Vec<String>, rusqlite::Error> {
    let conn = open()?;
    let mut stmt = conn.prepare("SELECT ts || ' ' || event FROM audit ORDER BY id DESC LIMIT ?1")?;
    let rows = stmt.query_map([limit as i64], |row| row.get::<_, String>(0))?;
    rows.collect()
}
