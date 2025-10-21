# 🔮 Consultas Esotéricas - Guia de Configuração

## Visão Geral

Plataforma completa de consultas esotéricas com:
- **Tarot Pago**: R$ 3, 5, 7 e 10 (1, 2, 3 e 5 perguntas)
- **Serviços Gratuitos**: Interpretação de Sonhos, Mesas Radiônicas, Orientações Energéticas
- **Autenticação**: Manus OAuth integrado
- **Pagamentos**: Mercado Pago
- **IA**: Respostas geradas por LLM (sem mencionar que é IA)
- **Notificações**: Alertas de novos cadastros

---

## 🚀 Variáveis de Ambiente Obrigatórias

Adicione estas variáveis ao seu painel de configuração:

### Mercado Pago
```
MERCADO_PAGO_ACCESS_TOKEN=seu_token_aqui
```

Obtenha em: https://www.mercadopago.com.br/developers/panel

### URL da Aplicação
```
VITE_APP_URL=https://seu-dominio.com
```

### Banco de Dados
```
DATABASE_URL=sua_string_de_conexao_mysql
```

---

## 📋 Funcionalidades Implementadas

### 1. **Leitura de Tarot (Pago)**
- Usuário seleciona número de perguntas (1, 2, 3 ou 5)
- Respostas geradas por IA com linguagem mística
- Integração com Mercado Pago
- Histórico de consultas

### 2. **Interpretação de Sonhos (Gratuito)**
- Descrição do sonho
- Análise com identificação de símbolos
- Histórico de interpretações

### 3. **Mesas Radiônicas (Gratuito)**
- Consultas sobre energia e frequências
- Respostas sobre frequência energética
- Histórico de consultas

### 4. **Orientações Energéticas (Gratuito)**
- Tópicos sugeridos (Amor, Carreira, Saúde, etc.)
- Orientação com foco em chakras
- Histórico de orientações

### 5. **Autenticação**
- Login via Manus OAuth
- Perfis de usuário
- Histórico pessoal

### 6. **Notificações**
- Alertas de novos cadastros para o proprietário
- Alertas de pagamentos recebidos

---

## 🎨 Design

- **Tema**: Místico e Espiritual
- **Cores**: Roxo, Indigo, Rosa, Azul
- **Gradientes**: Gradientes suaves para ambiente acolhedor
- **Ícones**: Lucide React (Sparkles, Moon, Heart, Zap, etc.)
- **Responsivo**: Mobile-first design

---

## 🔧 Estrutura Técnica

### Backend
- **Framework**: Express.js
- **API**: tRPC
- **Banco de Dados**: MySQL com Drizzle ORM
- **IA**: LLM integrado (Manus)
- **Pagamentos**: Mercado Pago SDK

### Frontend
- **Framework**: React 19
- **Styling**: Tailwind CSS 4
- **Componentes**: shadcn/ui
- **Roteamento**: Wouter

### Autenticação
- **Sistema**: Manus OAuth
- **Cookies**: Sessão JWT

---

## 📊 Banco de Dados

### Tabelas Criadas

1. **tarot_consultations**: Histórico de consultas de Tarot
2. **dream_interpretations**: Interpretações de sonhos
3. **radinic_tables**: Consultas radiônicas
4. **energy_guidance**: Orientações energéticas
5. **payments**: Histórico de pagamentos
6. **users**: Usuários do sistema

---

## 💳 Integração Mercado Pago

### Fluxo de Pagamento

1. Usuário seleciona número de perguntas
2. Sistema cria consulta no banco de dados
3. Usuário clica "Pagar Agora"
4. Sistema gera link de pagamento via Mercado Pago
5. Usuário é redirecionado para checkout
6. Após aprovação, consulta é marcada como paga

### URLs de Retorno

- **Sucesso**: `/payment/success?consultation_id={id}`
- **Falha**: `/payment/failure?consultation_id={id}`
- **Pendente**: `/payment/pending?consultation_id={id}`
- **Webhook**: `/api/webhooks/mercado-pago`

---

## 🔐 Segurança

- Autenticação obrigatória para consultas pagas
- Validação de propriedade de consultas
- Tokens JWT para sessão
- Variáveis de ambiente para credenciais

---

## 📱 Páginas do Site

### Públicas
- `/` - Home (apresentação)

### Autenticadas
- `/dashboard` - Painel principal
- `/tarot` - Consulta de Tarot
- `/dreams` - Interpretação de Sonhos
- `/radinic` - Mesas Radiônicas
- `/energy` - Orientações Energéticas

---

## 🚀 Deployment

Para publicar o site:

1. Clique no botão **"Publish"** no painel
2. Configure seu domínio
3. Defina as variáveis de ambiente
4. Aguarde a implantação

---

## 💡 Próximos Passos

1. **Adicione seu token Mercado Pago**
2. **Configure a URL da aplicação**
3. **Teste as consultas**
4. **Publique o site**

---

## 📞 Suporte

Para dúvidas sobre configuração ou funcionalidades, consulte a documentação do projeto.

---

**✨ Bem-vindo ao mundo das Consultas Esotéricas! ✨**

