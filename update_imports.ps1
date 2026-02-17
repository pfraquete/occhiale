Get-ChildItem -Path src -Include *.tsx, *.ts -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName
    $newContent = $content `
        -replace '@/lib/supabase', '@/shared/lib/supabase' `
        -replace '@/lib/utils', '@/shared/lib/utils' `
        -replace '@/lib/types', '@/shared/types'
    
    if ($content -ne $newContent) {
        $newContent | Set-Content $_.FullName
        Write-Host "Updated $($_.FullName)"
    }
}
