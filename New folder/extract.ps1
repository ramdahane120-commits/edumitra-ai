Add-Type -AssemblyName System.IO.Compression.FileSystem

function Read-PptxText($path) {
    Write-Host "==================== FILE: $path ===================="
    $z = [System.IO.Compression.ZipFile]::OpenRead($path)
    $entries = $z.Entries | Where-Object { $_.FullName -like 'ppt/slides/slide*.xml' } | Sort-Object FullName
    foreach ($e in $entries) {
        Write-Host "--- $($e.FullName) ---"
        $s = $e.Open()
        $r = New-Object System.IO.StreamReader($s)
        $t = $r.ReadToEnd()
        $r.Close()
        $s.Close()
        $clean = [regex]::Replace($t, '<[^>]+>', ' ')
        $clean = [regex]::Replace($clean, '\s+', ' ')
        Write-Host $clean
        Write-Host ""
    }
    $z.Dispose()
}

Read-PptxText 'SIH2025-IDEA-Presentation-Format (1).pptx'
Read-PptxText 'SIH-25_Endeavours.pptx'
