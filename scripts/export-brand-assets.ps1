# Exports the ClaseFit brand PNGs (app icon, Android adaptive icon, splash image and in-app mark)
# from the single source of truth: assets/brand/clasefit-mark.svg (paths and gradient).
# Uses GDI+ (System.Drawing), available in Windows PowerShell 5.1, so no extra dependency is needed.
# Usage (from the repository root):  powershell -ExecutionPolicy Bypass -File scripts/export-brand-assets.ps1
param(
  [string]$Svg = 'assets/brand/clasefit-mark.svg',
  [string]$OutDir = 'assets',
  [string]$Only = ''
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$background = [System.Drawing.ColorTranslator]::FromHtml('#0B1220')
$glow = [System.Drawing.ColorTranslator]::FromHtml('#16253A')

$svgText = Get-Content -Raw -Path $Svg
$pathData = [regex]::Matches($svgText, '<path[^>]*\sd="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
$stops = [regex]::Matches($svgText, 'offset="([\d.]+)"\s+stop-color="(#[0-9A-Fa-f]{6})"') | ForEach-Object {
  [pscustomobject]@{ Offset = [single]$_.Groups[1].Value; Color = [System.Drawing.ColorTranslator]::FromHtml($_.Groups[2].Value) }
}
$line = [regex]::Match($svgText, 'x1="([\d.]+)"\s+y1="([\d.]+)"\s+x2="([\d.]+)"\s+y2="([\d.]+)"')

# Builds the mark in SVG user units (0..100). Supports the absolute M, C, L and Z commands used by the source.
function New-MarkPath {
  # Nonzero winding, like SVG's default fill-rule: overlapping strokes do not cancel each other.
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath([System.Drawing.Drawing2D.FillMode]::Winding)
  foreach ($d in $pathData) {
    $tokens = @([regex]::Matches($d, '[MCLZ]|-?\d+(?:\.\d+)?') | ForEach-Object { $_.Value })
    $i = 0
    $current = $null
    while ($i -lt $tokens.Count) {
      $command = $tokens[$i]
      $i++
      switch ($command) {
        'M' {
          $path.StartFigure()
          $current = New-Object System.Drawing.PointF([single]$tokens[$i], [single]$tokens[$i + 1])
          $i += 2
        }
        'C' {
          $c1 = New-Object System.Drawing.PointF([single]$tokens[$i], [single]$tokens[$i + 1])
          $c2 = New-Object System.Drawing.PointF([single]$tokens[$i + 2], [single]$tokens[$i + 3])
          $end = New-Object System.Drawing.PointF([single]$tokens[$i + 4], [single]$tokens[$i + 5])
          $path.AddBezier($current, $c1, $c2, $end)
          $current = $end
          $i += 6
        }
        'L' {
          $end = New-Object System.Drawing.PointF([single]$tokens[$i], [single]$tokens[$i + 1])
          $path.AddLine($current, $end)
          $current = $end
          $i += 2
        }
        'Z' { $path.CloseFigure() }
      }
    }
  }
  return $path
}

function New-MarkBrush([bool]$Monochrome) {
  if ($Monochrome) { return New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White) }
  $p1 = New-Object System.Drawing.PointF([single]$line.Groups[1].Value, [single]$line.Groups[2].Value)
  $p2 = New-Object System.Drawing.PointF([single]$line.Groups[3].Value, [single]$line.Groups[4].Value)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($p1, $p2, $stops[0].Color, $stops[-1].Color)
  $blend = New-Object System.Drawing.Drawing2D.ColorBlend($stops.Count)
  $blend.Colors = [System.Drawing.Color[]]@($stops | ForEach-Object { $_.Color })
  $blend.Positions = [single[]]@($stops | ForEach-Object { $_.Offset })
  $brush.InterpolationColors = $blend
  $brush.WrapMode = [System.Drawing.Drawing2D.WrapMode]::TileFlipXY
  return $brush
}

# Draws the dark background with a soft glow behind the mark (opaque images only).
function Add-Background($graphics, [int]$size) {
  $graphics.Clear($background)
  $ellipse = New-Object System.Drawing.Drawing2D.GraphicsPath
  $ellipse.AddEllipse([single]($size * 0.1), [single]($size * 0.1), [single]($size * 0.8), [single]($size * 0.8))
  $radial = New-Object System.Drawing.Drawing2D.PathGradientBrush($ellipse)
  $radial.CenterColor = $glow
  $radial.SurroundColors = [System.Drawing.Color[]]@($background)
  $graphics.FillPath($radial, $ellipse)
  $radial.Dispose()
  $ellipse.Dispose()
}

# Renders one PNG: the mark is centered by its bounds and scaled to $fraction of the image height.
function Export-Png([string]$file, [int]$size, [double]$fraction, [bool]$opaque, [bool]$monochrome) {
  if ($Only -and ($file -notlike "*$Only*")) { return }
  $bitmap = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  if ($opaque) { Add-Background $graphics $size } else { $graphics.Clear([System.Drawing.Color]::Transparent) }

  if ($fraction -gt 0) {
    $mark = New-MarkPath
    $bounds = $mark.GetBounds()
    $scale = ($size * $fraction) / $bounds.Height
    $graphics.TranslateTransform([single](($size - $bounds.Width * $scale) / 2 - $bounds.X * $scale), [single](($size - $bounds.Height * $scale) / 2 - $bounds.Y * $scale))
    $graphics.ScaleTransform([single]$scale, [single]$scale)
    $brush = New-MarkBrush $monochrome
    $graphics.FillPath($brush, $mark)
    $brush.Dispose()
    $mark.Dispose()
  }
  $graphics.Dispose()

  $root = if ([System.IO.Path]::IsPathRooted($OutDir)) { $OutDir } else { Join-Path (Get-Location).Path $OutDir }
  $target = [System.IO.Path]::GetFullPath((Join-Path $root $file))
  New-Item -ItemType Directory -Force -Path ([System.IO.Path]::GetDirectoryName($target)) | Out-Null
  $bitmap.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
  Write-Output "exported $target ($size x $size)"
}

#          file                              size  mark   opaque  monochrome
Export-Png 'icon.png'                         1024  0.56   $true   $false
Export-Png 'android-icon-background.png'      512   0      $true   $false
Export-Png 'android-icon-foreground.png'      512   0.40   $false  $false
Export-Png 'android-icon-monochrome.png'      432   0.40   $false  $true
Export-Png 'splash-icon.png'                  1024  0.50   $false  $false
Export-Png 'favicon.png'                      48    0.60   $true   $false
Export-Png 'brand/brand-mark.png'             288   0.94   $false  $false
