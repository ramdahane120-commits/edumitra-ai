$ErrorActionPreference = "Stop"

$outPptx = "c:\Users\himan\.gemini\antigravity\scratch\New folder\SIH2025_EduMitra_AI_Professional.pptx"

Write-Host "Creating professional PowerPoint presentation..."
$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue

# Create blank presentation
$pres = $ppt.Presentations.Add([Microsoft.Office.Core.MsoTriState]::msoTrue)

# Set slide size to 16:9 Widescreen (13.333 inches x 7.5 inches = 960pt x 540pt)
$pres.PageSetup.SlideWidth = 960
$pres.PageSetup.SlideHeight = 540

for ($i = 1; $i -le 6; $i++) {
    $imgPath = "c:\Users\himan\.gemini\antigravity\scratch\New folder\prof_slide_$i.png"
    if (Test-Path $imgPath) {
        # 12 is ppLayoutBlank
        $slide = $pres.Slides.Add($i, 12)
        # Add picture covering full slide
        $slide.Shapes.AddPicture($imgPath, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoTrue, 0, 0, 960, 540) | Out-Null
        Write-Host "Added Slide $i from $imgPath"
    } else {
        Write-Host "Warning: $imgPath not found!"
    }
}

# Save PPTX
$pres.SaveAs($outPptx)
Write-Host "Saved professional presentation to $outPptx"

$pres.Close()
$ppt.Quit()
Write-Host "Done building PPTX!"
