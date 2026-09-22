use chrono::Utc;
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NexusEvent {
    pub id: Option<i64>,
    pub ts: String,
    pub source: String,
    pub host: String,
    pub event: String,
    pub summary: String,
    pub severity: i32,
    pub image: Option<String>,
    pub sha256: Option<String>,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct IncidentRow {
    pub id: i64,
    pub ts: String,
    pub title: String,
    pub score: i32,
    pub action: String,
    pub source: String,
}

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
         );
         CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ts TEXT NOT NULL,
            source TEXT NOT NULL,
            host TEXT NOT NULL,
            event TEXT NOT NULL,
            summary TEXT NOT NULL,
            severity INTEGER NOT NULL,
            image TEXT,
            sha256 TEXT
         );
         CREATE TABLE IF NOT EXISTS incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ts TEXT NOT NULL,
            title TEXT NOT NULL,
            score INTEGER NOT NULL,
            action TEXT NOT NULL,
            source TEXT NOT NULL
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

fn fingerprint(bytes: &[u8]) -> String {
    let mut h: u32 = 0x811c9dc5;
    for b in bytes {
        h ^= u32::from(*b);
        h = h.wrapping_mul(0x0100_0193);
    }
    format!("fnv1a32-{h:08x}-{len}", len = bytes.len())
}

pub fn record_event(mut ev: NexusEvent) -> Result<NexusEvent, rusqlite::Error> {
    if ev.ts.is_empty() {
        ev.ts = Utc::now().to_rfc3339();
    }
    let conn = open()?;
    conn.execute(
        "INSERT INTO events (ts, source, host, event, summary, severity, image, sha256)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8)",
        (
            &ev.ts,
            &ev.source,
            &ev.host,
            &ev.event,
            &ev.summary,
            ev.severity,
            &ev.image,
            &ev.sha256,
        ),
    )?;
    ev.id = Some(conn.last_insert_rowid());
    if ev.severity >= 7 {
        let action = if ev.severity >= 12 { "BLOCK" } else { "ALERT" };
        conn.execute(
            "INSERT INTO incidents (ts, title, score, action, source) VALUES (?1,?2,?3,?4,?5)",
            (
                &ev.ts,
                &ev.summary,
                ev.severity.saturating_mul(5).min(100),
                action,
                &ev.source,
            ),
        )?;
    }
    let _ = append_audit(&format!("event {} {}", ev.source, ev.event));
    Ok(ev)
}

pub fn list_events(limit: usize) -> Result<Vec<NexusEvent>, rusqlite::Error> {
    let conn = open()?;
    let mut stmt = conn.prepare(
        "SELECT id, ts, source, host, event, summary, severity, image, sha256
         FROM events ORDER BY id DESC LIMIT ?1",
    )?;
    let rows = stmt.query_map([limit as i64], |row| {
        Ok(NexusEvent {
            id: Some(row.get(0)?),
            ts: row.get(1)?,
            source: row.get(2)?,
            host: row.get(3)?,
            event: row.get(4)?,
            summary: row.get(5)?,
            severity: row.get(6)?,
            image: row.get(7)?,
            sha256: row.get(8)?,
        })
    })?;
    rows.collect()
}

pub fn list_incidents(limit: usize) -> Result<Vec<IncidentRow>, rusqlite::Error> {
    let conn = open()?;
    let mut stmt = conn.prepare(
        "SELECT id, ts, title, score, action, source FROM incidents ORDER BY id DESC LIMIT ?1",
    )?;
    let rows = stmt.query_map([limit as i64], |row| {
        Ok(IncidentRow {
            id: row.get(0)?,
            ts: row.get(1)?,
            title: row.get(2)?,
            score: row.get(3)?,
            action: row.get(4)?,
            source: row.get(5)?,
        })
    })?;
    rows.collect()
}

pub fn fim_test() -> Result<NexusEvent, rusqlite::Error> {
    let stamp = Utc::now().to_rfc3339();
    let payload = format!("nexus-fim-test-{stamp}");
    let digest = fingerprint(payload.as_bytes());
    let conn = open()?;
    conn.execute(
        "INSERT INTO evidence (ts, kind, label, sha256) VALUES (?1, 'hash', ?2, ?3)",
        (&stamp, "FIM teste C:\\NexusDefender\\fim-test.txt", &digest),
    )?;
    record_event(NexusEvent {
        id: None,
        ts: stamp,
        source: "wazuh".into(),
        host: std::env::var("COMPUTERNAME").unwrap_or_else(|_| "PC-01".into()),
        event: "fim_change".into(),
        summary: "Alteração controlada em C:\\NexusDefender (teste FIM)".into(),
        severity: 7,
        image: Some(r"C:\NexusDefender\fim-test.txt".into()),
        sha256: Some(digest),
    })
}

pub fn process_test() -> Result<NexusEvent, rusqlite::Error> {
    record_event(NexusEvent {
        id: None,
        ts: Utc::now().to_rfc3339(),
        source: "sysmon".into(),
        host: std::env::var("COMPUTERNAME").unwrap_or_else(|_| "PC-01".into()),
        event: "process_created".into(),
        summary: "Evento controlado de processo (laboratório)".into(),
        severity: 4,
        image: Some(r"C:\NexusDefender\example.exe".into()),
        sha256: None,
    })
}

pub fn network_alert(summary: &str, severity: i32) -> Result<NexusEvent, rusqlite::Error> {
    record_event(NexusEvent {
        id: None,
        ts: Utc::now().to_rfc3339(),
        source: "suricata".into(),
        host: std::env::var("COMPUTERNAME").unwrap_or_else(|_| "sensor-01".into()),
        event: "ids_alert".into(),
        summary: summary.into(),
        severity,
        image: Some("eth1".into()),
        sha256: None,
    })
}

pub fn vpn_check(summary: &str, severity: i32) -> Result<NexusEvent, rusqlite::Error> {
    record_event(NexusEvent {
        id: None,
        ts: Utc::now().to_rfc3339(),
        source: "vpn".into(),
        host: std::env::var("COMPUTERNAME").unwrap_or_else(|_| "PC-01".into()),
        event: "vpn_check".into(),
        summary: summary.into(),
        severity,
        image: Some("wg0".into()),
        sha256: None,
    })
}
