$paths = @(
    'C:\Program Files\Microsoft Office\root\Office16\POWERPNT.EXE',
    'C:\Program Files (x86)\Microsoft Office\root\Office16\POWERPNT.EXE',
    'C:\Program Files (x86)\Microsoft Office\Office16\POWERPNT.EXE',
    'C:\Program Files (x86)\Microsoft Office\Office15\POWERPNT.EXE',
    'C:\Program Files (x86)\Microsoft Edge\Application\msedge.exe',
    'C:\Program Files\Google\Chrome\Application\chrome.exe',
    'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    'C:\Program Files\nodejs\node.exe',
    'C:\Users\' + $env:USERNAME + '\AppData\Local\Programs\Python\Python312\python.exe',
    'C:\Users\' + $env:USERNAME + '\AppData\Local\Programs\Python\Python311\python.exe',
    'C:\Users\' + $env:USERNAME + '\AppData\Local\Programs\Python\Python310\python.exe',
    'C:\Users\' + $env:USERNAME + '\AppData\Local\Programs\Microsoft\VS Code\Code.exe'
)
foreach ($p in $paths) {
    if (Test-Path $p) { Write-Host "FOUND: $p" }
}

# Check COM object PowerPoint
try {
    $ppt = New-Object -ComObject PowerPoint.Application
    Write-Host "PowerPoint COM Object is available!"
    $ppt.Quit()
} catch {
    Write-Host "PowerPoint COM Object failed: $_"
}
