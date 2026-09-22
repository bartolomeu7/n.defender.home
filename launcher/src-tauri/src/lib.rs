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
            commands::forbidden_actions,
            commands::endpoint_health,
            commands::gateway_health,
            commands::list_events,
            commands::list_incidents,
            commands::record_fim_test,
            commands::record_process_test,
            commands::record_vpn_check
        ])
        .run(tauri::generate_context!())
        .expect("error while running NEXUS DEFENDER");
}
