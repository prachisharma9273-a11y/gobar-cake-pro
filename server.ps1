$port = 8000
$listener = New-Object Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Listening on http://localhost:$port/"

while ($listener.IsListening) {
    # It blocking waits here until a request comes in
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $path = $request.Url.LocalPath
    if ($path -eq "/") { $path = "/index.html" }
    
    # Secure the path
    $filepath = Join-Path (Get-Location).Path $path.TrimStart('/')
    
    if (Test-Path $filepath -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($filepath).ToLower()
        $mime = "application/octet-stream"
        switch ($ext) {
            ".html" { $mime = "text/html; charset=utf-8" }
            ".css"  { $mime = "text/css" }
            ".js"   { $mime = "application/javascript" }
            ".png"  { $mime = "image/png" }
            ".jpg"  { $mime = "image/jpeg" }
            ".jpeg" { $mime = "image/jpeg" }
        }
        
        $response.ContentType = $mime
        try {
            $buffer = [System.IO.File]::ReadAllBytes($filepath)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.StatusCode = 200
        } catch {
            $response.StatusCode = 500
        }
    } else {
        $response.StatusCode = 404
        $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
    }
    $response.Close()
}
