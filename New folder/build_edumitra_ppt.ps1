$ErrorActionPreference = "Stop"

$templatePath = "c:\Users\himan\.gemini\antigravity\scratch\New folder\SIH2025-IDEA-Presentation-Format (1).pptx"
$outPptx = "c:\Users\himan\.gemini\antigravity\scratch\New folder\SIH2025_EduMitra_AI_Presentation.pptx"
$outPdf = "c:\Users\himan\.gemini\antigravity\scratch\New folder\SIH2025_EduMitra_AI_Presentation.pdf"
$imgUi = "c:\Users\himan\.gemini\antigravity\scratch\New folder\edumitra_ui.jpg"
$imgArch = "c:\Users\himan\.gemini\antigravity\scratch\New folder\edumitra_architecture.jpg"

Write-Host "Starting PowerPoint COM Application..."
$ppt = New-Object -ComObject PowerPoint.Application

$pres = $ppt.Presentations.Open($templatePath, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)

Write-Host "Slide Count: $($pres.Slides.Count)"

# Delete Slide 7 if exists (Important Instructions slide)
if ($pres.Slides.Count -ge 7) {
    $pres.Slides.Item(7).Delete()
}

# --- SLIDE 1: Title Page ---
$slide1 = $pres.Slides.Item(1)
foreach ($shape in $slide1.Shapes) {
    if ($shape.HasTextFrame -and $shape.TextFrame.HasText) {
        $txt = $shape.TextFrame.TextRange.Text
        if ($txt -like "*Problem Statement ID*") {
            $shape.TextFrame.TextRange.Text = "Problem Statement ID - [SIH2025-EDTECH-03]`nProblem Statement Title - Rajasthan AI Student Assistance Chatbot`nTheme - Smart Education / EdTech`nPS Category - Software`nTeam ID - [Your Team ID]`nTeam Name - Endeavours"
            $shape.TextFrame.TextRange.Font.Size = 16
        }
        if ($txt -like "*TITLE PAGE*") {
            $shape.TextFrame.TextRange.Text = "EduMitra AI`nRajasthan AI Student Assistance Chatbot"
            $shape.TextFrame.TextRange.Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
        }
    }
}

# --- SLIDE 2: Proposed Solution ---
$slide2 = $pres.Slides.Item(2)
foreach ($shape in $slide2.Shapes) {
    if ($shape.HasTextFrame -and $shape.TextFrame.HasText) {
        $txt = $shape.TextFrame.TextRange.Text
        if ($txt -like "*IDEA TITLE*" -or $txt -like "*Proposed Solution*") {
            $t2 = "EduMitra AI - Centralized AI Student Assistant for Rajasthan Admissions`n`n"
            $t2 += "• Multilingual AI Chatbot (Hindi / English / Voice): Answers natural language queries regarding REAP/DTE cutoffs, fees, hostels, eligibility and scholarships.`n"
            $t2 += "• Smart College Recommendation Engine: Suggests optimal engineering and polytechnic colleges based on student REAP rank, category, branch, and budget.`n"
            $t2 += "• Side-by-Side College Comparison: Evaluates institutions across placements, infrastructure, NAAC grade, and fee structures.`n"
            $t2 += "• Scholarship and Welfare Finder: Automatically maps eligible state (CM Higher Education) and central scholarships.`n"
            $t2 += "• 80%+ Reduction in Staff Workload: Automates repetitive admission office inquiries for all Rajasthan technical institutes."
            $shape.TextFrame.TextRange.Text = $t2
            $shape.TextFrame.TextRange.Font.Size = 13
        }
    }
}
# Insert UI Mockup Image into Slide 2
if (Test-Path $imgUi) {
    # Left = 480, Top = 140, Width = 450, Height = 253
    $slide2.Shapes.AddPicture($imgUi, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoTrue, 480, 140, 450, 253) | Out-Null
}

# --- SLIDE 3: Technical Approach ---
$slide3 = $pres.Slides.Item(3)
foreach ($shape in $slide3.Shapes) {
    if ($shape.HasTextFrame -and $shape.TextFrame.HasText) {
        $txt = $shape.TextFrame.TextRange.Text
        if ($txt -like "*TECHNICAL APPROACH*") {
            $t3 = "TECHNICAL APPROACH AND SYSTEM ARCHITECTURE`n`n"
            $t3 += "• Multilingual NLP and Voice Core: Bhashini API + Llama 3 for real-time Hindi/English voice and text Q and A.`n"
            $t3 += "• RAG (Retrieval-Augmented Generation): Vector DB (ChromaDB) indexing official REAP/DTE seat matrix and cutoff rulebooks.`n"
            $t3 += "• Tech Stack: React.js (Frontend PWA), Python FastAPI (AI Microservices), Node.js (Backend Gateway), PostgreSQL (College DB).`n"
            $t3 += "• High Accuracy and Zero Hallucination: Strict RAG grounding with source document citations."
            $shape.TextFrame.TextRange.Text = $t3
            $shape.TextFrame.TextRange.Font.Size = 13
        }
    }
}
# Insert Architecture Image into Slide 3
if (Test-Path $imgArch) {
    $slide3.Shapes.AddPicture($imgArch, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoTrue, 480, 140, 450, 253) | Out-Null
}

# --- SLIDE 4: Feasibility and Viability ---
$slide4 = $pres.Slides.Item(4)
foreach ($shape in $slide4.Shapes) {
    if ($shape.HasTextFrame -and $shape.TextFrame.HasText) {
        $txt = $shape.TextFrame.TextRange.Text
        if ($txt -like "*FEASIBILITY AND VIABILITY*") {
            $t4 = "FEASIBILITY, VIABILITY AND RISK MITIGATION`n`n"
            $t4 += "FEASIBILITY AND PRACTICALITY:`n"
            $t4 += "• High Technical Feasibility: Built on open-source Llama 3 + RAG requiring lightweight server infrastructure.`n"
            $t4 += "• High Accessibility: Works via Web PWA and WhatsApp Bot for low-bandwidth rural access across Rajasthan.`n`n"
            $t4 += "RISKS AND STRATEGIES:`n"
            $t4 += "• Challenge: Dynamic yearly REAP cutoff and seat updates -> Strategy: Automated admin verification pipeline for DTE data.`n"
            $t4 += "• Challenge: Rural accessibility and low digital literacy -> Strategy: Voice-based search in Hindi and regional dialects.`n"
            $t4 += "• Challenge: Information Accuracy -> Strategy: Verified source linking to official DTE Rajasthan portals."
            $shape.TextFrame.TextRange.Text = $t4
            $shape.TextFrame.TextRange.Font.Size = 13
        }
    }
}

# --- SLIDE 5: Impact and Benefits ---
$slide5 = $pres.Slides.Item(5)
foreach ($shape in $slide5.Shapes) {
    if ($shape.HasTextFrame -and $shape.TextFrame.HasText) {
        $txt = $shape.TextFrame.TextRange.Text
        if ($txt -like "*IMPACT AND BENEFITS*") {
            $t5 = "IMPACT, BENEFITS AND SUSTAINABILITY MODEL`n`n"
            $t5 += "IMPACT AND BENEFITS:`n"
            $t5 += "• For Students and Parents: Transparent, instant, 24/7 admission guidance without travel or middleman fees.`n"
            $t5 += "• For Colleges and Staff: 80% decrease in repetitive inquiry calls/emails; automated query routing.`n"
            $t5 += "• For Govt and DTE Rajasthan: Digitized student counselling; higher awareness of govt scholarships.`n`n"
            $t5 += "SUSTAINABILITY AND EXPANSION:`n"
            $t5 += "• State Adoption: Direct deployment with DTE Rajasthan and REAP counselling portal.`n"
            $t5 += "• Scalability: Extendable to ITI, Medical (NEET), and University admissions across other Indian states."
            $shape.TextFrame.TextRange.Text = $t5
            $shape.TextFrame.TextRange.Font.Size = 13
        }
    }
}

# --- SLIDE 6: Research and References ---
$slide6 = $pres.Slides.Item(6)
foreach ($shape in $slide6.Shapes) {
    if ($shape.HasTextFrame -and $shape.TextFrame.HasText) {
        $txt = $shape.TextFrame.TextRange.Text
        if ($txt -like "*RESEARCH AND REFERENCES*") {
            $t6 = "RESEARCH AND OFFICIAL REFERENCES`n`n"
            $t6 += "1. Department of Technical Education (DTE), Govt of Rajasthan - Official Admission Portals (dte.rajasthan.gov.in)`n"
            $t6 += "2. Rajasthan Engineering Admission Process (REAP) Seat Matrix and Cutoff Data Archives (2021-2024)`n"
            $t6 += "3. AICTE Approved Institutes and Placement Reports - All India Council for Technical Education`n"
            $t6 += "4. Bhashini National Language Translation Mission (bhashini.gov.in) - Indic Language AI Frameworks`n"
            $t6 += "5. Retrieval-Augmented Generation for Public Governance Q and A Systems - IEEE/ACM Literature (2024)"
            $shape.TextFrame.TextRange.Text = $t6
            $shape.TextFrame.TextRange.Font.Size = 13
        }
    }
}

# Save PPTX
$pres.SaveAs($outPptx)
Write-Host "Saved presentation PPTX to $outPptx"

# Export as PDF (ppSaveAsPDF = 32)
$pres.SaveAs($outPdf, 32)
Write-Host "Exported PDF to $outPdf"

$pres.Close()
$ppt.Quit()
Write-Host "SUCCESSFULLY CREATED PPTX AND PDF!"
