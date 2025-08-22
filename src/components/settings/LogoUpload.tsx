import { useState } from 'react';
import { Upload, X, ImageIcon, Link } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface LogoUploadProps {
  logoUrl: string;
  onLogoChange: (url: string) => void;
}

const LogoUpload = ({ logoUrl, onLogoChange }: LogoUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      onLogoChange(publicUrl);

      toast({
        title: "Logo carregada",
        description: "Sua logo foi enviada com sucesso!"
      });

    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    onLogoChange('');
  };

  return (
    <div className="space-y-4">
      <Label>Logo da Imobiliária</Label>
      
      {logoUrl ? (
        <div className="relative inline-block">
          <img
            src={logoUrl}
            alt="Logo da imobiliária"
            className="h-20 w-auto rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={removeLogo}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 w-48">
          <div className="text-center">
            <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Nenhuma logo</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            URL da Web
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="space-y-2">
          <Input
            value={logoUrl}
            onChange={(e) => onLogoChange(e.target.value)}
            placeholder="URL da sua logo"
          />
          <p className="text-sm text-muted-foreground">
            Cole a URL de uma imagem da web
          </p>
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-2">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="sr-only"
              id="logo-upload"
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              asChild
              className="w-full"
            >
              <label htmlFor="logo-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
              </label>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Selecione uma imagem do seu computador
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LogoUpload;