# 🔑 Como Gerar Nova Chave API do Gemini

## ❌ Problema Atual
A chave API atual (`AIzaSyD61brqsqzlZMLszfWh791tfHM7bURVT-0`) foi **reportada como vazada** e está **BLOQUEADA** pelo Google.

## ✅ Solução

### Passo 1: Acessar Google AI Studio
1. Acesse: https://makersuite.google.com/app/apikey
2. Faça login com sua conta Google

### Passo 2: Criar Nova Chave
1. Clique em **"Create API Key"**
2. Selecione um projeto ou crie um novo
3. Copie a nova chave gerada

### Passo 3: Atualizar Configurações

#### No arquivo `.env` (D:\backendPI\.env):
```
GEMINI_API_KEY=SUA_NOVA_CHAVE_AQUI
```

#### No frontend (D:\P.I\mobile-EasyControl\src\environments\environment.ts):
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://back-end-pi-dypp.vercel.app/api',
  geminiApiKey: 'SUA_NOVA_CHAVE_AQUI'
};
```

### Passo 4: Testar
Execute o teste para verificar se funciona:
```bash
cd D:\backendPI
node test_gemini_melhorado.js
```

## 🔒 Segurança
- **NUNCA** compartilhe a chave API publicamente
- **NÃO** faça commit da chave no Git
- Use variáveis de ambiente em produção

## 📝 Verificação
Após atualizar a chave, você deve ver:
- ✅ Status 200 na API
- ✅ Análise real de componentes
- ❌ Fim da mensagem "Nenhum componente identificado"