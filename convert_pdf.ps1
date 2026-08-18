$pptxPath = "C:\Users\himan\Downloads\SIH2025-IDEA-Presentation-Format (1).pptx"
$pdfPath = "C:\Users\himan\Downloads\SIH2025-IDEA-Presentation-Format (1).pdf"

try {
    $ppt = New-Object -ComObject PowerPoint.Application
    $presentation = $ppt.Presentations.Open($pptxPath, 1, 0, 0)
    $presentation.SaveAs($pdfPath, 32)
    $presentation.Close()
    $ppt.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
    Write-Host "SUCCESS: PDF created at $pdfPath"
} catch {
    Write-Host "Error converting: $($_.Exception.Message)"
}
