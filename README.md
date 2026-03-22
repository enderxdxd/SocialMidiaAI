# Social Media AI Platform

Plataforma de geração de conteúdo para redes sociais usando IA (Claude + Flux).

## 🚀 Deploy na Vercel

### Passo 1: Importar o projeto

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New Project"**
3. Importe o repositório: `enderxdxd/SocialMidiaAI`

### Passo 2: Configurar variáveis de ambiente

Na aba **Environment Variables**, adicione:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
REPLICATE_API_TOKEN=r8_...
```

**Onde conseguir as chaves:**
- **Anthropic API**: https://console.anthropic.com/settings/keys
- **Replicate API**: https://replicate.com/account/api-tokens (opcional)

### Passo 3: Configurar Root Directory

Em **Build & Development Settings**:
- **Root Directory**: `platform`
- **Framework Preset**: Next.js

### Passo 4: Deploy

Clique em **Deploy** e aguarde ~2 minutos.

---

## 💻 Desenvolvimento Local

```bash
cd platform
npm install
cp .env.local.example .env.local
# Edite .env.local com suas API keys
npm run dev
```

Acesse: http://localhost:3000

---

## 📁 Estrutura

```
├── platform/              # Aplicação Next.js
│   ├── app/              # Pages e API routes
│   ├── components/       # Componentes React
│   └── lib/              # Utilitários
├── social-media-squad/   # Sistema de agentes IA
│   ├── agents/          # 11 agentes especializados
│   ├── tasks/           # 10 tarefas
│   └── workflows/       # 3 workflows
└── INTEGRATION-GUIDE.md  # Guia completo
```

---

## 🔑 Custos Estimados

| Serviço | Custo por post |
|---------|----------------|
| Claude Sonnet 4 | ~$0.01-0.03 |
| Flux 1.1 Pro | ~$0.03-0.05 |
| **Total** | **~$0.04-0.08** |

**100 posts/mês = ~$4-8**

---

## 📚 Documentação

Veja `INTEGRATION-GUIDE.md` para detalhes completos sobre:
- Arquitetura do sistema
- Como usar os agentes
- Integração com APIs
- Geração de imagens com Flux
