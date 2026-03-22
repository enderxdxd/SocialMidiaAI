export interface Brand {
  name: string;
  segment: string;
  colors: string;
  tone: string;
  audience: string;
}

export interface PipelineStep {
  agentId: string;
  agentName: string;
  phase: string;
}

export interface ContentResult {
  imagePrompt: string;
  negativePrompt: string;
  compositionSpec: string;
  caption: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  carouselStructure: string;
  visualSystem: string;
  qualityScore: string;
  raw: string;
}

export type ContentType =
  | "single_post"
  | "carousel"
  | "stories"
  | "reel_cover"
  | "thumbnail"
  | "content_calendar";

export type Platform =
  | "instagram_feed"
  | "instagram_portrait"
  | "instagram_stories"
  | "instagram_carousel"
  | "linkedin_post"
  | "youtube_thumbnail";

export type Step = "brand" | "create" | "generating" | "result";

export interface PlatformInfo {
  label: string;
  size: string;
  ratio: string;
  aspectRatio: string;
}
