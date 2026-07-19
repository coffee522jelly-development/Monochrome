#[cfg(target_os = "windows")]
mod ocr;

#[tauri::command]
async fn extract_text(#[allow(unused_variables)] file_path: String) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        match ocr::extract_text(&file_path).await {
            Ok(text) => Ok(text),
            Err(e) => Err(format!("Failed to extract text: {:?}", e)),
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("OCR is only supported on Windows".into())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![extract_text])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
