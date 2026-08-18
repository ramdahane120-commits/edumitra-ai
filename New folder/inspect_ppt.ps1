$ppt = New-Object -ComObject PowerPoint.Application
$pres = $ppt.Presentations.Open("c:\Users\himan\.gemini\antigravity\scratch\New folder\SIH-25_Endeavours.pptx", [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)

Write-Host "Total Slides: $($pres.Slides.Count)"

foreach ($slide in $pres.Slides) {
    Write-Host "==================== SLIDE $($slide.SlideIndex) ===================="
    foreach ($shape in $slide.Shapes) {
        if ($shape.HasTextFrame -and $shape.TextFrame.HasText) {
            Write-Host "--- Shape Text ($($shape.Name)) ---"
            Write-Host $shape.TextFrame.TextRange.Text
        }
    }
}

$pres.Close()
$ppt.Quit()
