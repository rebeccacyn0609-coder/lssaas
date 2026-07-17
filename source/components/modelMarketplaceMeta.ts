import type { ModelPricingItem } from '../../untitled/components/mockData';

/** 模型广场扩展字段（运营管理端同步，可选） */
export interface ModelMarketplaceExtra {
  capabilityTags?: string[];
  contextWindow?: string;
  maxInput?: string;
  maxOutput?: string;
  /** 模型发布，YYYY-MM */
  releasedAt?: string;
  /** 知识截止，YYYY-MM */
  knowledgeCutoffAt?: string;
}

export type MarketplaceModel = ModelPricingItem & ModelMarketplaceExtra;

export function formatModelSpecValue(value?: string): string {
  const trimmed = value?.trim();
  return trimmed || '—';
}

/** 展示年月（YYYY-MM）；无值时展示 — */
export function formatModelYearMonth(value?: string): string {
  const trimmed = value?.trim();
  if (!trimmed) return '—';
  const match = trimmed.match(/^(\d{4}-\d{2})/);
  return match ? match[1] : '—';
}

export function getModelCapabilityTags(model: MarketplaceModel): string[] {
  return model.capabilityTags?.filter((tag) => tag.trim()) ?? [];
}

const MARKETPLACE_META_BY_NAME: Record<string, ModelMarketplaceExtra> = {
  'deepseek-r1': {
    capabilityTags: ['推理', '代码'],
    contextWindow: '128K',
    maxInput: '128K',
    maxOutput: '32K',
    releasedAt: '2025-01',
    knowledgeCutoffAt: '2024-10',
  },
  'deepseek-v3': {
    capabilityTags: ['推理', '对话', '代码'],
    contextWindow: '128K',
    maxInput: '128K',
    maxOutput: '8K',
    releasedAt: '2024-12',
    knowledgeCutoffAt: '2024-06',
  },
  'gpt-4o': {
    capabilityTags: ['多模态', '推理', '代码'],
    contextWindow: '128K',
    maxInput: '128K',
    maxOutput: '16K',
    releasedAt: '2024-05',
    knowledgeCutoffAt: '2023-10',
  },
  'gpt-4o-mini': {
    capabilityTags: ['多模态', '对话'],
    contextWindow: '128K',
    maxInput: '128K',
    maxOutput: '16K',
    releasedAt: '2024-07',
    knowledgeCutoffAt: '2023-10',
  },
  'claude-3-5-sonnet': {
    capabilityTags: ['推理', '多模态', '代码'],
    contextWindow: '200K',
    maxInput: '200K',
    maxOutput: '8K',
    releasedAt: '2024-06',
    knowledgeCutoffAt: '2024-04',
  },
  'qwen-max': {
    capabilityTags: ['推理', '对话', '代码'],
    contextWindow: '128K',
    maxInput: '128K',
    maxOutput: '8K',
    releasedAt: '2024-09',
  },
  'qwen-vl-max': {
    capabilityTags: ['多模态', '推理'],
    contextWindow: '128K',
    maxInput: '128K',
    maxOutput: '8K',
    releasedAt: '2024-08',
    knowledgeCutoffAt: '2024-03',
  },
};

function inferCapabilityTags(model: ModelPricingItem): string[] {
  const name = model.modelName.toLowerCase();
  const tags: string[] = [];

  if (name.includes('r1') || name.includes('o1') || name.includes('reason')) tags.push('推理');
  if (name.includes('code') || name.includes('coder')) tags.push('代码');
  if (name.includes('4o') || name.includes('vision') || name.includes('vl') || name.includes('gemini-pro-vision')) {
    tags.push('多模态');
  }
  if (model.modelType === 'image') tags.push('图像生成');
  else if (model.modelType === 'video') tags.push('视频生成');
  else if (model.modelType === 'audio') tags.push('音频');
  else if (model.modelType === 'vector') tags.push('向量');
  else if (tags.length === 0) tags.push('对话');

  return [...new Set(tags)].slice(0, 5);
}

export function enrichMarketplaceModel(model: ModelPricingItem): MarketplaceModel {
  const preset = MARKETPLACE_META_BY_NAME[model.modelName];
  if (preset) {
    return { ...model, ...preset };
  }

  return {
    ...model,
    capabilityTags: inferCapabilityTags(model),
  };
}
