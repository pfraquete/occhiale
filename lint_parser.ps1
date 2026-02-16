$json = Get-Content errors.json | ConvertFrom-Json
foreach ($f in $json) {
    if ($f.errorCount -gt 0) {
        "FILE: $($f.filePath)" | Out-File -Append lint_report.txt
        foreach ($m in $f.messages) {
            "  $($m.line):$($m.column) $($m.message)" | Out-File -Append lint_report.txt
        }
    }
}
