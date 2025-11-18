'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, ImageIcon } from 'lucide-react'
import { DesignGenerator } from '@/components/design-generator'

export default function HomePage() {
  const [frontImage, setFrontImage] = useState<string | null>(null)
  const [backImage, setBackImage] = useState<string | null>(null)
  const [size, setSize] = useState('')
  const [price, setPrice] = useState('')
  const [designType, setDesignType] = useState<'story-single' | 'story-double' | 'post'>('story-single')

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'front' | 'back'
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (type === 'front') {
          setFrontImage(event.target?.result as string)
        } else {
          setBackImage(event.target?.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const canGenerate = frontImage && size && price

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="KORLOE THRIFT" 
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-stone-900 mb-2">
            Generador de Diseños
          </h1>
          <p className="text-stone-600">
            Crea automáticamente Stories y Posts profesionales para Instagram
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-2xl">Configuración</CardTitle>
              <CardDescription>
                Sube las imágenes de tu prenda e ingresa los detalles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Front Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="front-image" className="text-base font-semibold">
                  Imagen Frontal *
                </Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="relative overflow-hidden"
                    onClick={() => document.getElementById('front-image')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Imagen
                  </Button>
                  <input
                    id="front-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'front')}
                  />
                  {frontImage && (
                    <span className="text-sm text-green-600 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Imagen cargada
                    </span>
                  )}
                </div>
                {frontImage && (
                  <img
                    src={frontImage}
                    alt="Vista previa frontal"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-stone-200"
                  />
                )}
              </div>

              {/* Back Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="back-image" className="text-base font-semibold">
                  Imagen Trasera (Opcional)
                </Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('back-image')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Imagen
                  </Button>
                  <input
                    id="back-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'back')}
                  />
                  {backImage && (
                    <span className="text-sm text-green-600 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Imagen cargada
                    </span>
                  )}
                </div>
                {backImage && (
                  <img
                    src={backImage}
                    alt="Vista previa trasera"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-stone-200"
                  />
                )}
              </div>

              {/* Size Input */}
              <div className="space-y-2">
                <Label htmlFor="size" className="text-base font-semibold">
                  Talla *
                </Label>
                <Input
                  id="size"
                  placeholder="Ej: S, M, L, XL"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="text-lg"
                />
              </div>

              {/* Price Input */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-base font-semibold">
                  Precio *
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Ej: 5"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="text-lg"
                />
              </div>

              {/* Design Type Selection */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Tipo de Diseño</Label>
                <Tabs value={designType} onValueChange={(v) => setDesignType(v as 'story-single' | 'story-double' | 'post')}>
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
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-2xl">Vista Previa</CardTitle>
              <CardDescription>
                Tu diseño se mostrará aquí
              </CardDescription>
            </CardHeader>
            <CardContent>
              {canGenerate ? (
                <DesignGenerator
                  frontImage={frontImage}
                  backImage={backImage}
                  size={size}
                  price={price}
                  designType={designType}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-stone-300 rounded-lg bg-stone-50">
                  <ImageIcon className="h-16 w-16 text-stone-400 mb-4" />
                  <p className="text-stone-500 text-center">
                    Completa los campos requeridos para ver la vista previa
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
