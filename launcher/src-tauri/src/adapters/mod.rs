//! Adapters talk to local defensive engines only.
//! Phase 1 ships stubs. No remote exploit, no third-party targeting.

pub struct AdapterHealth {
    pub name: &'static str,
    pub ready: bool,
}

pub fn inventory() -> Vec<AdapterHealth> {
    vec![
        AdapterHealth { name: "wazuh", ready: false },
        AdapterHealth { name: "sysmon", ready: false },
        AdapterHealth { name: "gateway", ready: false },
        AdapterHealth { name: "cti", ready: false },
    ]
}
