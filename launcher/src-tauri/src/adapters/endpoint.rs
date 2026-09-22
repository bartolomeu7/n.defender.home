use serde::Serialize;
use std::path::{Path, PathBuf};

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SensorCheck {
    pub id: String,
    pub name: String,
    pub state: String,
    pub detail: String,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EndpointHealth {
    pub overall: String,
    pub host: String,
    pub checks: Vec<SensorCheck>,
}

fn nexus_root() -> PathBuf {
    if let Ok(custom) = std::env::var("NEXUS_ROOT") {
        return PathBuf::from(custom);
    }
    if cfg!(windows) {
        PathBuf::from(r"C:\NexusDefender")
    } else {
        PathBuf::from("/tmp/nexus-defender")
    }
}

fn path_exists(p: &Path) -> bool {
    p.exists()
}

#[cfg(windows)]
fn service_state(name: &str) -> Option<String> {
    use std::os::windows::process::CommandExt;
    const CREATE_NO_WINDOW: u32 = 0x08000000;
    let out = std::process::Command::new("sc.exe")
        .args(["query", name])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .ok()?;
    let text = String::from_utf8_lossy(&out.stdout).to_ascii_uppercase();
    if text.contains("FAILED 1060") || !out.status.success() && !text.contains("STATE") {
        return None;
    }
    if text.contains("RUNNING") {
        Some("running".into())
    } else if text.contains("STOPPED") {
        Some("stopped".into())
    } else if text.contains("STATE") {
        Some("present".into())
    } else {
        None
    }
}

#[cfg(not(windows))]
fn service_state(_name: &str) -> Option<String> {
    None
}

fn map_service(id: &str, name: &str, svc: &str, extra_ok: bool, offline_detail: &str) -> SensorCheck {
    match service_state(svc) {
        Some(state) if state == "running" => SensorCheck {
            id: id.into(),
            name: name.into(),
            state: "normal".into(),
            detail: format!("serviço {svc} running"),
        },
        Some(state) => SensorCheck {
            id: id.into(),
            name: name.into(),
            state: "degraded".into(),
            detail: format!("serviço {svc} {state}"),
        },
        None if extra_ok => SensorCheck {
            id: id.into(),
            name: name.into(),
            state: "degraded".into(),
            detail: "binário/config presente; serviço não confirmado".into(),
        },
        None => SensorCheck {
            id: id.into(),
            name: name.into(),
            state: "offline".into(),
            detail: offline_detail.into(),
        },
    }
}

pub fn probe() -> EndpointHealth {
    let root = nexus_root();
    let sysmon_bin = path_exists(&PathBuf::from(r"C:\Windows\Sysmon64.exe"))
        || path_exists(&PathBuf::from(r"C:\Windows\Sysmon.exe"))
        || path_exists(&root.join("Sysmon64.exe"))
        || path_exists(&root.join("Sysmon.exe"));
    let sysmon_cfg = path_exists(&root.join("sysmon.xml"));

    let mut sysmon = map_service(
        "sysmon",
        "Sysmon",
        "Sysmon64",
        sysmon_bin || sysmon_cfg,
        "Sysmon não instalado — baixe o binário oficial da Microsoft",
    );
    if sysmon.state == "offline" {
        sysmon = map_service(
            "sysmon",
            "Sysmon",
            "Sysmon",
            sysmon_bin || sysmon_cfg,
            "Sysmon não instalado — baixe o binário oficial da Microsoft",
        );
    }
    if sysmon_cfg && sysmon.state != "normal" && sysmon.detail.contains("não instalado") {
        sysmon.detail = "sysmon.xml versionado encontrado; serviço ausente".into();
        sysmon.state = "degraded".into();
    }

    let wazuh = map_service(
        "wazuh",
        "Wazuh Agent",
        "WazuhSvc",
        path_exists(&PathBuf::from(r"C:\Program Files (x86)\ossec-agent\wazuh-agent.exe"))
            || path_exists(&PathBuf::from(r"C:\Program Files\ossec-agent\wazuh-agent.exe")),
        "Wazuh Agent não registrado — use o MSI oficial",
    );

    let vault = SensorCheck {
        id: "vault".into(),
        name: "Evidence Vault".into(),
        state: "normal".into(),
        detail: "SQLite local pronto".into(),
    };

    let velociraptor = SensorCheck {
        id: "velociraptor".into(),
        name: "Velociraptor".into(),
        state: "offline".into(),
        detail: "Opcional — servidor Linux + MSI gerado pelo próprio servidor".into(),
    };

    let checks = vec![sysmon, wazuh, vault, velociraptor];
    let normals = checks
        .iter()
        .filter(|c| c.state == "normal" || c.state == "protected")
        .count();
    let overall = if normals == 0 {
        "offline"
    } else if normals < checks.len() {
        "degraded"
    } else {
        "protected"
    };

    EndpointHealth {
        overall: overall.into(),
        host: hostname(),
        checks,
    }
}

fn hostname() -> String {
    std::env::var("COMPUTERNAME")
        .or_else(|_| std::env::var("HOSTNAME"))
        .unwrap_or_else(|_| "local".into())
}
