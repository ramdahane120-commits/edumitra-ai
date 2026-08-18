Add-Type -AssemblyName System.IO.Compression.FileSystem

function Read-PPTX ($filePath) {
    Write-Host "=================================================="
    Write-Host "FILE: $filePath"
    if (-not (Test-Path $filePath)) {
        Write-Host "FILE NOT FOUND!"
        return
    }
    $tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ([System.IO.Path]::GetRandomFileName())
    [System.IO.Compression.ZipFile]::ExtractToDirectory($filePath, $tempDir)
    
    $slidesDir = Join-Path $tempDir "ppt\slides"
    if (Test-Path $slidesDir) {
        $slideFiles = Get-ChildItem -Path $slidesDir -Filter "slide*.xml" | Sort-Object { [int]($_.BaseName -replace '\D','') }
        Write-Host "Total Slides: $($slideFiles.Count)"
        $i = 1
        foreach ($file in $slideFiles) {
            $xml = [xml](Get-Content $file.FullName)
            $nodes = $xml.SelectNodes("//*[local-name()='t']")
            $texts = @()
            foreach ($n in $nodes) {
                if ($n.InnerText) { $texts += $n.InnerText.Trim() }
            }
            Write-Host "--- Slide $i ---"
            Write-Host ($texts -join " ")
            Write-Host ""
            $i++
        }
    } else {
        Write-Host "No slides found in PPTX."
    }
    Remove-Item -Recurse -Force $tempDir
}

Read-PPTX "C:\Users\himan\Downloads\SIH-25_Endeavours.pptx"
Read-PPTX "C:\Users\himan\Downloads\SIH2025-IDEA-Presentation-Format (1).pptx"
