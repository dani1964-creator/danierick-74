import { useState } from 'react';
import { Upload, X, ImageIcon, Link } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface BackgroundImageUploadProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
}

const BackgroundImageUpload = ({ imageUrl, onImageChange }: BackgroundImageUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `background-${Date.now()}.${fileExt}`;
      const filePath = `backgrounds/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      onImageChange(publicUrl);

      toast({
        title: "Imagem carregada",
        description: "Sua imagem de fundo foi enviada com sucesso!"
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

  const removeImage = () => {
    onImageChange('');
  };

  return (
    <div className="space-y-4">
      <Label>Imagem de Fundo do Site</Label>
      
      {imageUrl ? (
        <div className="relative inline-block">
          <img
            src={imageUrl}
            alt="Imagem de fundo"
            className="h-32 w-56 rounded-lg border object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={removeImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 w-56 h-32">
          <div className="text-center h-full flex flex-col justify-center">
            <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Nenhuma imagem</p>
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
            value={imageUrl}
            onChange={(e) => onImageChange(e.target.value)}
            placeholder="https://exemplo.com/imagem-fundo.jpg"
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
              id="background-upload"
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              asChild
              className="w-full"
            >
              <label htmlFor="background-upload" className="cursor-pointer">
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
      
      <p className="text-sm text-muted-foreground">
        Esta imagem aparecerá como fundo na seção hero do site público
      </p>
    </div>
  );
};

export default BackgroundImageUpload;