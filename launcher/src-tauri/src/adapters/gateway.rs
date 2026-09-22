use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase", default)]
pub struct GatewayHealth {
    pub overall: String,
    pub enabled: bool,
    pub kill_switch: bool,
    pub peer: String,
    pub interface: String,
    pub observed_exit: String,
    pub handshake_ok: bool,
    pub dns_through_tunnel: bool,
    pub ipv6_policy: String,
    pub source: String,
}

impl Default for GatewayHealth {
    fn default() -> Self {
        Self {
            overall: "offline".into(),
            enabled: false,
            kill_switch: false,
            peer: "—".into(),
            interface: "wg0".into(),
            observed_exit: "isp".into(),
            handshake_ok: false,
            dns_through_tunnel: false,
            ipv6_policy: "unknown".into(),
            source: "probe".into(),
        }
    }
}

fn nexus_root() -> PathBuf {
    if let Ok(custom) = std::env::var("NEXUS_ROOT") {
        return PathBuf::from(custom);
    }
    if cfg!(windows) {
        PathBuf::from(r"C:\NexusDefender")
    } else {
        PathBuf::from("/var/lib/nexus-defender")
    }
}

fn status_path() -> PathBuf {
    nexus_root().join("gateway-status.json")
}

fn from_file() -> Option<GatewayHealth> {
    let raw = std::fs::read_to_string(status_path()).ok()?;
    let mut h: GatewayHealth = serde_json::from_str(&raw).ok()?;
    h.source = "gateway-status.json".into();
    h.overall = classify(&h);
    Some(h)
}

fn classify(h: &GatewayHealth) -> String {
    if h.enabled && h.handshake_ok && h.kill_switch && h.dns_through_tunnel && h.ipv6_policy != "unknown"
    {
        "protected".into()
    } else if h.enabled || h.kill_switch {
        "degraded".into()
    } else {
        "offline".into()
    }
}

#[cfg(windows)]
fn service_running(name: &str) -> bool {
    use std::os::windows::process::CommandExt;
    const CREATE_NO_WINDOW: u32 = 0x08000000;
    let out = std::process::Command::new("sc.exe")
        .args(["query", name])
        .creation_flags(CREATE_NO_WINDOW)
        .output();
    match out {
        Ok(o) => {
            let text = String::from_utf8_lossy(&o.stdout).to_ascii_uppercase();
            text.contains("RUNNING")
        }
        Err(_) => false,
    }
}

#[cfg(not(windows))]
fn service_running(_name: &str) -> bool {
    false
}

fn from_services() -> GatewayHealth {
    let mut h = GatewayHealth::default();
    let running = service_running("WireGuardTunnel$wg0")
        || service_running("WireGuardManager")
        || std::path::Path::new("/sys/class/net/wg0").exists();
    if running {
        h.enabled = true;
        h.handshake_ok = true;
        h.observed_exit = "masked".into();
        h.source = "service".into();
    }
    let conf = nexus_root().join("wg0.conf");
    if let Ok(text) = std::fs::read_to_string(conf) {
        if text.contains("0.0.0.0/0") {
            h.kill_switch = true;
        }
        if text.to_ascii_lowercase().contains("dns") {
            h.dns_through_tunnel = running;
        }
    }
    h.overall = classify(&h);
    h
}

pub fn probe() -> GatewayHealth {
    if let Some(file) = from_file() {
        return file;
    }
    from_services()
}
