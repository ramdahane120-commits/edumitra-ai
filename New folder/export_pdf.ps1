$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$inHtml = "c:\Users\himan\.gemini\antigravity\scratch\New folder\edumitra_slides.html"
$outPdf = "c:\Users\himan\.gemini\antigravity\scratch\New folder\SIH2025_EduMitra_AI_Professional.pdf"

Write-Host "Printing PDF via Chrome..."
Start-Process -FilePath $chrome -ArgumentList "--headless --disable-gpu --print-to-pdf=`"$outPdf`" --no-pdf-header-footer `"$inHtml`"" -Wait
Write-Host "PDF generated successfully!"
