/**
 * Skill 注册中心
 * 负责意图识别和技能路由
 */

import { SkillDefinition, SkillType, SkillResult, SkillExecuteParams } from './types';
import { executeImageGen } from './image-gen';
import { executeVideoGen } from './video-gen';
import { executeProductSelection } from './product-selection';
import { executeListingOptimize } from './listing-optimize';

// 技能注册表
const skills: SkillDefinition[] = [
  {
    type: 'image-gen',
    name: 'AI 作图',
    description: '生成商品图片，包括白底图、场景图、模特图、广告素材等',
    keywords: ['作图', '生成图片', '画图', '图片', '主图', '白底图', '场景图', '模特图', '商品图', '产品图', 'image', 'photo', '生成一张', '帮我画', '帮我做图', '做一张图'],
    patterns: [
      /生成.*图(?!片|书)/,
      /做.*图(?!片|书)/,
      /画.*图/,
      /作.*图/,
      /帮我.*(生成|做|画).*图/,
    ],
    execute: executeImageGen,
  },
  {
    type: 'video-gen',
    name: 'AI 视频',
    description: '生成商品视频，包括展示视频、开箱视频、广告视频等',
    keywords: ['视频', '生成视频', '做视频', '拍视频', '短视频', '展示视频', '开箱视频', '广告视频', 'video', '动画'],
    patterns: [
      /生成.*视频/,
      /做.*视频/,
      /拍.*视频/,
      /帮我.*(生成|做|拍).*视频/,
      /制作.*视频/,
    ],
    execute: executeVideoGen,
  },
  {
    type: 'product-selection',
    name: 'AI 选品',
    description: '分析市场趋势，推荐高潜力跨境电商选品',
    keywords: ['选品', '推荐产品', '什么好卖', '热卖', '爆款', '潜力产品', '市场分析', '品类分析', '什么值得卖', '选什么品', '推荐.*产品', '哪些产品'],
    patterns: [
      /推荐.*产品/,
      /什么.*好卖/,
      /什么.*值得卖/,
      /哪些.*产品/,
      /选品.*推荐/,
      /潜力.*产品/,
      /热门.*品类/,
    ],
    execute: executeProductSelection,
  },
  {
    type: 'listing-optimize',
    name: 'Listing 优化',
    description: '优化商品标题、五点描述、关键词，提升搜索排名和转化率',
    keywords: ['listing', '标题', '五点描述', '关键词优化', '商品描述', '文案', 'SEO', '上架', '优化标题', '写标题', '写描述', 'bullet points'],
    patterns: [
      /优化.*listing/i,
      /写.*标题/,
      /写.*描述/,
      /优化.*标题/,
      /生成.*文案/,
      /listing.*优化/i,
      /五点描述/,
      /bullet.?points?/i,
    ],
    execute: executeListingOptimize,
  },
];

/**
 * 检测用户消息的意图，返回匹配的技能
 */
export function detectSkill(message: string): SkillDefinition | null {
  const lowerMessage = message.toLowerCase();

  // First check patterns (more specific)
  for (const skill of skills) {
    for (const pattern of skill.patterns) {
      if (pattern.test(lowerMessage)) {
        return skill;
      }
    }
  }

  // Then check keywords
  let bestMatch: SkillDefinition | null = null;
  let bestScore = 0;

  for (const skill of skills) {
    let score = 0;
    for (const keyword of skill.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        score += keyword.length; // Longer keyword matches = higher confidence
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = skill;
    }
  }

  // Require at least a minimum match score
  return bestScore >= 2 ? bestMatch : null;
}

/**
 * 执行技能
 */
export async function executeSkill(
  skillType: SkillType,
  params: SkillExecuteParams
): Promise<SkillResult> {
  const skill = skills.find(s => s.type === skillType);
  if (!skill) {
    return {
      type: skillType,
      status: 'error',
      data: null,
      summary: `未找到技能：${skillType}`,
    };
  }

  return skill.execute(params);
}

/**
 * 获取所有技能定义（用于系统提示词）
 */
export function getSkillDescriptions(): string {
  return skills.map(s => `- **${s.name}**：${s.description}`).join('\n');
}

/**
 * 获取技能名称
 */
export function getSkillName(type: SkillType): string {
  return skills.find(s => s.type === type)?.name || type;
}
