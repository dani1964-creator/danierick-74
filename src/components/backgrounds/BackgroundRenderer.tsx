import React from 'react';

interface BackgroundRendererProps {
  style: string;
  color1: string;
  color2: string;
  color3?: string;
  className?: string;
  children?: React.ReactNode;
}

const BackgroundRenderer = ({ 
  style, 
  color1, 
  color2, 
  color3 = '#ffffff', 
  className = '',
  children 
}: BackgroundRendererProps) => {
  
  const renderStyle1 = () => (
    // Gradiente Suave (atual "Destaque")
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"></div>
      <div 
        className="absolute inset-0 opacity-10"
        style={{ 
          background: `linear-gradient(135deg, ${color1}, ${color2})` 
        }}
      ></div>
      
      {/* Formas geométricas decorativas */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-5">
        <div 
          className="w-full h-full rounded-full blur-3xl"
          style={{ backgroundColor: color1 }}
        ></div>
      </div>
      <div className="absolute bottom-0 left-0 w-64 h-64 opacity-5">
        <div 
          className="w-full h-full rounded-full blur-2xl"
          style={{ backgroundColor: color2 }}
        ></div>
      </div>
    </>
  );

  const renderStyle2 = () => (
    // Geométrico Diagonal (atual "Todos")
    <>
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-white"></div>
        <div 
          className="absolute inset-0 opacity-5"
          style={{ 
            background: `linear-gradient(45deg, ${color1}, transparent 50%, ${color2})`,
            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)'
          }}
        ></div>
      </div>
      
      {/* Elementos decorativos */}
      <div className="absolute top-10 left-10 w-32 h-32 opacity-5">
        <div 
          className="w-full h-full transform rotate-45 blur-sm"
          style={{ 
            background: `linear-gradient(45deg, ${color1}, ${color2})` 
          }}
        ></div>
      </div>
      <div className="absolute bottom-10 right-10 w-24 h-24 opacity-5">
        <div 
          className="w-full h-full rounded-full blur-xl"
          style={{ backgroundColor: color2 }}
        ></div>
      </div>
    </>
  );

  const renderStyle3 = () => (
    // Ondas Modernas
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
      <div 
        className="absolute inset-0 opacity-8"
        style={{
          background: `radial-gradient(ellipse at top left, ${color1}15, transparent 50%), radial-gradient(ellipse at bottom right, ${color2}15, transparent 50%)`
        }}
      ></div>
      
      {/* Ondas CSS */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-10 -left-10 w-96 h-96 opacity-6"
          style={{
            background: `conic-gradient(from 0deg, ${color1}, ${color2}, ${color1})`,
            borderRadius: '50% 30% 70% 40%',
            filter: 'blur(60px)',
            animation: 'float 8s ease-in-out infinite'
          }}
        ></div>
        <div 
          className="absolute -bottom-10 -right-10 w-80 h-80 opacity-6"
          style={{
            background: `conic-gradient(from 180deg, ${color2}, ${color1}, ${color2})`,
            borderRadius: '40% 70% 30% 50%',
            filter: 'blur(50px)',
            animation: 'float 10s ease-in-out infinite reverse'
          }}
        ></div>
      </div>
    </>
  );

  const renderStyle4 = () => (
    // Minimalista Clean
    <>
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: `${color3}f8` }}
      ></div>
      
      {/* Texturas sutis */}
      <div className="absolute inset-0 opacity-3">
        <div 
          className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full"
          style={{ backgroundColor: color1 }}
        ></div>
        <div 
          className="absolute top-1/3 right-1/3 w-1 h-1 rounded-full"
          style={{ backgroundColor: color2 }}
        ></div>
        <div 
          className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color1 }}
        ></div>
        <div 
          className="absolute bottom-1/3 right-1/4 w-1 h-1 rounded-full"
          style={{ backgroundColor: color2 }}
        ></div>
      </div>
      
      {/* Linhas minimalistas */}
      <div className="absolute inset-0 opacity-4">
        <div 
          className="absolute top-0 left-1/4 w-px h-full"
          style={{ 
            background: `linear-gradient(to bottom, transparent, ${color1}, transparent)` 
          }}
        ></div>
        <div 
          className="absolute top-1/3 left-0 w-full h-px"
          style={{ 
            background: `linear-gradient(to right, transparent, ${color2}, transparent)` 
          }}
        ></div>
      </div>
    </>
  );

  const renderStyle5 = () => (
    // Padrão Hexagonal
    <>
      <div 
        className="absolute inset-0"
        style={{ 
          background: `linear-gradient(135deg, ${color3}, ${color3}e0)` 
        }}
      ></div>
      
      {/* Padrão hexagonal */}
      <div 
        className="absolute inset-0 opacity-6"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, ${color1}20 0%, transparent 50%),
            radial-gradient(circle at 75% 25%, ${color2}20 0%, transparent 50%),
            radial-gradient(circle at 25% 75%, ${color2}20 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, ${color1}20 0%, transparent 50%)
          `,
          backgroundSize: '80px 80px'
        }}
      ></div>
      
      {/* Elementos hexagonais grandes */}
      <div className="absolute top-10 right-10 opacity-8">
        <div 
          className="w-32 h-32 transform rotate-45 blur-sm"
          style={{
            background: `linear-gradient(60deg, ${color1}, ${color2})`,
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
          }}
        ></div>
      </div>
      <div className="absolute bottom-20 left-10 opacity-6">
        <div 
          className="w-24 h-24 transform -rotate-12 blur-md"
          style={{
            background: `linear-gradient(120deg, ${color2}, ${color1})`,
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
          }}
        ></div>
      </div>
    </>
  );

  const renderBackground = () => {
    switch (style) {
      case 'style1':
        return renderStyle1();
      case 'style2':
        return renderStyle2();
      case 'style3':
        return renderStyle3();
      case 'style4':
        return renderStyle4();
      case 'style5':
        return renderStyle5();
      default:
        return renderStyle1();
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {renderBackground()}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Floating animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

export default BackgroundRenderer;