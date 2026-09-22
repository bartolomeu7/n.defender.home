mod adapters;
mod commands;
mod core;
mod evidence;
mod policy;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let _ = evidence::append_audit("launcher_start");
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::health_ping,
            commands::score_risk,
            commands::list_audit,
            commands::forbidden_actions
        ])
        .run(tauri::generate_context!())
        .expect("error while running NEXUS DEFENDER");
}
