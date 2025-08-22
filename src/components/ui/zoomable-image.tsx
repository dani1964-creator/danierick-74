import * as React from "react"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface ZoomableImageProps {
  src: string
  alt: string
  className?: string
}

export function ZoomableImage({ src, alt, className }: ZoomableImageProps) {
  const [scale, setScale] = React.useState(1)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
  const containerRef = React.useRef<HTMLDivElement>(null)
  const imageRef = React.useRef<HTMLImageElement>(null)

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 4))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 1))
    if (scale <= 1.5) {
      setPosition({ x: 0, y: 0 })
    }
  }

  const handleReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (isDragging && scale > 1) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      
      // Limite o movimento baseado no tamanho da imagem e container
      const container = containerRef.current
      const image = imageRef.current
      
      if (container && image) {
        const containerRect = container.getBoundingClientRect()
        const scaledWidth = image.naturalWidth * scale
        const scaledHeight = image.naturalHeight * scale
        
        const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2)
        const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2)
        
        setPosition({
          x: Math.max(-maxX, Math.min(maxX, newX)),
          y: Math.max(-maxY, Math.min(maxY, newY))
        })
      }
    }
  }, [isDragging, dragStart, scale])

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false)
  }, [])

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.2 : 0.2
    const newScale = Math.max(1, Math.min(4, scale + delta))
    setScale(newScale)
    
    if (newScale <= 1) {
      setPosition({ x: 0, y: 0 })
    }
  }

  return (
    <div className="relative w-full h-full group">
      <div 
        ref={containerRef}
        className="w-full h-full overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className={cn("w-full h-full object-contain transition-transform duration-200", className)}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          draggable={false}
        />
      </div>
      
      {/* Controles de Zoom - Apenas em desktop */}
      <div className="hidden md:flex absolute top-4 left-4 bg-black/60 rounded-lg p-2 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={handleZoomIn}
          disabled={scale >= 4}
          className="p-2 text-white hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Aumentar zoom"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          disabled={scale <= 1}
          className="p-2 text-white hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Diminuir zoom"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleReset}
          disabled={scale === 1 && position.x === 0 && position.y === 0}
          className="p-2 text-white hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Resetar zoom"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Indicador de zoom - Apenas em desktop */}
      {scale > 1 && (
        <div className="hidden md:block absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {Math.round(scale * 100)}%
        </div>
      )}
      
      {/* Dica de uso - Apenas em desktop */}
      {scale === 1 && (
        <div className="hidden md:block absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          Use a roda do mouse ou os botões para fazer zoom
        </div>
      )}
    </div>
  )
}