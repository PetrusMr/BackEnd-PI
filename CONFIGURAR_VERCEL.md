# Como Configurar a Chave API no Vercel

## Passo a Passo:

1. Acesse: https://vercel.com
2. Entre no seu projeto
3. Vá em **Settings** (Configurações)
4. Clique em **Environment Variables** (Variáveis de Ambiente)
5. Adicione uma nova variável:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** `AIzaSyD61brqsqzlZMLszfWh791tfHM7bURVT-0`
   - **Environment:** Marque todas (Production, Preview, Development)
6. Clique em **Save**
7. Vá em **Deployments**
8. Clique nos 3 pontinhos do último deploy
9. Clique em **Redeploy**

## Pronto!

Agora o scan vai funcionar! 🚀

## Teste Local (Opcional)

Se quiser testar localmente antes:
```bash
node server.js
```
Acesse: http://localhost:3000
