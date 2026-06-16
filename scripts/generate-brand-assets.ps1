Add-Type -AssemblyName System.Drawing

$publicDir = Join-Path $PSScriptRoot '..\public'

function New-Canvas {
  param(
    [int] $Width,
    [int] $Height,
    [string] $Color = '#00000000'
  )

  $bitmap = New-Object System.Drawing.Bitmap $Width, $Height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml($Color))

  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function New-Brush {
  param([string] $Color)
  return New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($Color))
}

function Fill-Polygon {
  param(
    [System.Drawing.Graphics] $Graphics,
    [System.Drawing.Brush] $Brush,
    [float] $X,
    [float] $Y,
    [float] $Scale,
    [float[]] $Coords
  )

  $points = New-Object System.Drawing.PointF[] ($Coords.Length / 2)
  for ($i = 0; $i -lt $Coords.Length; $i += 2) {
    $points[$i / 2] = New-Object System.Drawing.PointF (($X + ($Coords[$i] * $Scale))), (($Y + ($Coords[$i + 1] * $Scale)))
  }
  $Graphics.FillPolygon($Brush, $points)
}

function Fill-Rect {
  param(
    [System.Drawing.Graphics] $Graphics,
    [System.Drawing.Brush] $Brush,
    [float] $X,
    [float] $Y,
    [float] $Scale,
    [float] $RectX,
    [float] $RectY,
    [float] $RectW,
    [float] $RectH
  )

  $Graphics.FillRectangle($Brush, $X + ($RectX * $Scale), $Y + ($RectY * $Scale), $RectW * $Scale, $RectH * $Scale)
}

function Draw-Logo {
  param(
    [System.Drawing.Graphics] $Graphics,
    [float] $X,
    [float] $Y,
    [float] $Size,
    [switch] $Mono
  )

  $scale = $Size / 512
  $main = New-Brush '#2f6f49'
  $middle = if ($Mono) { $main } else { New-Brush '#1f5f3c' }
  $side = if ($Mono) { $main } else { New-Brush '#174f32' }

  Fill-Rect $Graphics $main $X $Y $scale 247 50 34 86
  Fill-Polygon $Graphics $main $X $Y $scale @(174, 88, 198, 64, 271, 137, 247, 161)
  Fill-Polygon $Graphics $main $X $Y $scale @(333, 64, 357, 88, 284, 161, 260, 137)
  Fill-Rect $Graphics $main $X $Y $scale 136 132 240 34
  Fill-Polygon $Graphics $main $X $Y $scale @(72, 206, 253, 206, 253, 446, 72, 383)
  Fill-Polygon $Graphics $middle $X $Y $scale @(279, 201, 383, 177, 383, 408, 279, 450)
  Fill-Polygon $Graphics $side $X $Y $scale @(407, 170, 483, 152, 483, 377, 407, 399)

  $main.Dispose()
  if (-not $Mono) {
    $middle.Dispose()
    $side.Dispose()
  }
}

function Fill-RoundedRect {
  param(
    [System.Drawing.Graphics] $Graphics,
    [System.Drawing.Brush] $Brush,
    [float] $X,
    [float] $Y,
    [float] $Width,
    [float] $Height,
    [float] $Radius
  )

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $Radius * 2
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  $Graphics.FillPath($Brush, $path)
  $path.Dispose()
}

function Save-Icon {
  param(
    [int] $Size,
    [string] $FileName
  )

  $canvas = New-Canvas $Size $Size '#00000000'
  $background = New-Brush '#f8f5ed'
  Fill-RoundedRect $canvas.Graphics $background 0 0 $Size $Size ($Size * 0.22)
  $logoSize = $Size * 0.78
  Draw-Logo $canvas.Graphics (($Size - $logoSize) / 2) (($Size - $logoSize) / 2) $logoSize
  $canvas.Bitmap.Save((Join-Path $publicDir $FileName), [System.Drawing.Imaging.ImageFormat]::Png)
  $background.Dispose()
  $canvas.Graphics.Dispose()
  $canvas.Bitmap.Dispose()
}

Save-Icon 16 'favicon-16x16.png'
Save-Icon 32 'favicon-32x32.png'
Save-Icon 180 'apple-touch-icon.png'
Save-Icon 192 'icon-192.png'
Save-Icon 512 'icon-512.png'

$og = New-Canvas 1200 630 '#f8f5ed'
$accent = New-Brush '#e9f1ea'
$green = New-Brush '#2f6f49'
Fill-RoundedRect $og.Graphics $accent 70 70 490 490 46
Draw-Logo $og.Graphics 105 95 420

$titleFont = New-Object System.Drawing.Font 'Segoe UI', 72, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$subtitleFont = New-Object System.Drawing.Font 'Segoe UI', 31, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
$textBrush = New-Brush '#172f25'
$mutedBrush = New-Brush '#476258'
$og.Graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$og.Graphics.DrawString('Gaachuqe', $titleFont, $textBrush, 620, 210)
$og.Graphics.DrawString('Free giving in Georgia', $subtitleFont, $mutedBrush, 626, 306)
$og.Graphics.FillRectangle($green, 628, 372, 230, 8)
$og.Bitmap.Save((Join-Path $publicDir 'og-image.png'), [System.Drawing.Imaging.ImageFormat]::Png)

$accent.Dispose()
$green.Dispose()
$titleFont.Dispose()
$subtitleFont.Dispose()
$textBrush.Dispose()
$mutedBrush.Dispose()
$og.Graphics.Dispose()
$og.Bitmap.Dispose()
