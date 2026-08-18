$htmlContent = Get-Content -Path "c:\Users\himan\.gemini\antigravity\scratch\New folder\edumitra_slides.html" -Raw

# Extract CSS head
$headMatch = [regex]::Match($htmlContent, "<head>[\s\S]*?</head>")
$head = $headMatch.Value

# Split slides by comment tag <!-- SLIDE X -->
$parts = $htmlContent -split "<!-- SLIDE \d+ -->"

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"

$i = 1
for ($idx = 1; $idx -lt $parts.Length; $idx++) {
    $slideChunk = $parts[$idx].Trim()
    if ($slideChunk.Length -gt 10) {
        $singleSlideHtml = @"
<!DOCTYPE html>
<html lang="en">
$head
<body style="background:#0F172A; margin:0; padding:0; overflow:hidden;">
$slideChunk
</body>
</html>
"@
        $tmpHtml = "c:\Users\himan\.gemini\antigravity\scratch\New folder\slide_tmp_$i.html"
        Set-Content -Path $tmpHtml -Value $singleSlideHtml -Encoding UTF8
        
        $pngOut = "c:\Users\himan\.gemini\antigravity\scratch\New folder\prof_slide_$i.png"
        Write-Host "Rendering Slide $i to $pngOut..."
        
        $argList = "--headless --disable-gpu --window-size=1920,1080 --screenshot=`"$pngOut`" `"$tmpHtml`""
        Start-Process -FilePath $chromePath -ArgumentList $argList -Wait
        $i++
    }
}
Write-Host "Completed rendering all slides!"
