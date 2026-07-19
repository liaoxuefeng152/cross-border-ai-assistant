import type { SkillDefinition, SkillExecuteParams, SkillResult } from './types';

/** 广告诊断结果 */
interface AdDiagnosis {
  acos: number;
  roas: number;
  spend: number;
  orders: number;
  clicks: number;
  impressions: number;
  ctr: number;
  cvr: number;
  trend: 'up' | 'down' | 'stable';
}

/** 搜索词分析结果 */
interface SearchTermAnalysis {
  term: string;
  clicks: number;
  spend: number;
  orders: number;
  acos: number;
  recommendation: 'negative' | 'boost' | 'exact' | 'watch';
  reason: string;
}

/** 广告优化建议 */
interface AdRecommendation {
  type: 'negative' | 'boost' | 'budget' | 'structure' | 'keyword';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
}

/** 广告优化技能参数 */
interface AdOptimizeParams {
  /** 分析类型：diagnose | search-terms | structure | new-product */
  analysisType: string;
  /** 广告报告数据（CSV 或文本） */
  reportData?: string;
  /** ASIN */
  asin?: string;
  /** 广告活动名称 */
  campaignName?: string;
  /** 目标 ACoS */
  targetAcos?: number;
  /** 日预算 */
  dailyBudget?: number;
  /** 产品品类 */
  category?: string;
  /** 产品价格 */
  price?: number;
}

/** 解析 CSV 数据 */
function parseCSVReport(data: string): Array<Record<string, string>> {
  const lines = data.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

/** 从报告数据中提取指标 */
function extractMetrics(rows: Array<Record<string, string>>): AdDiagnosis {
  let totalSpend = 0;
  let totalOrders = 0;
  let totalClicks = 0;
  let totalImpressions = 0;
  let totalSales = 0;

  rows.forEach(row => {
    totalSpend += parseFloat(row['Spend'] || row['7 Day Total Spend'] || '0') || 0;
    totalOrders += parseInt(row['Orders'] || row['7 Day Total Orders'] || '0') || 0;
    totalClicks += parseInt(row['Clicks'] || row['7 Day Total Clicks'] || '0') || 0;
    totalImpressions += parseInt(row['Impressions'] || row['7 Day Total Impressions'] || '0') || 0;
    totalSales += parseFloat(row['Sales'] || row['7 Day Total Sales'] || '0') || 0;
  });

  const acos = totalSales > 0 ? (totalSpend / totalSales) * 100 : 0;
  const roas = totalSpend > 0 ? totalSales / totalSpend : 0;
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const cvr = totalClicks > 0 ? (totalOrders / totalClicks) * 100 : 0;

  return {
    acos: Math.round(acos * 10) / 10,
    roas: Math.round(roas * 100) / 100,
    spend: Math.round(totalSpend * 100) / 100,
    orders: totalOrders,
    clicks: totalClicks,
    impressions: totalImpressions,
    ctr: Math.round(ctr * 100) / 100,
    cvr: Math.round(cvr * 100) / 100,
    trend: acos > 40 ? 'down' : acos < 25 ? 'up' : 'stable',
  };
}

/** 分析搜索词 */
function analyzeSearchTerms(rows: Array<Record<string, string>>): SearchTermAnalysis[] {
  const termMap = new Map<string, { clicks: number; spend: number; orders: number; sales: number }>();

  rows.forEach(row => {
    const term = row['Search Term'] || row['Customer Search Term'] || '';
    if (!term) return;

    const existing = termMap.get(term) || { clicks: 0, spend: 0, orders: 0, sales: 0 };
    termMap.set(term, {
      clicks: existing.clicks + (parseInt(row['Clicks'] || '0') || 0),
      spend: existing.spend + (parseFloat(row['Spend'] || '0') || 0),
      orders: existing.orders + (parseInt(row['Orders'] || '0') || 0),
      sales: existing.sales + (parseFloat(row['Sales'] || '0') || 0),
    });
  });

  const results: SearchTermAnalysis[] = [];

  termMap.forEach((data, term) => {
    const acos = data.sales > 0 ? (data.spend / data.sales) * 100 : 999;
    let recommendation: SearchTermAnalysis['recommendation'] = 'watch';
    let reason = '';

    if (data.clicks >= 10 && data.orders === 0) {
      recommendation = 'negative';
      reason = `点击${data.clicks}次零转化，浪费$${data.spend.toFixed(2)}`;
    } else if (acos < 20 && data.orders >= 2) {
      recommendation = 'boost';
      reason = `ACoS ${acos.toFixed(1)}%，转化优秀，建议提高竞价`;
    } else if (acos < 30 && data.orders >= 1) {
      recommendation = 'exact';
      reason = `ACoS ${acos.toFixed(1)}%，建议转为精准匹配`;
    } else {
      reason = `ACoS ${acos.toFixed(1)}%，继续观察`;
    }

    results.push({
      term,
      clicks: data.clicks,
      spend: Math.round(data.spend * 100) / 100,
      orders: data.orders,
      acos: Math.round(acos * 10) / 10,
      recommendation,
      reason,
    });
  });

  return results.sort((a, b) => b.spend - a.spend);
}

/** 生成优化建议 */
function generateRecommendations(
  metrics: AdDiagnosis,
  searchTerms: SearchTermAnalysis[],
  targetAcos: number = 30
): AdRecommendation[] {
  const recommendations: AdRecommendation[] = [];

  // 高 ACoS 警告
  if (metrics.acos > targetAcos) {
    recommendations.push({
      type: 'budget',
      priority: 'high',
      title: `ACoS 偏高 (${metrics.acos}%)`,
      description: `当前 ACoS 为 ${metrics.acos}%，超过目标 ${targetAcos}%。建议降低表现差的关键词竞价，或增加否定关键词。`,
      impact: `预计可降低 ACoS 至 ${targetAcos}% 左右，节省约 $${(metrics.spend * (metrics.acos - targetAcos) / 100).toFixed(2)}/周`,
    });
  }

  // 否定关键词建议
  const negativeTerms = searchTerms.filter(t => t.recommendation === 'negative');
  if (negativeTerms.length > 0) {
    const wastedSpend = negativeTerms.reduce((sum, t) => sum + t.spend, 0);
    recommendations.push({
      type: 'negative',
      priority: 'high',
      title: `建议否定 ${negativeTerms.length} 个搜索词`,
      description: negativeTerms.slice(0, 5).map(t => `• ${t.term} - ${t.reason}`).join('\n'),
      impact: `预计每周节省 $${wastedSpend.toFixed(2)} 无效花费`,
    });
  }

  // 加价关键词建议
  const boostTerms = searchTerms.filter(t => t.recommendation === 'boost');
  if (boostTerms.length > 0) {
    recommendations.push({
      type: 'boost',
      priority: 'medium',
      title: `建议提高 ${boostTerms.length} 个关键词竞价`,
      description: boostTerms.slice(0, 5).map(t => `• ${t.term} - ${t.reason}`).join('\n'),
      impact: '预计可增加 15-25% 的订单量',
    });
  }

  // 低 CTR 警告
  if (metrics.ctr < 0.3 && metrics.impressions > 1000) {
    recommendations.push({
      type: 'keyword',
      priority: 'medium',
      title: '点击率偏低',
      description: `CTR 仅 ${metrics.ctr}%，低于行业平均 0.5%。建议优化主图、标题或调整关键词相关性。`,
      impact: '优化后预计 CTR 可提升至 0.5%+',
    });
  }

  // 低转化率警告
  if (metrics.cvr < 5 && metrics.clicks > 100) {
    recommendations.push({
      type: 'structure',
      priority: 'medium',
      title: '转化率偏低',
      description: `CVR 仅 ${metrics.cvr}%，建议检查 Listing 质量（主图、五点描述、评价数量）。`,
      impact: '转化率每提升 1%，ROAS 可提升约 20%',
    });
  }

  return recommendations;
}

/** 新品广告策略 */
function generateNewProductStrategy(category: string, price: number): string {
  return `## 新品广告分阶段投放策略

### 第 1 周：数据收集期
- **广告类型**：自动广告
- **竞价策略**：动态竞价 - 仅降低
- **日预算**：$${Math.round(price * 0.5 * 10) / 10}（约预期日销额的 50%）
- **目标**：收集搜索词数据，了解市场 CPC

### 第 2-3 周：词库建立期
- **动作**：从自动广告报告中提取转化词
- **新建**：手动广告 - 精准匹配（转化词）+ 词组匹配（相关词）
- **竞价**：精准匹配竞价 = 自动广告平均 CPC × 1.2
- **否定**：将精准匹配词从自动广告中否定

### 第 4 周+：优化放量期
- **ACoS 目标**：<${Math.round(30)}%
- **动作**：
  - 否定零转化词（点击>10 次）
  - 提高高转化词竞价（ACoS<20% 的词 +30%）
  - 逐步降低自动广告预算至 $${Math.round(price * 0.2 * 10) / 10}/天
- **扩展**：考虑 Sponsored Brands 广告

### 预算分配建议
| 阶段 | 自动广告 | 手动精准 | 手动词组 | 总日预算 |
|------|---------|---------|---------|---------|
| 第 1 周 | 100% | - | - | $${Math.round(price * 0.5 * 10) / 10} |
| 第 2-3 周 | 60% | 30% | 10% | $${Math.round(price * 0.8 * 10) / 10} |
| 第 4 周+ | 20% | 60% | 20% | $${Math.round(price * 1.0 * 10) / 10} |`;
}

/** 广告优化技能处理器 */
export const adOptimizeHandler: SkillDefinition = {
  type: 'ad-optimize',
  name: '广告优化',
  description: '分析亚马逊广告报告，提供 ACoS 优化、搜索词分析、广告架构优化建议',
  keywords: ['广告', 'acos', 'roas', '搜索词', '竞价', '否定', 'campaign', 'sponsored', 'ppc', 'cpc'],
  patterns: [
    /广告.*优化/,
    /广告.*分析/,
    /广告.*报告/,
    /acos.*优化/,
    /搜索词.*分析/,
    /否定.*关键词/,
    /竞价.*调整/,
    /优化.*广告/,
  ],

  async execute(params: SkillExecuteParams): Promise<SkillResult> {
    const { userMessage } = params;

    // 检测分析类型
    let analysisType = 'diagnose';
    if (userMessage.includes('搜索词') || userMessage.includes('search term')) {
      analysisType = 'search-terms';
    } else if (userMessage.includes('架构') || userMessage.includes('结构') || userMessage.includes('整理')) {
      analysisType = 'structure';
    } else if (userMessage.includes('新品') || userMessage.includes('新广告') || userMessage.includes('冷启动')) {
      analysisType = 'new-product';
    }

    // 提取 ASIN
    const asinMatch = userMessage.match(/(?:ASIN|asin)[:：\s]*([A-Z0-9]{10})/i);
    const asin = asinMatch ? asinMatch[1] : undefined;

    // 提取目标 ACoS
    const acosMatch = userMessage.match(/(?:目标|target|期望).*?(\d+)%?/);
    const targetAcos = acosMatch ? parseFloat(acosMatch[1]) : 30;

    // 提取品类
    const categoryMatch = userMessage.match(/(?:品类|类目|category)[:：\s]*(\S+)/);
    const category = categoryMatch ? categoryMatch[1] : '通用';

    // 提取价格
    const priceMatch = userMessage.match(/(?:价格|price|售价)[:：\s]*\$?(\d+(?:\.\d+)?)/);
    const price = priceMatch ? parseFloat(priceMatch[1]) : 29.99;

    // 解析报告数据
    const reportData = userMessage;
    const rows = parseCSVReport(reportData);

    if (analysisType === 'new-product') {
      const strategy = generateNewProductStrategy(category, price);
      return {
        type: 'ad-optimize',
        status: 'success',
        data: {
          analysisType: 'new-product',
          strategy,
          category,
          price,
        },
        summary: `已生成${category}品类新品广告策略`,
      };
    }

    if (rows.length === 0) {
      return {
        type: 'ad-optimize',
        status: 'success',
        data: {
          analysisType,
          message: '未检测到广告报告数据，请粘贴 CSV 格式的搜索词报告或广告报告。格式示例：\nSearch Term,Clicks,Spend,Orders,Sales\nbluetooth speaker,15,12.5,2,45.99',
          sampleFormat: 'Search Term,Clicks,Spend,Orders,Sales',
        },
        summary: '等待广告报告数据',
      };
    }

    // 分析指标
    const metrics = extractMetrics(rows);
    const searchTerms = analyzeSearchTerms(rows);
    const recommendations = generateRecommendations(metrics, searchTerms, targetAcos);

    return {
      type: 'ad-optimize',
      status: 'success',
      data: {
        analysisType,
        metrics,
        searchTerms: searchTerms.slice(0, 20),
        recommendations,
        targetAcos,
        summary: {
          totalTerms: searchTerms.length,
          negativeCount: searchTerms.filter(t => t.recommendation === 'negative').length,
          boostCount: searchTerms.filter(t => t.recommendation === 'boost').length,
          wastedSpend: searchTerms
            .filter(t => t.recommendation === 'negative')
            .reduce((sum, t) => sum + t.spend, 0),
        },
      },
      summary: `ACoS ${metrics.acos}% | ROAS ${metrics.roas} | ${recommendations.length}条优化建议`,
    };
  },
};
