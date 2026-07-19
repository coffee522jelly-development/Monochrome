use windows::Storage::StorageFile;
use windows::Graphics::Imaging::BitmapDecoder;
use windows::Media::Ocr::OcrEngine;
use windows::core::HSTRING;

pub async fn extract_text(file_path: &str) -> windows::core::Result<String> {
    let file = StorageFile::GetFileFromPathAsync(&HSTRING::from(file_path))?.await?;
    let stream = file.OpenAsync(windows::Storage::FileAccessMode::Read)?.await?;
    let decoder = BitmapDecoder::CreateAsync(&stream)?.await?;
    let software_bitmap = decoder.GetSoftwareBitmapAsync()?.await?;

    let engine = OcrEngine::TryCreateFromUserProfileLanguages()?;
    let result = engine.RecognizeAsync(&software_bitmap)?.await?;

    Ok(result.Text()?.to_string())
}
