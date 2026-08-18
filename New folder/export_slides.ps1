$ppt = New-Object -ComObject PowerPoint.Application
$pres = $ppt.Presentations.Open("c:\Users\himan\.gemini\antigravity\scratch\New folder\SIH2025_EduMitra_AI_Presentation.pptx", [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
$i = 1
foreach ($slide in $pres.Slides) {
    $out = "c:\Users\himan\.gemini\antigravity\scratch\New folder\slide_$i.png"
    $slide.Export($out, "PNG", 1920, 1080)
    Write-Host "Exported slide $i to $out"
    $i++
}
$pres.Close()
$ppt.Quit()
