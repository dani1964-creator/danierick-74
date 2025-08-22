import * as React from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

interface SwipeableCarouselProps {
  children: React.ReactNode[]
  className?: string
  autoplay?: boolean
  autoplayDelay?: number
}

export function SwipeableCarousel({ 
  children, 
  className = "", 
  autoplay = false, 
  autoplayDelay = 3000 
}: SwipeableCarouselProps) {
  const plugin = React.useRef(
    Autoplay({ delay: autoplayDelay, stopOnInteraction: true })
  )

  return (
    <Carousel
      plugins={autoplay ? [plugin.current] : []}
      className={className}
      onMouseEnter={autoplay ? plugin.current.stop : undefined}
      onMouseLeave={autoplay ? plugin.current.reset : undefined}
    >
      <CarouselContent className="-ml-4">
        {children.map((child, index) => (
          <CarouselItem key={index} className="pl-4">
            {child}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  )
}