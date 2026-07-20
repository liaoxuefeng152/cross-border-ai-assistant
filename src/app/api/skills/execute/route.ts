/**
 * 执行技能 API（带参数）
 * 用于需求收集完成后执行技能
 */
import { NextRequest, NextResponse } from 'next/server';
import { executeSkill } from '@/lib/skills/registry';
import { saveMessage } from '@/lib/agent/memory';
import { saveGeneratedAsset } from '@/lib/agent/asset-saver';
import { getSkillQuestionnaire } from '@/lib/agent/questionnaire';

const USER_ID = '00000000-0000-0000-0000-000000000001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skillId, sessionId, answers } = body;

    if (!skillId || !sessionId || !answers) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 获取问卷，构建技能参数
    const questionnaire = getSkillQuestionnaire(skillId);
    if (!questionnaire) {
      return NextResponse.json(
        { success: false, error: '技能不存在或无需问卷' },
        { status: 400 }
      );
    }

    const skillParams = questionnaire.buildParams(answers);

    // 执行技能
    console.log('[Skills Execute] Executing skill:', skillId, 'with params:', skillParams);
    const result = await executeSkill(skillId, {
      userMessage: JSON.stringify(answers),
      extractedParams: skillParams as Record<string, string>,
      headers: Object.fromEntries(request.headers),
    });
    console.log('[Skills Execute] Skill result:', result);

    // 保存技能执行结果
    await saveMessage({
      sessionId,
      role: 'assistant',
      content: `[技能执行完成] ${result.summary}`,
      skillType: skillId,
      skillResult: result as unknown as Record<string, unknown>,
    });

    // 保存生成的素材
    if (result.status === 'success' && result.data) {
      const data = result.data as Record<string, unknown>;

      // 保存图片
      if (data.imageUrls && Array.isArray(data.imageUrls)) {
        for (const url of data.imageUrls as string[]) {
          await saveGeneratedAsset(url, 'image', sessionId);
        }
      }

      // 保存视频
      if (data.videoUrl && typeof data.videoUrl === 'string') {
        await saveGeneratedAsset(data.videoUrl, 'video', sessionId);
      }
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      summary: result.summary,
    });
  } catch (error) {
    console.error('Execute skill with params error:', error);
    return NextResponse.json(
      { success: false, error: '技能执行失败' },
      { status: 500 }
    );
  }
}
