'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download } from 'lucide-react'

// Store the actual font family name
let passionOneFontFamily = 'Passion One'

// Load Passion One font for canvas
const loadPassionOneFont = async () => {
  try {
    // Try both possible font family names
    const fontFamilyNames = ['Passion One', 'PassionOne']
    
    // Check if font is already loaded
    for (const name of fontFamilyNames) {
      if (document.fonts.check(`1px "${name}"`)) {
        passionOneFontFamily = name
        return
      }
    }

    // Load the font file
    const font = new FontFace(
      'Passion One',
      'url(/PassionOne.ttf)',
      {
        style: 'normal',
        weight: '400'
      }
    )
    
    const loadedFont = await font.load()
    document.fonts.add(loadedFont)
    
    // Get the actual font family name from the loaded font
    passionOneFontFamily = loadedFont.family.replace(/['"]/g, '')
    
    // Wait for fonts to be ready before proceeding
    await document.fonts.ready
    
    // Verify font is loaded with the actual family name
    if (!document.fonts.check(`1px "${passionOneFontFamily}"`)) {
      console.warn('Passion One font may not be loaded correctly')
    }
  } catch (error) {
    console.error('Failed to load Passion One font:', error)
    // Font will fallback to system font if loading fails
    passionOneFontFamily = 'Passion One'
  }
}

interface DesignGeneratorProps {
  frontImage: string | null
  backImage: string | null
  size: string
  price: string
  designType: 'story-single' | 'story-double' | 'post'
  onDesignTypeChange: (type: 'story-single' | 'story-double' | 'post') => void
}

export function DesignGenerator({
  frontImage,
  backImage,
  size,
  price,
  designType,
  onDesignTypeChange,
}: DesignGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateDesign = useCallback(async () => {
    if (!canvasRef.current || !frontImage) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsGenerating(true)

    // Load Passion One font before rendering
    await loadPassionOneFont()
    
    // Small delay to ensure font is fully ready for canvas rendering
    await new Promise(resolve => setTimeout(resolve, 100))

    // Set canvas dimensions based on design type
    if (designType === 'post') {
      canvas.width = 1080
      canvas.height = 1350
    } else {
      canvas.width = 1080
      canvas.height = 1920
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background image
    await drawBackground(ctx, canvas.width, canvas.height)

    // Draw watermark pattern
    await drawWatermarkPattern(ctx, canvas.width, canvas.height)

    // Generate design based on type
    if (designType === 'story-single') {
      await drawStorySingle(ctx, canvas.width, canvas.height, frontImage, size, price)
    } else if (designType === 'story-double' && backImage) {
      await drawStoryDouble(ctx, canvas.width, canvas.height, frontImage, backImage, size, price)
    } else if (designType === 'post') {
      await drawPost(ctx, canvas.width, canvas.height, frontImage, size, price)
    }

    setIsGenerating(false)
  }, [frontImage, backImage, size, price, designType])

  useEffect(() => {
    generateDesign()
  }, [generateDesign])

  const drawBackground = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const bg = new Image()
    bg.crossOrigin = 'anonymous'
    
    return new Promise<void>((resolve) => {
      bg.onload = () => {
        // Use natural dimensions to preserve original aspect ratio
        const imgWidth = bg.naturalWidth || bg.width
        const imgHeight = bg.naturalHeight || bg.height
        
        // Calculate scale to cover entire canvas while maintaining aspect ratio
        const scale = Math.max(width / imgWidth, height / imgHeight)
        
        // Calculate scaled dimensions maintaining original aspect ratio
        const scaledWidth = imgWidth * scale
        const scaledHeight = imgHeight * scale
        
        // Center the image
        const offsetX = (width - scaledWidth) / 2
        const offsetY = (height - scaledHeight) / 2
        
        // Draw image using source dimensions to preserve aspect ratio
        ctx.drawImage(
          bg,
          0, 0, imgWidth, imgHeight, // Source rectangle (full image)
          offsetX, offsetY, scaledWidth, scaledHeight // Destination rectangle
        )
        resolve()
      }
      bg.onerror = () => {
        // Fallback to white background if image fails to load
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)
        resolve()
      }
      bg.src = '/bg.png'
    })
  }

  const drawWatermarkPattern = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const logo = new Image()
    logo.crossOrigin = 'anonymous'
    
    return new Promise<void>((resolve) => {
      logo.onload = () => {
        ctx.globalAlpha = 0.03
        const logoSize = 120
        const spacing = 180

        for (let y = -logoSize; y < height + logoSize; y += spacing) {
          for (let x = -logoSize; x < width + logoSize; x += spacing) {
            ctx.drawImage(logo, x, y, logoSize, logoSize)
          }
        }
        ctx.globalAlpha = 1
        resolve()
      }
      logo.onerror = () => resolve()
      logo.src = '/logo.png'
    })
  }


  const drawStorySingle = async (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    frontImg: string,
    size: string,
    price: string
  ) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    return new Promise<void>((resolve) => {
      img.onload = async () => {
        // Draw clothing image
        const imgSize = 650
        const imgX = (width - imgSize) / 2
        const imgY = 180
        
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize)

        // Draw size and price
        const textY = imgY + imgSize + 120
        
        ctx.fillStyle = '#000000'
        ctx.font = `bold 72px "${passionOneFontFamily}"`
        ctx.textAlign = 'center'
        ctx.fillText(`Talla ${size.toUpperCase()}`, width / 2, textY)
        
        ctx.font = `bold 80px "${passionOneFontFamily}"`
        ctx.fillText(`Precio: $${price}`, width / 2, textY + 100)

        // Draw logo at bottom
        await drawLogo(ctx, width / 2, height - 250, 280)
        resolve()
      }
      img.onerror = () => resolve()
      img.src = frontImg
    })
  }

  const drawStoryDouble = async (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    frontImg: string,
    backImg: string,
    size: string,
    price: string
  ) => {
    const imgFront = new Image()
    const imgBack = new Image()
    imgFront.crossOrigin = 'anonymous'
    imgBack.crossOrigin = 'anonymous'

    const loadImages = Promise.all([
      new Promise<void>((resolve) => {
        imgFront.onload = () => resolve()
        imgFront.onerror = () => resolve()
        imgFront.src = frontImg
      }),
      new Promise<void>((resolve) => {
        imgBack.onload = () => resolve()
        imgBack.onerror = () => resolve()
        imgBack.src = backImg
      }),
    ])

    await loadImages

    await drawLogo(ctx, width - 180, 150, 220)

    // Draw "Parte de adelante" label in top left
    ctx.fillStyle = '#000000'
    ctx.font = `bold 52px "${passionOneFontFamily}"`
    ctx.textAlign = 'left'
    ctx.fillText('Parte de adelante', 80, 140)

    // Draw front image
    const imgSize = 550
    const imgX = (width - imgSize) / 2
    const imgY = 220
    ctx.drawImage(imgFront, imgX, imgY, imgSize, imgSize)

    const middleY = imgY + imgSize + 100
    ctx.textAlign = 'center'
    ctx.font = `bold 68px "${passionOneFontFamily}"`
    ctx.fillText(`Talla ${size.toUpperCase()}`, width / 2, middleY)
    ctx.font = `bold 72px "${passionOneFontFamily}"`
    ctx.fillText(`Precio: $${price}`, width / 2, middleY + 90)

    // Draw back image
    const imgBackY = middleY + 180
    ctx.drawImage(imgBack, imgX, imgBackY, imgSize, imgSize)

    const bottomTextY = imgBackY + imgSize + 80
    ctx.textAlign = 'right'
    ctx.font = `bold 52px "${passionOneFontFamily}"`
    ctx.fillText('Parte de atrás', width - 80, bottomTextY)
  }

  const drawPost = async (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    frontImg: string,
    size: string,
    price: string
  ) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    return new Promise<void>((resolve) => {
      img.onload = async () => {
        // Draw clothing image
        const imgSize = 650
        const imgX = (width - imgSize) / 2
        const imgY = 120
        
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize)

        // Draw size and price at bottom
        const textY = imgY + imgSize + 100
        
        ctx.fillStyle = '#000000'
        ctx.font = `bold 64px "${passionOneFontFamily}"`
        ctx.textAlign = 'center'
        ctx.fillText(`Talla ${size.toUpperCase()}`, width / 2, textY)
        
        ctx.font = `bold 68px "${passionOneFontFamily}"`
        ctx.fillText(`Precio: $${price}`, width / 2, textY + 85)

        // Draw logo at bottom right
        await drawLogo(ctx, width - 180, height - 140, 200)
        resolve()
      }
      img.onerror = () => resolve()
      img.src = frontImg
    })
  }

  const drawLogo = async (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    const logo = new Image()
    logo.crossOrigin = 'anonymous'
    
    return new Promise<void>((resolve) => {
      logo.onload = () => {
        ctx.drawImage(logo, x - size / 2, y - size / 2, size, size)
        resolve()
      }
      logo.onerror = () => resolve()
      logo.src = '/logo.png'
    })
  }

  const handleDownload = () => {
    if (!canvasRef.current) return

    const link = document.createElement('a')
    const fileName = `korloe-${designType}-${size}-${Date.now()}.png`
    link.download = fileName
    link.href = canvasRef.current.toDataURL('image/png', 1.0)
    link.click()
  }

  // Calculate aspect ratio based on design type
  const aspectRatio = designType === 'post' ? '4 / 5' : '9 / 16'
  
  return (
    <div className="space-y-4">
      <div className="relative bg-stone-100 rounded-lg overflow-hidden border-2 border-stone-200 flex items-center justify-center p-4 lg:p-6">
        <div 
          className="relative w-full mx-auto"
          style={{ 
            aspectRatio: aspectRatio,
            maxWidth: designType === 'post' ? 'min(500px, 100%)' : 'min(350px, 100%)',
          }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: 'block' }}
          />
          {isGenerating && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto mb-2" />
                <p className="text-stone-600">Generando diseño...</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Design Type Selection */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Tipo de Diseño</Label>
        <Tabs value={designType} onValueChange={(v) => onDesignTypeChange(v as 'story-single' | 'story-double' | 'post')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="story-single">Story Simple</TabsTrigger>
            <TabsTrigger value="story-double" disabled={!backImage}>
              Story Doble
            </TabsTrigger>
            <TabsTrigger value="post">Post</TabsTrigger>
          </TabsList>
        </Tabs>
        {designType === 'story-double' && !backImage && (
          <p className="text-sm text-amber-600">
            Necesitas subir la imagen trasera para usar Story Doble
          </p>
        )}
      </div>
      
      <Button
        onClick={handleDownload}
        className="w-full text-lg py-6 bg-stone-900 hover:bg-stone-800"
        disabled={isGenerating}
      >
        <Download className="mr-2 h-5 w-5" />
        Descargar
      </Button>
    </div>
  )
}
