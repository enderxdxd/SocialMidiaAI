---
task: create-single-post()
responsavel: "@post-designer"
responsavel_type: Agent
atomic_layer: Task
elicit: true
---

# Task: Create Single Post

**Task ID:** POST-DESIGNER-001
**Command:** `*create-post`
**Purpose:** Create a complete, publish-ready single social media post.

## Execution Pipeline

### Step 1: Creative Brief Assembly
- Load brand guidelines (colors, fonts, tone, logo)
- Define visual concept from content brief
- Identify text overlay needs
- Confirm platform dimensions

### Step 2: Visual Direction (chris-do or mike-winkelmann)
- Define composition approach
- Choose typography treatment
- Define color application from brand palette

### Step 3: AI Image Prompt (prompt-engineer)
- Build layered prompt: subject → style → mood → lighting → composition → color
- Inject brand colors as hex values
- Define text-safe zones
- Select AI platform (Flux recommended)

### Step 4: Post Composition (post-designer)
- Place AI-generated image as background
- Apply text overlay with proper hierarchy
- Add brand elements (logo, color accents)
- Verify mobile legibility

### Step 5: Caption (caption-writer)
- Write hook (first 125 characters)
- Write body copy + CTA + hashtags

## Output Package
```yaml
post_package:
  image_prompt: "Full AI prompt"
  negative_prompt: "Exclusions"
  ai_platform: "flux | dall-e | midjourney"
  dimensions: "1080x1080 | 1080x1350"
  composition_spec:
    layout: "Visual layout description"
    typography: "Font specs per text element"
    brand_elements: "Logo + color accents"
  caption:
    hook: "First line"
    body: "Full caption"
    cta: "Call to action"
    hashtags: ["tag1", "tag2"]
```
