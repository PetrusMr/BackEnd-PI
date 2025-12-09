# 🔧 Solução para Problemas com Gemini API no Vercel

## Problemas Identificados e Corrigidos:

### 1. **Modelo Incorreto**
- ❌ Estava usando: `gemini-2.5-flash` (não existe)
- ✅ Corrigido para: `gemini-2.0-flash`

### 2. **Chaves API Diferentes**
- ❌ server.js usava uma chave, api/gemini/ usava outra
- ✅ Padronizado para usar a mesma chave

### 3. **Tratamento de Erros Melhorado**
- ✅ Agora identifica erros específicos (403, 400, 429)
- ✅ Mensagens mais claras para o usuário

## Como Testar:

### 1. **Teste Local:**
```bash
node test_gemini_vercel.js
```

### 2. **Teste no Vercel:**
Acesse: `https://seu-projeto.vercel.app/api/gemini/analisar-componentes`

## Configuração no Vercel:

1. Vá em **Settings** → **Environment Variables**
2. Adicione:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** `AIzaSyD61brqsqzlZMLszfWh791tfHM7bURVT-0`
   - **Environment:** Todas (Production, Preview, Development)
3. **Redeploy** o projeto

## Se Ainda Não Funcionar:

### Verificar se a chave está ativa:
1. Acesse: https://aistudio.google.com/app/apikey
2. Verifique se a chave não está desabilitada
3. Teste com uma nova chave se necessário

### Verificar billing:
1. Acesse: https://console.cloud.google.com/billing
2. Certifique-se que o billing está ativo
3. Gemini API tem cota gratuita, mas precisa de billing configurado

## Mensagens de Erro Comuns:

- **"Chave API inválida"** → Verificar se a chave está correta no Vercel
- **"Limite de uso excedido"** → Aguardar reset da cota ou ativar billing
- **"Acesso negado"** → Verificar se a API está habilitada no Google Cloud

## 🚀 Agora deve funcionar!

Após fazer o redeploy no Vercel, o scan de componentes deve funcionar normalmente.