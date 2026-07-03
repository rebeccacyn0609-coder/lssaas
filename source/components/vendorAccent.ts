import type { ModelPricingItem } from '../../untitled/components/mockData';

export const VENDOR_ACCENTS: Record<
  ModelPricingItem['vendorType'],
  { className: string; label: string }
> = {
  openai: { className: 'vendor-openai', label: 'OpenAI' },
  anthropic: { className: 'vendor-anthropic', label: 'Anthropic' },
  gemini: { className: 'vendor-gemini', label: 'Gemini' },
  qwen: { className: 'vendor-qwen', label: 'Qwen' },
  kimi: { className: 'vendor-kimi', label: 'Kimi' },
  deepseek: { className: 'vendor-deepseek', label: 'DeepSeek' },
  minimax: { className: 'vendor-minimax', label: 'MiniMax' },
  glm: { className: 'vendor-glm', label: '智谱 GLM' },
  mistral: { className: 'vendor-mistral', label: 'Mistral' },
  meta: { className: 'vendor-meta', label: 'Meta' },
  cohere: { className: 'vendor-cohere', label: 'Cohere' },
  xai: { className: 'vendor-xai', label: 'xAI' },
  baichuan: { className: 'vendor-baichuan', label: '百川' },
  doubao: { className: 'vendor-doubao', label: '豆包' },
  hunyuan: { className: 'vendor-hunyuan', label: '混元' },
  wenxin: { className: 'vendor-wenxin', label: '文心' },
  stepfun: { className: 'vendor-stepfun', label: '阶跃' },
  spark: { className: 'vendor-spark', label: '星火' },
  yi: { className: 'vendor-yi', label: '零一万物' },
};

export function getVendorAccentClass(vendorType: ModelPricingItem['vendorType']): string {
  return VENDOR_ACCENTS[vendorType]?.className ?? 'vendor-default';
}
