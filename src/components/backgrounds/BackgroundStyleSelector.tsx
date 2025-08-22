import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import BackgroundRenderer from './BackgroundRenderer';

interface BackgroundStyleSelectorProps {
  selectedStyle: string;
  color1: string;
  color2: string;
  color3: string;
  onStyleChange: (style: string) => void;
  onColorChange: (colorIndex: 1 | 2 | 3, color: string) => void;
}

const backgroundStyles = [
  {
    id: 'style1',
    name: 'Gradiente Suave',
    description: 'Fundo moderno com gradientes e elementos circulares'
  },
  {
    id: 'style2', 
    name: 'Geométrico Diagonal',
    description: 'Design com formas geométricas e overlay diagonal'
  },
  {
    id: 'style3',
    name: 'Ondas Modernas',
    description: 'Ondas fluidas com animações suaves'
  },
  {
    id: 'style4',
    name: 'Minimalista Clean',
    description: 'Design limpo com elementos sutis'
  },
  {
    id: 'style5',
    name: 'Padrão Hexagonal',
    description: 'Padrão geométrico hexagonal elegante'
  }
];

const BackgroundStyleSelector = ({
  selectedStyle,
  color1,
  color2, 
  color3,
  onStyleChange,
  onColorChange
}: BackgroundStyleSelectorProps) => {
  
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Estilo de Fundo das Seções</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Escolha o estilo visual que será aplicado nas seções "Imóveis em Destaque" e "Todos os Imóveis"
        </p>
      </div>

      {/* Style Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {backgroundStyles.map((style) => (
          <Card 
            key={style.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedStyle === style.id 
                ? 'ring-2 ring-primary shadow-md' 
                : 'hover:shadow-sm'
            }`}
            onClick={() => onStyleChange(style.id)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{style.name}</h4>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedStyle === style.id 
                      ? 'bg-primary border-primary' 
                      : 'border-border'
                  }`} />
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {style.description}
                </p>
                
                {/* Mini Preview */}
                <div className="h-20 rounded-md overflow-hidden border">
                  <BackgroundRenderer
                    style={style.id}
                    color1={color1}
                    color2={color2}
                    color3={color3}
                    className="h-full"
                  >
                    <div className="flex items-center justify-center h-full">
                      <div className="text-xs text-center opacity-60">
                        <div className="w-8 h-2 bg-current rounded mb-1 mx-auto"></div>
                        <div className="w-12 h-1 bg-current rounded opacity-60 mx-auto"></div>
                      </div>
                    </div>
                  </BackgroundRenderer>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Color Customization */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <Label className="text-base font-semibold">Personalizar Cores</Label>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color1" className="text-sm">Cor Primária</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="color1"
                    type="color"
                    value={color1}
                    onChange={(e) => onColorChange(1, e.target.value)}
                    className="w-10 h-10 rounded border border-input cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color1}
                    onChange={(e) => onColorChange(1, e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-input rounded"
                    placeholder="#2563eb"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color2" className="text-sm">Cor Secundária</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="color2"
                    type="color"
                    value={color2}
                    onChange={(e) => onColorChange(2, e.target.value)}
                    className="w-10 h-10 rounded border border-input cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color2}
                    onChange={(e) => onColorChange(2, e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-input rounded"
                    placeholder="#64748b"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color3" className="text-sm">Cor de Fundo</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="color3"
                    type="color"
                    value={color3}
                    onChange={(e) => onColorChange(3, e.target.value)}
                    className="w-10 h-10 rounded border border-input cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color3}
                    onChange={(e) => onColorChange(3, e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-input rounded"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Visualização</Label>
            <div className="h-32 rounded-lg overflow-hidden border">
              <BackgroundRenderer
                style={selectedStyle}
                color1={color1}
                color2={color2}
                color3={color3}
                className="h-full"
              >
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h3 className="text-lg font-bold mb-2 opacity-80">
                      {backgroundStyles.find(s => s.id === selectedStyle)?.name}
                    </h3>
                    <div className="w-16 h-1 bg-current rounded mx-auto opacity-60"></div>
                  </div>
                </div>
              </BackgroundRenderer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackgroundStyleSelector;