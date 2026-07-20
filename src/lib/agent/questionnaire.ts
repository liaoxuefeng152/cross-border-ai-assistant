/**
 * 交互式需求收集器
 * 参考 WorkBuddy，通过多轮问答引导用户，收集完整需求后再执行任务
 */

export interface Question {
  id: string;
  question: string;
  type: 'single_choice' | 'multi_choice' | 'text' | 'number';
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
  required: boolean;
  skipAllowed: boolean;
}

export interface SkillQuestionnaire {
  skillId: string;
  questions: Question[];
  // 收集完所有答案后，如何构建技能参数
  buildParams: (answers: Record<string, string | string[]>) => Record<string, unknown>;
}

/**
 * 选品技能的问题列表
 */
export const productSelectionQuestions: SkillQuestionnaire = {
  skillId: 'product-selection',
  questions: [
    {
      id: 'platform',
      question: '你打算在哪个平台卖货？不同平台的选品逻辑差异很大。',
      type: 'single_choice',
      options: [
        { label: 'Amazon', value: 'amazon' },
        { label: 'Shopee/Lazada', value: 'shopee' },
        { label: 'TikTok Shop', value: 'tiktok' },
        { label: 'Temu', value: 'temu' },
      ],
      required: true,
      skipAllowed: false,
    },
    {
      id: 'category',
      question: '你想做什么品类？有具体方向吗？',
      type: 'text',
      placeholder: '如：3C 数码、家居收纳、美妆个护...',
      required: false,
      skipAllowed: true,
    },
    {
      id: 'budget',
      question: '你的采购预算大概是多少？',
      type: 'single_choice',
      options: [
        { label: '1 万以下', value: 'low' },
        { label: '1-5 万', value: 'medium' },
        { label: '5-20 万', value: 'high' },
        { label: '20 万以上', value: 'very_high' },
      ],
      required: false,
      skipAllowed: true,
    },
    {
      id: 'experience',
      question: '你有跨境电商经验吗？',
      type: 'single_choice',
      options: [
        { label: '新手，第一次做', value: 'beginner' },
        { label: '有一些经验', value: 'intermediate' },
        { label: '老手，想拓展新品类', value: 'expert' },
      ],
      required: false,
      skipAllowed: true,
    },
  ],
  buildParams: (answers) => ({
    platform: answers.platform,
    category: answers.category,
    budget: answers.budget,
    experience: answers.experience,
  }),
};

/**
 * AI 作图技能的问题列表
 */
export const imageGenQuestions: SkillQuestionnaire = {
  skillId: 'image-gen',
  questions: [
    {
      id: 'product',
      question: '你要拍什么产品？请描述一下产品特征。',
      type: 'text',
      placeholder: '如：黑色无线蓝牙耳机，方形，有音量按钮...',
      required: true,
      skipAllowed: false,
    },
    {
      id: 'style',
      question: '你想要什么风格的图片？',
      type: 'single_choice',
      options: [
        { label: '白底图（Amazon 标准）', value: 'white_bg' },
        { label: '场景图（生活化）', value: 'lifestyle' },
        { label: '信息图（带卖点标注）', value: 'infographic' },
        { label: '对比图', value: 'comparison' },
      ],
      required: false,
      skipAllowed: true,
    },
    {
      id: 'quantity',
      question: '需要生成几张图片？',
      type: 'single_choice',
      options: [
        { label: '1 张', value: '1' },
        { label: '3 张', value: '3' },
        { label: '5 张', value: '5' },
      ],
      required: false,
      skipAllowed: true,
    },
  ],
  buildParams: (answers) => ({
    prompt: answers.product,
    style: answers.style,
    count: parseInt(answers.quantity as string) || 3,
  }),
};

/**
 * AI 视频技能的问题列表
 */
export const videoGenQuestions: SkillQuestionnaire = {
  skillId: 'video-gen',
  questions: [
    {
      id: 'product',
      question: '视频要展示什么产品？',
      type: 'text',
      placeholder: '如：便携式蓝牙音箱...',
      required: true,
      skipAllowed: false,
    },
    {
      id: 'scene',
      question: '想要什么场景？',
      type: 'single_choice',
      options: [
        { label: '产品特写（360 度展示）', value: 'product_closeup' },
        { label: '使用场景（真人演示）', value: 'lifestyle' },
        { label: '工厂/生产线', value: 'factory' },
        { label: '开箱视频', value: 'unboxing' },
      ],
      required: false,
      skipAllowed: true,
    },
    {
      id: 'duration',
      question: '视频时长？',
      type: 'single_choice',
      options: [
        { label: '15 秒（短视频）', value: '15' },
        { label: '30 秒', value: '30' },
        { label: '60 秒', value: '60' },
      ],
      required: false,
      skipAllowed: true,
    },
  ],
  buildParams: (answers) => ({
    prompt: answers.product,
    scene: answers.scene,
    duration: parseInt(answers.duration as string) || 30,
  }),
};

/**
 * Listing 优化技能的问题列表
 */
export const listingOptimizeQuestions: SkillQuestionnaire = {
  skillId: 'listing-optimize',
  questions: [
    {
      id: 'platform',
      question: '哪个平台的 Listing？',
      type: 'single_choice',
      options: [
        { label: 'Amazon', value: 'amazon' },
        { label: 'Shopee', value: 'shopee' },
        { label: 'TikTok Shop', value: 'tiktok' },
      ],
      required: true,
      skipAllowed: false,
    },
    {
      id: 'content',
      question: '请粘贴你当前的 Listing 内容（标题 + 五点描述 + 价格）。',
      type: 'text',
      placeholder: '直接粘贴文本即可...',
      required: true,
      skipAllowed: false,
    },
    {
      id: 'goal',
      question: '你最想优化什么？',
      type: 'multi_choice',
      options: [
        { label: '标题（提升搜索排名）', value: 'title' },
        { label: '五点描述（提升转化）', value: 'bullets' },
        { label: '关键词布局', value: 'keywords' },
        { label: '整体重写', value: 'full_rewrite' },
      ],
      required: false,
      skipAllowed: true,
    },
  ],
  buildParams: (answers) => ({
    platform: answers.platform,
    listingContent: answers.content,
    optimizationGoals: answers.goal,
  }),
};

/**
 * 广告优化技能的问题列表
 */
export const adOptimizeQuestions: SkillQuestionnaire = {
  skillId: 'ad-optimize',
  questions: [
    {
      id: 'platform',
      question: '哪个平台的广告？',
      type: 'single_choice',
      options: [
        { label: 'Amazon PPC', value: 'amazon' },
        { label: 'Facebook/Instagram', value: 'facebook' },
        { label: 'Google Ads', value: 'google' },
        { label: 'TikTok Ads', value: 'tiktok' },
      ],
      required: true,
      skipAllowed: false,
    },
    {
      id: 'currentData',
      question: '请提供当前的广告数据（ACOS、ROAS、点击率、转化率等）。',
      type: 'text',
      placeholder: '如：ACOS 35%，ROAS 2.8，CTR 0.5%...',
      required: false,
      skipAllowed: true,
    },
    {
      id: 'budget',
      question: '每日广告预算？',
      type: 'text',
      placeholder: '如：$50/天',
      required: false,
      skipAllowed: true,
    },
    {
      id: 'goal',
      question: '你的广告目标是什么？',
      type: 'single_choice',
      options: [
        { label: '降低 ACOS', value: 'reduce_acos' },
        { label: '提升销量', value: 'increase_sales' },
        { label: '新品推广', value: 'new_product' },
        { label: '清库存', value: 'clear_inventory' },
      ],
      required: false,
      skipAllowed: true,
    },
  ],
  buildParams: (answers) => ({
    platform: answers.platform,
    currentData: answers.currentData,
    budget: answers.budget,
    goal: answers.goal,
  }),
};

/**
 * 自动客服技能的问题列表
 */
export const autoCsQuestions: SkillQuestionnaire = {
  skillId: 'auto-cs',
  questions: [
    {
      id: 'platform',
      question: '哪个平台的客服？',
      type: 'single_choice',
      options: [
        { label: 'Amazon', value: 'amazon' },
        { label: 'Shopee', value: 'shopee' },
        { label: '独立站', value: 'shopify' },
      ],
      required: true,
      skipAllowed: false,
    },
    {
      id: 'language',
      question: '主要回复什么语言？',
      type: 'single_choice',
      options: [
        { label: '英语', value: 'en' },
        { label: '日语', value: 'ja' },
        { label: '德语', value: 'de' },
        { label: '多语言', value: 'multi' },
      ],
      required: false,
      skipAllowed: true,
    },
    {
      id: 'tone',
      question: '回复风格？',
      type: 'single_choice',
      options: [
        { label: '专业正式', value: 'professional' },
        { label: '友好亲切', value: 'friendly' },
        { label: '简洁高效', value: 'concise' },
      ],
      required: false,
      skipAllowed: true,
    },
  ],
  buildParams: (answers) => ({
    platform: answers.platform,
    language: answers.language,
    tone: answers.tone,
  }),
};

/**
 * 技能问题列表注册表
 */
export const skillQuestionnaires: Record<string, SkillQuestionnaire> = {
  'product-selection': productSelectionQuestions,
  'image-gen': imageGenQuestions,
  'video-gen': videoGenQuestions,
  'listing-optimize': listingOptimizeQuestions,
  'ad-optimize': adOptimizeQuestions,
  'auto-cs': autoCsQuestions,
};

/**
 * 获取技能的问题列表
 */
export function getSkillQuestionnaire(skillId: string): SkillQuestionnaire | null {
  return skillQuestionnaires[skillId] || null;
}
