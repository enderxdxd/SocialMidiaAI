---
task: diagnose()
responsavel: "@social-chief"
responsavel_type: Agent
atomic_layer: Task
elicit: true
Entrada:
  - campo: request
    tipo: string
    origem: User Input
    obrigatorio: true
Saida:
  - campo: diagnosis
    tipo: string
    destino: Console
    persistido: false
Checklist:
  - "[ ] Request parsed and content type identified"
  - "[ ] Routing catalog consulted with scored results"
  - "[ ] Quick answer provided with specialist routing"
---

# Task: Diagnose Social Media Request

**Task ID:** SOCIAL-CHIEF-001
**Version:** 1.0.0
**Command:** `*diagnose`
**Orchestrator:** Social Chief (social-chief)
**Purpose:** Triage social media content requests, identify content type, route to specialist.

## Execution Phases

### Phase 1: Analyze Request
1. Parse the user's request for content intent
2. Identify content type (single post, carousel, stories, reel cover, thumbnail)
3. Identify platform (Instagram, LinkedIn, TikTok, YouTube)
4. Identify content goal (awareness, engagement, conversion, education)
5. Check if brand guidelines are loaded

### Phase 2: Match Against Routing Catalog

| Domain | Keywords | Route To |
|--------|----------|----------|
| Single Post | post, feed post, imagem, visual | post-designer / prompt-engineer |
| Carousel | carrossel, carousel, slides, swipe | carousel-architect / post-designer |
| Stories | stories, story, insta story | post-designer / caption-writer |
| Reel Cover | reel cover, capa, thumbnail reel | post-designer / prompt-engineer |
| Thumbnail | thumbnail, miniatura, youtube | post-designer / chris-do |
| Content Strategy | estratégia, calendário, frequência | gary-vee / ste-davies |
| Visual Identity | identidade visual, brand guide, paleta | chris-do / tubik-studio |
| Reference Analysis | referência, inspiração, benchmark | mike-winkelmann / rafaela-costa |
| AI Image | prompt, midjourney, flux, gerar imagem | prompt-engineer / mike-winkelmann |
| Caption | legenda, caption, copy, hashtags | caption-writer / gary-vee |

### Phase 3: Route or Answer
- Clear content type → activate corresponding workflow
- Ambiguous request → ask clarifying questions about platform, format, and goal

## Veto Conditions
- NEVER start creating without confirming platform and format
- NEVER generate images without brand context (minimum: colors + tone)
- NEVER skip the caption — every post needs text + visual
- NEVER create content without a stated goal
