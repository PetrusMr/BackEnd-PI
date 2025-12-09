# 🚨 TESTE RÁPIDO - Gemini não funciona

## Qual mensagem aparece quando você tenta fazer o scan?

Execute este teste para descobrir o problema exato:

### 1. Acesse seu projeto no Vercel
### 2. Vá em **Functions** → **View Function Logs**
### 3. Tente fazer um scan
### 4. Veja qual erro aparece nos logs

## Possíveis mensagens e soluções:

### ❌ "Chave API não configurada no Vercel"
**Solução:** A variável GEMINI_API_KEY não foi salva corretamente
- Vá em Settings → Environment Variables
- Adicione: `GEMINI_API_KEY` = `AIzaSyD61brqsqzlZMLszfWh791tfHM7bURVT-0`
- Redeploy

### ❌ "HTTP 400: Chave API inválida"
**Solução:** A chave está incorreta ou expirou
- Gere nova chave em: https://aistudio.google.com/app/apikey
- Substitua no Vercel
- Redeploy

### ❌ "HTTP 403: Acesso negado"
**Solução:** API não habilitada
- Acesse: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
- Clique em "Enable"

### ❌ "HTTP 429: Limite excedido"
**Solução:** Cota esgotada
- Aguarde reset (próximo mês)
- Ou configure billing no Google Cloud

## 🔍 Me diga qual mensagem aparece que eu resolvo!