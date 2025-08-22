-- Add fields for basic pages content to brokers table
ALTER TABLE public.brokers 
ADD COLUMN about_us_content TEXT DEFAULT 'Nossa empresa é especializada em soluções imobiliárias completas, oferecendo serviços de compra, venda e locação de imóveis. 

**Nossa Missão**
Conectar pessoas aos seus lares ideais, proporcionando experiências excepcionais no mercado imobiliário através de atendimento personalizado e soluções inovadoras.

**Nossa Visão** 
Ser referência no mercado imobiliário, reconhecida pela excelência em atendimento, transparência e resultados que superam expectativas.

**Nossos Valores**
- **Transparência**: Informações claras e honestas em todas as negociações
- **Excelência**: Comprometimento com a qualidade em cada detalhe
- **Inovação**: Uso de tecnologia para facilitar processos e melhorar experiências
- **Confiança**: Relacionamentos duradouros baseados na credibilidade
- **Proximidade**: Atendimento humanizado e personalizado',

ADD COLUMN privacy_policy_content TEXT DEFAULT '**Política de Privacidade**

Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações pessoais.

**Informações que Coletamos**
- Nome e informações de contato quando você preenche formulários
- Dados de navegação para melhorar a experiência do usuário
- Cookies para personalizar conteúdo e anúncios

**Como Usamos suas Informações**
- Para responder às suas solicitações e fornecer nossos serviços
- Para melhorar nosso site e serviços
- Para enviar comunicações relacionadas aos nossos serviços

**Proteção de Dados**
Implementamos medidas de segurança adequadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.

**Compartilhamento de Informações**
Não vendemos, negociamos ou transferimos suas informações pessoais para terceiros, exceto quando necessário para fornecer nossos serviços ou quando exigido por lei.

**Seus Direitos**
Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Entre em contato conosco para exercer esses direitos.

**Contato**
Para dúvidas sobre esta política, entre em contato através dos nossos canais de atendimento.',

ADD COLUMN terms_of_use_content TEXT DEFAULT '**Termos de Uso**

Ao utilizar este site, você concorda com os seguintes termos e condições:

**Uso Aceitável**
- O site destina-se à consulta de informações sobre imóveis e serviços imobiliários
- É proibido usar o site para atividades ilegais ou não autorizadas
- Não é permitido tentar acessar áreas restritas do sistema

**Propriedade Intelectual**
- Todo conteúdo do site é protegido por direitos autorais
- É proibida a reprodução não autorizada de textos, imagens ou outros materiais
- Logotipos e marcas são propriedade de seus respectivos donos

**Limitação de Responsabilidade**
- As informações são fornecidas "como estão"
- Não garantimos a precisão absoluta de todas as informações
- Não nos responsabilizamos por decisões baseadas exclusivamente nas informações do site

**Modificações**
Reservamos o direito de modificar estes termos a qualquer momento. As alterações entram em vigor imediatamente após a publicação.

**Contato**
Para esclarecimentos sobre estes termos, entre em contato através dos nossos canais de atendimento.

**Lei Aplicável**
Estes termos são regidos pelas leis brasileiras e qualquer disputa será resolvida nos tribunais competentes do Brasil.';