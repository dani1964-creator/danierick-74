
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeInput, contactFormSchema } from "@/lib/security";
import { SecurityMonitor } from "@/lib/security-monitor";
import { EnhancedSecurity } from "@/lib/enhanced-security";

interface SecureContactFormProps {
  propertyId?: string;
  brokerId?: string;
  className?: string;
}

export default function SecureContactForm({ propertyId, brokerId, className = "" }: SecureContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!contactFormSchema.name(formData.name)) {
      newErrors.name = formData.name ? "Nome deve ter até 100 caracteres" : "Nome é obrigatório";
    }

    if (!contactFormSchema.email(formData.email)) {
      newErrors.email = formData.email ? "Email inválido" : "Email é obrigatório";
    }

    if (formData.phone && !contactFormSchema.phone(formData.phone)) {
      newErrors.phone = "Formato de telefone inválido";
    }

    if (!contactFormSchema.message(formData.message)) {
      newErrors.message = "Mensagem deve ter até 2000 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário.",
        variant: "destructive"
      });
      return;
    }

    if (!brokerId) {
      toast({
        title: "Erro de configuração",
        description: "ID do corretor não encontrado.",
        variant: "destructive"
      });
      return;
    }

    // Use enhanced security for form submission
    const result = await EnhancedSecurity.secureFormSubmit(
      'contact_form',
      formData,
      async () => {
        // Sanitize all inputs
        const sanitizedData = {
          name: sanitizeInput(formData.name),
          email: sanitizeInput(formData.email),
          phone: formData.phone ? sanitizeInput(formData.phone) : null,
          message: sanitizeInput(formData.message),
          property_id: propertyId || null,
          broker_id: brokerId
        };

        const { error } = await supabase
          .from('leads')
          .insert(sanitizedData);

        if (error) throw error;
        return sanitizedData;
      }
    );

    if (result.success) {
      toast({
        title: "Mensagem enviada!",
        description: "Entraremos em contato em breve.",
      });

      // Reset form
      setFormData({ name: "", email: "", phone: "", message: "" });
      setErrors({});
    } else {
      toast({
        title: "Erro ao enviar",
        description: result.error || "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          maxLength={100}
          className={errors.name ? "border-red-500" : ""}
          required
        />
        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          className={errors.email ? "border-red-500" : ""}
          required
        />
        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
      </div>

      <div>
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
      </div>

      <div>
        <Label htmlFor="message">Mensagem</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleInputChange("message", e.target.value)}
          maxLength={2000}
          rows={4}
          className={errors.message ? "border-red-500" : ""}
        />
        {errors.message && <p className="text-sm text-red-500 mt-1">{errors.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
      </Button>
    </form>
  );
}
