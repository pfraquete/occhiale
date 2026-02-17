Get-ChildItem -Path src, tests -Include *.tsx, *.ts -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName
    $originalContent = $content -join "`n"
    
    $newContent = $content `
        -replace '@/components/ui/', '@/shared/ui/components/' `
        -replace '@/lib/supabase', '@/shared/lib/supabase' `
        -replace '@/lib/utils', '@/shared/lib/utils' `
        -replace '@/lib/types', '@/shared/types' `
        -replace '@/lib/actions/auth', '@/modules/core/auth/actions/auth' `
        -replace '@/hooks/use-auth', '@/modules/core/auth/hooks/use-auth' `
        -replace '@/lib/validations/auth', '@/modules/core/auth/lib/validations' `
        -replace '@/lib/actions/crm', '@/modules/core/crm/actions/crm' `
        -replace '@/components/dashboard/customers-', '@/modules/core/crm/components/customers-'

    $newContentString = $newContent -join "`n"

    if ($originalContent -ne $newContentString) {
        $newContent | Set-Content $_.FullName
        Write-Host "Updated $($_.FullName)"
    }
}
