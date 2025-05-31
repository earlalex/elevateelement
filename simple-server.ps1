$port = 8080

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Server running at http://localhost:$port/"
Write-Host "Press Ctrl+C to stop the server"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        Write-Host "$($request.HttpMethod) $($request.Url.LocalPath)"
        
        # Get the requested file path
        $filePath = Join-Path (Get-Location) ($request.Url.LocalPath.TrimStart('/'))
        
        # Default to index.html for root or paths without extensions (SPA routes)
        if ($request.Url.LocalPath -eq '/' -or 
            ($request.Url.LocalPath -ne '/' -and [System.IO.Path]::GetExtension($filePath) -eq '' -and -not (Test-Path $filePath))) {
            $filePath = Join-Path (Get-Location) "index.html"
        }
        
        # Get content type based on extension
        $contentType = switch ([System.IO.Path]::GetExtension($filePath)) {
            '.html' { 'text/html' }
            '.js'   { 'text/javascript' }
            '.css'  { 'text/css' }
            '.json' { 'application/json' }
            '.png'  { 'image/png' }
            '.jpg'  { 'image/jpeg' }
            '.gif'  { 'image/gif' }
            '.svg'  { 'image/svg+xml' }
            '.ico'  { 'image/x-icon' }
            default { 'text/plain' }
        }
        
        try {
            if (Test-Path $filePath) {
                $content = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentType = $contentType
                $response.ContentLength64 = $content.Length
                $response.OutputStream.Write($content, 0, $content.Length)
            } else {
                # File not found, serve index.html for SPA
                $indexPath = Join-Path (Get-Location) "index.html"
                if (Test-Path $indexPath) {
                    $content = [System.IO.File]::ReadAllBytes($indexPath)
                    $response.ContentType = 'text/html'
                    $response.ContentLength64 = $content.Length
                    $response.OutputStream.Write($content, 0, $content.Length)
                } else {
                    $response.StatusCode = 404
                    $notFoundContent = [System.Text.Encoding]::UTF8.GetBytes("404 - Not Found")
                    $response.ContentLength64 = $notFoundContent.Length
                    $response.OutputStream.Write($notFoundContent, 0, $notFoundContent.Length)
                }
            }
        } catch {
            $response.StatusCode = 500
            $errorContent = [System.Text.Encoding]::UTF8.GetBytes("500 - Server Error: $_")
            $response.ContentLength64 = $errorContent.Length
            $response.OutputStream.Write($errorContent, 0, $errorContent.Length)
        } finally {
            $response.Close()
        }
    }
} finally {
    $listener.Stop()
} 