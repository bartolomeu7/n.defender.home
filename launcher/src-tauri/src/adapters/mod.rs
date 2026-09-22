//! Adapters talk to local defensive engines only.

pub mod endpoint;
pub mod gateway;

pub struct AdapterHealth {
    pub name: &'static str,
    pub ready: bool,
}

#[allow(dead_code)]
pub fn inventory() -> Vec<AdapterHealth> {
    let health = endpoint::probe();
    health
        .checks
        .iter()
        .map(|c| AdapterHealth {
            name: "endpoint",
            ready: c.state == "normal" || c.state == "protected",
        })
        .collect()
}
