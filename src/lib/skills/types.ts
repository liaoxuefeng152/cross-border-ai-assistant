/**
 * Skill 类型定义
 * 龙掌柜 AI 智能体技能系统
 */

// 技能类型
export type SkillType = 'image-gen' | 'video-gen' | 'product-selection' | 'listing-optimize';

// 技能执行状态
export type SkillStatus = 'running' | 'success' | 'error';

// 技能结果 - 基础结构
export interface SkillResult {
  type: SkillType;
  status: SkillStatus;
  data: unknown;
  summary: string; // AI 用于总结的简要描述
}

// 作图技能结果
export interface ImageGenResult {
  imageUrls: string[];
  prompt: string;
  scene: string;
}

// 视频技能结果
export interface VideoGenResult {
  videoUrl: string;
  prompt: string;
  scene: string;
  ratio: string;
  duration: number;
}

// 选品技能结果
export interface ProductSelectionResult {
  products: Array<{
    name: string;
    category: string;
    trendScore: number;
    competition: string;
    profitMargin: string;
    sourcePrice: string;
    suggestedPrice: string;
    reason: string;
    actionAdvice: string;
    searchVolume: string;
    monthlySales: string;
  }>;
  market: string;
  category: string;
}

// 上架优化技能结果
export interface ListingOptimizeResult {
  title: string;
  bulletPoints: string[];
  description: string;
  keywords: string[];
  platform: string;
}

// 技能定义
export interface SkillDefinition {
  type: SkillType;
  name: string;
  description: string;
  keywords: string[];
  patterns: RegExp[];
  execute: (params: SkillExecuteParams) => Promise<SkillResult>;
}

// 技能执行参数
export interface SkillExecuteParams {
  userMessage: string;
  extractedParams: Record<string, string>;
  headers: Record<string, string>;
}
