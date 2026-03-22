# Xquads Social Media Platform — Integration Guide

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│           Plataforma Web (React)            │
│       xquads-studio.jsx / Next.js app       │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Claude Code (Orchestrator)          │
│  Lê agents .md → builds system prompts     │
│  Executa workflows .yaml sequencialmente    │
└──────┬──────────┬──────────────┬────────────┘
       │          │              │
┌──────▼───┐ ┌───▼────┐ ┌──────▼──────┐
│  Brand   │ │  Copy  │ │   Design    │
│  Squad   │ │  Squad │ │   Squad     │
└──────────┘ └────────┘ └─────────────┘
       │          │              │
┌──────▼──────────▼──────────────▼────────────┐
│      Social Media Squad (NEW)               │
│  11 agents • 10 tasks • 3 workflows        │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          Claude API (Sonnet 4)              │
│  Generates: prompts, copy, specs            │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│      Flux API (via Replicate)               │
│  Generates: actual images from prompts      │
└─────────────────────────────────────────────┘
```

---

## Part 1: Installing the Social Media Squad

Copy the `social-media-squad/` folder into your Xquads project:

```bash
cp -r social-media-squad/ /path/to/your/xquads/squads/
```

Your squads directory should now look like:

```
squads/
├── advisory-board/
├── brand-squad/
├── copy-squad/
├── design-squad/
├── social-media-squad/   ← NEW
│   ├── agents/           (11 agent definitions)
│   ├── tasks/            (10 task definitions)
│   ├── workflows/        (3 workflow definitions)
│   ├── checklists/       (1 quality checklist)
│   ├── config/           (squad configuration)
│   ├── data/             (routing catalog)
│   ├── squad.yaml
│   └── README.md
├── storytelling/
├── traffic-masters/
└── ...
```

---

## Part 2: Setting Up Claude Code as Orchestrator

### Step 1: Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

### Step 2: Create the orchestrator script

Create a file `orchestrator.ts` in your project root:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

const client = new Anthropic();

// === AGENT LOADER ===
// Reads agent .md files and extracts system prompts

function loadAgent(squadPath: string, agentFile: string): string {
  const content = fs.readFileSync(
    path.join(squadPath, "agents", agentFile),
    "utf-8"
  );
  // Extract the ACTIVATION-NOTICE as the core system prompt
  const match = content.match(
    /> ACTIVATION-NOTICE: (.*?)(?=\n\n|## COMPLETE)/s
  );
  const activation = match ? match[1].trim() : "";

  // Extract the full YAML block for detailed persona
  const yamlMatch = content.match(/```yaml\n([\s\S]*?)```/);
  const agentYaml = yamlMatch ? yamlMatch[1] : "";

  return `${activation}\n\n${agentYaml}`;
}

// === WORKFLOW EXECUTOR ===
// Reads workflow .yaml and executes phases sequentially

interface WorkflowPhase {
  id: string;
  name: string;
  agent: string;
  description: string;
}

function loadWorkflow(
  squadPath: string,
  workflowFile: string
): WorkflowPhase[] {
  const content = fs.readFileSync(
    path.join(squadPath, "workflows", workflowFile),
    "utf-8"
  );
  const wf = yaml.load(content) as any;
  return (wf.phases || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    agent: p.agent,
    description: p.description,
  }));
}

// === BRAND CONTEXT ===

interface BrandConfig {
  name: string;
  segment: string;
  colors: string[];
  tone: string;
  audience: string;
  references?: string;
}

function buildBrandContext(brand: BrandConfig): string {
  return `
## Brand Guidelines
- Company: ${brand.name}
- Segment: ${brand.segment}
- Colors: ${brand.colors.join(", ")}
- Tone: ${brand.tone}
- Target Audience: ${brand.audience}
${brand.references ? `- Visual References: ${brand.references}` : ""}
  `.trim();
}

// === MAIN PIPELINE ===

async function generatePost(
  brand: BrandConfig,
  brief: string,
  contentType: string = "single_post",
  platform: string = "instagram_feed"
) {
  const squadPath = path.join(__dirname, "squads", "social-media-squad");

  // Step 1: Load the workflow
  const workflow = loadWorkflow(squadPath, "wf-post-creation.yaml");
  console.log(`\n🚀 Starting pipeline: ${workflow.length} phases\n`);

  // Step 2: Load all relevant agents
  const agentPrompts: Record<string, string> = {};
  const agentFiles = fs.readdirSync(path.join(squadPath, "agents"));
  for (const file of agentFiles) {
    const id = file.replace(".md", "");
    agentPrompts[id] = loadAgent(squadPath, file);
  }

  // Step 3: Build the combined system prompt
  const systemPrompt = `
You are the Xquads Social Media Squad executing a coordinated pipeline.

${buildBrandContext(brand)}

## Platform: ${platform}
## Content Type: ${contentType}

## Active Agents:
${workflow
  .map((phase, i) => {
    const agentDef = agentPrompts[phase.agent] || "";
    // Only include first 500 chars of each agent to fit context
    return `### Agent ${i + 1}: ${phase.agent}\n${agentDef.slice(0, 500)}`;
  })
  .join("\n\n")}

## Output Requirements:
Generate a COMPLETE post package with these sections:

### IMAGE PROMPT
Detailed, production-ready AI image prompt with 7 layers:
Subject, Style, Mood, Lighting, Composition, Color (brand hex codes), Technical.
Include text-safe zones. Optimized for Flux.

### NEGATIVE PROMPT
Elements to exclude.

### COMPOSITION SPEC
Layout: text placement, logo position, visual hierarchy.

### CAPTION
- HOOK: First line (< 125 chars)
- BODY: Full caption
- CTA: Call to action

### HASHTAGS
10-15 relevant hashtags.
  `.trim();

  // Step 4: Call Claude API
  console.log("📱 Social Chief: Orchestrating pipeline...");
  for (const phase of workflow) {
    console.log(`  → ${phase.agent}: ${phase.description}`);
  }

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Create content for: ${brief}`,
      },
    ],
  });

  const result = response.content.map((c: any) => c.text || "").join("\n");

  console.log("\n✅ Pipeline complete!\n");
  console.log(result);

  return result;
}

// === IMAGE GENERATION (Flux via Replicate) ===

async function generateImage(
  prompt: string,
  negativePrompt: string = "",
  aspectRatio: string = "1:1"
) {
  // Requires: REPLICATE_API_TOKEN env var
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version:
        "black-forest-labs/flux-1.1-pro", // or flux-dev for cheaper
      input: {
        prompt: prompt,
        negative_prompt: negativePrompt,
        aspect_ratio: aspectRatio,
        output_format: "png",
        output_quality: 90,
      },
    }),
  });

  const prediction = await response.json();
  console.log("🖼️ Image generation started:", prediction.id);

  // Poll for result
  let result = prediction;
  while (result.status !== "succeeded" && result.status !== "failed") {
    await new Promise((r) => setTimeout(r, 2000));
    const poll = await fetch(
      `https://api.replicate.com/v1/predictions/${result.id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        },
      }
    );
    result = await poll.json();
    console.log("  Status:", result.status);
  }

  if (result.status === "succeeded") {
    console.log("✅ Image generated:", result.output);
    return result.output;
  } else {
    console.error("❌ Image generation failed:", result.error);
    return null;
  }
}

// === FULL END-TO-END PIPELINE ===

async function createSocialMediaPost(
  brand: BrandConfig,
  brief: string,
  options: { contentType?: string; platform?: string; generateImage?: boolean } = {}
) {
  const { contentType = "single_post", platform = "instagram_feed", generateImage: genImg = false } = options;

  // Step 1: Generate content via Claude
  const content = await generatePost(brand, brief, contentType, platform);

  // Step 2: Extract the image prompt from the result
  const promptMatch = content.match(
    /IMAGE PROMPT[:\s]*\n([\s\S]*?)(?=\n###|\nNEGATIVE)/i
  );
  const negMatch = content.match(
    /NEGATIVE PROMPT[:\s]*\n([\s\S]*?)(?=\n###|\nDIMENSIONS)/i
  );

  if (genImg && promptMatch) {
    const imagePrompt = promptMatch[1].trim();
    const negativePrompt = negMatch ? negMatch[1].trim() : "";
    const aspectRatio = platform.includes("stories") ? "9:16" :
                       platform.includes("portrait") ? "4:5" :
                       platform.includes("youtube") ? "16:9" : "1:1";

    console.log("\n🎨 Generating image with Flux...");
    const imageUrl = await generateImage(imagePrompt, negativePrompt, aspectRatio);
    return { content, imageUrl };
  }

  return { content, imageUrl: null };
}

// === USAGE EXAMPLE ===
/*
const brand: BrandConfig = {
  name: "Mobius",
  segment: "Car tuning & performance",
  colors: ["#1a1a2e", "#e94560", "#0f3460", "#16213e"],
  tone: "bold",
  audience: "Car enthusiasts 18-35, performance lovers",
  references: "Dark premium aesthetic, BMW M Power vibes, neon accents on dark backgrounds"
};

createSocialMediaPost(brand, "Post de lançamento do serviço de remapeamento de ECU, mostrando um carro esportivo com visual agressivo e premium", {
  contentType: "single_post",
  platform: "instagram_feed",
  generateImage: true
});
*/

export { generatePost, generateImage, createSocialMediaPost, BrandConfig };
```

### Step 3: Install dependencies

```bash
npm install @anthropic-ai/sdk js-yaml
npm install -D @types/js-yaml typescript
```

### Step 4: Set environment variables

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export REPLICATE_API_TOKEN="r8_..."  # For Flux image generation
```

---

## Part 3: Using with Claude Code CLI

You can also use the squad directly in Claude Code's terminal:

```bash
# Navigate to your project with the squads
cd /path/to/your/xquads-project

# Ask Claude Code to use the social-media-squad
claude "Use the social-media-squad to create an Instagram post for
my brand Mobius (car tuning). The post should promote our ECU
remapping service. Brand colors: #1a1a2e, #e94560. Tone: bold
and premium. Read the squad agents and follow the pipeline."
```

Claude Code will:
1. Read the agent `.md` files from the squad
2. Follow the workflow defined in `wf-post-creation.yaml`
3. Generate the complete post package (prompt + layout + caption)

---

## Part 4: Image Generation with Flux

### Why Flux?
- Best photorealism quality among open-source models
- Excellent at following specific color hex values
- Can render text in images (useful for quote posts)
- $0.003-0.05 per image via Replicate API
- Fast generation (~5-15 seconds)

### Setup Replicate Account
1. Go to https://replicate.com
2. Create account and get API token
3. Add billing (pay-as-you-go, very cheap)

### Alternative: DALL-E 3
If you prefer OpenAI:
```typescript
import OpenAI from "openai";

const openai = new OpenAI();

const image = await openai.images.generate({
  model: "dall-e-3",
  prompt: imagePrompt,
  size: "1024x1024",
  quality: "hd",
});

console.log(image.data[0].url);
```

---

## Part 5: React Platform (xquads-studio.jsx)

The included `xquads-studio.jsx` is a fully functional React artifact that:
- Lets you configure brand guidelines
- Select content type and platform
- Shows the agent pipeline being executed
- Calls Claude API to generate content
- Displays results with parsed sections (prompt, caption, hashtags)

To use it standalone in a Next.js app:
```bash
npx create-next-app xquads-studio
cp xquads-studio.jsx app/page.tsx  # Adapt imports
npm run dev
```

---

## Recommended API Costs (per post)

| Service | Cost | Purpose |
|---------|------|---------|
| Claude Sonnet 4 | ~$0.01-0.03 | Content generation |
| Flux 1.1 Pro | ~$0.03-0.05 | Image generation |
| **Total per post** | **~$0.04-0.08** | |
| **100 posts/month** | **~$4-8** | |

---

## Next Steps

1. **Add the squad** to your Xquads project
2. **Configure brand** in the platform or orchestrator
3. **Test with a simple post** before batch creation
4. **Set up Flux/Replicate** for actual image generation
5. **Iterate on prompts** — the prompt-engineer agent creates great starting points
6. **Build templates** — save successful prompts as reusable templates
