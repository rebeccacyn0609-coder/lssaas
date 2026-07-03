import type { ModelPricingItem } from '../../untitled/components/mockData';

import anthropicIcon from './assets/vendors/anthropic.svg?url';
import baichuanIcon from './assets/vendors/baichuan.svg?url';
import cohereIcon from './assets/vendors/cohere.svg?url';
import deepseekIcon from './assets/vendors/deepseek.svg?url';
import defaultIcon from './assets/vendors/default.svg?url';
import doubaoIcon from './assets/vendors/doubao.svg?url';
import geminiIcon from './assets/vendors/gemini.svg?url';
import glmIcon from './assets/vendors/glm.svg?url';
import hunyuanIcon from './assets/vendors/hunyuan.svg?url';
import kimiIcon from './assets/vendors/kimi.svg?url';
import metaIcon from './assets/vendors/meta.svg?url';
import minimaxIcon from './assets/vendors/minimax.svg?url';
import mistralIcon from './assets/vendors/mistral.svg?url';
import openaiIcon from './assets/vendors/openai.svg?url';
import qwenIcon from './assets/vendors/qwen.svg?url';
import sparkIcon from './assets/vendors/spark.svg?url';
import stepfunIcon from './assets/vendors/stepfun.svg?url';
import wenxinIcon from './assets/vendors/wenxin.svg?url';
import xaiIcon from './assets/vendors/xai.svg?url';
import yiIcon from './assets/vendors/yi.svg?url';

/**
 * 厂商 Logo 本地资源（来源 Lobe Icons @1.62.0，按 saas-copy.md「厂商标识规则」映射）。
 * 更新图标: npm run icons:vendor:sync
 */
const LOCAL_VENDOR_ICON_URL: Record<ModelPricingItem['vendorType'], string> = {
  openai: openaiIcon,
  anthropic: anthropicIcon,
  gemini: geminiIcon,
  qwen: qwenIcon,
  kimi: kimiIcon,
  deepseek: deepseekIcon,
  minimax: minimaxIcon,
  glm: glmIcon,
  mistral: mistralIcon,
  meta: metaIcon,
  cohere: cohereIcon,
  xai: xaiIcon,
  baichuan: baichuanIcon,
  doubao: doubaoIcon,
  hunyuan: hunyuanIcon,
  wenxin: wenxinIcon,
  stepfun: stepfunIcon,
  spark: sparkIcon,
  yi: yiIcon,
};

export const VENDOR_ICON_DEFAULT_URL = defaultIcon;

export function getVendorIconCandidates(vendorType: ModelPricingItem['vendorType']): string[] {
  const local = LOCAL_VENDOR_ICON_URL[vendorType];
  if (!local) return [defaultIcon];
  return [local];
}
