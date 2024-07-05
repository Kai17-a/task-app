// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use std::fs;
use std::path::Path;
use std::time::{SystemTime};
use filetime::{FileTime, set_file_times};
#[tauri::command]
fn upload_file(target_path: &str, file_name: &str) {
    let roming_path = get_roaming_path();
    let _ = fs::create_dir_all(format!("{}", roming_path.clone()));
    fs::copy(target_path, format!("{}{}", roming_path.clone(), file_name)).expect("failed");
}

#[tauri::command]
fn download_file(target_path: &str, destination: &str) {
    let now = SystemTime::now();
    let file_time = FileTime::from_system_time(now);
    let path = Path::new(target_path);
    let _ = set_file_times(path, file_time, file_time);
    fs::copy(target_path, destination).expect("failed");
}

#[tauri::command]
fn delete_file(file_name: &str) {
    let roming_path = get_roaming_path();
    fs::remove_file(format!("{}{}", roming_path.clone(), file_name)).expect("failed");
}

use directories::BaseDirs;
fn get_roaming_path() -> String {
    if let Some(base_dirs) = BaseDirs::new() {
        let config_dir = base_dirs.config_dir();
        return format!("{}/com.tauri.task-app/files/", config_dir.to_string_lossy());
    }
    "".to_string()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, upload_file, delete_file, download_file])
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(
                    "sqlite:task_app.db",
                    vec![tauri_plugin_sql::Migration {
                        version: 1,
                        description: "create_initial_tables",
                        sql: include_str!("../migrations/init.sql"),
                        kind: tauri_plugin_sql::MigrationKind::Up,
                    }],
                )
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
