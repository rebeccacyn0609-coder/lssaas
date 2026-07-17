import type { ModelPricingItem, PromptPriceGroup } from '../../untitled/components/mockData';
import { getModelVendorTypeLabel } from '../../untitled/components/mockData';
import {
  formatModelSpecValue,
  formatModelYearMonth,
  type MarketplaceModel,
} from './modelMarketplaceMeta';
import {
  formatPerCallDisplayPrice,
  formatTokenDisplayPrice,
  type TokenPriceDisplayUnit,
} from '../../untitled/components/formatCny';

export const MODEL_TYPE_LABELS: Record<ModelPricingItem['modelType'], string> = {
  vector: '向量模型',
  text: '文本模型',
  image: '图像生成',
  video: '视频生成',
  audio: '音频模型',
};

export const OFFICIAL_PRICE_FIELDS: {
  name: keyof ModelPricingItem;
  label: string;
  unit?: string;
}[] = [
  { name: 'inputPrice', label: '输入价格' },
  { name: 'completionPrice', label: '输出价格' },
  { name: 'cacheWritePrice', label: '文本缓存写入价格' },
  { name: 'cacheReadPrice', label: '文本缓存输入命中价格' },
  { name: 'imageInputPrice', label: '图像输入价格' },
  { name: 'imageOutputPrice', label: '图像输出价格' },
  { name: 'imageCacheReadPrice', label: '图片缓存输入命中价格' },
  { name: 'audioInputPrice', label: '音频输入价格' },
  { name: 'audioOutputPrice', label: '音频输出价格' },
  { name: 'videoOutputPrice', label: '视频输出价格', unit: 'CNY / 1 Second' },
];

export type TokenPriceUnit = TokenPriceDisplayUnit;

export const TOKEN_PRICE_UNIT_LABELS: Record<TokenPriceUnit, string> = {
  million: '/ M Tokens',
  thousand: '/ K Tokens',
};

export const TOKEN_PRICE_UNIT_OPTIONS: { value: TokenPriceUnit; label: string }[] = [
  { value: 'million', label: TOKEN_PRICE_UNIT_LABELS.million },
  { value: 'thousand', label: TOKEN_PRICE_UNIT_LABELS.thousand },
];

export function getTokenPriceUnitLabel(unit: TokenPriceUnit): string {
  return TOKEN_PRICE_UNIT_LABELS[unit];
}

/** 运营端存储为 CNY / 1M Tokens；切换为 K 时除以 1000 */
export function convertTokenUnitPrice(value: number, unit: TokenPriceUnit): number {
  if (unit === 'million') return value;
  return value / 1000;
}

function formatOfficialTokenPrice(value: number, tokenUnit: TokenPriceUnit): string {
  return formatTokenDisplayPrice(convertTokenUnitPrice(value, tokenUnit), tokenUnit);
}

/** 视频输出等固定单位字段：按 1M 维度展示精度（3 位小数） */
function formatFixedUnitPrice(value: number): string {
  return formatTokenDisplayPrice(value, 'million');
}

export function getModelTypeLabel(modelType: ModelPricingItem['modelType']): string {
  return MODEL_TYPE_LABELS[modelType] ?? modelType;
}

export function getBillingModeLabel(billingMode: ModelPricingItem['billingMode']): string {
  return billingMode === 'token' ? '按 Token' : '按次数';
}

function formatKTokenLabel(value: number): string {
  if (value === 0) return '0';
  return `${value}k`;
}

/** 展示为 (下限, 上限]；未填上限时为 (下限, +∞) */
export function formatInputRange(group: Pick<PromptPriceGroup, 'rangeMin' | 'rangeMax'>): string {
  const minLabel = formatKTokenLabel(group.rangeMin);
  if (typeof group.rangeMax !== 'number' || Number.isNaN(group.rangeMax)) {
    return `(${minLabel}, +∞)`;
  }
  return `(${minLabel}, ${formatKTokenLabel(group.rangeMax)}]`;
}

export function isTierPricingModel(model: ModelPricingItem): boolean {
  return model.billingMode === 'token'
    && !!model.tierPricing
    && (model.promptPriceGroups?.length ?? 0) > 0;
}

function getPromptPriceRowsFromGroup(
  group: PromptPriceGroup,
  tokenUnit: TokenPriceUnit,
  billingMode: ModelPricingItem['billingMode'],
): ModelOfficialPriceRow[] {
  if (billingMode === 'count') {
    if (typeof group.perCallPrice !== 'number' || Number.isNaN(group.perCallPrice)) return [];
    return [{
      label: '每次价格',
      value: formatPerCallDisplayPrice(group.perCallPrice),
      unit: 'CNY / 次',
    }];
  }

  const tokenUnitLabel = getTokenPriceUnitLabel(tokenUnit);
  return OFFICIAL_PRICE_FIELDS.flatMap(({ name, label, unit }) => {
    const raw = group[name];
    if (typeof raw !== 'number' || Number.isNaN(raw)) return [];
    if (unit) {
      return [{ label, value: formatFixedUnitPrice(raw), unit }];
    }
    return [{
      label,
      value: formatOfficialTokenPrice(raw, tokenUnit),
      unit: tokenUnitLabel,
    }];
  });
}

export interface TierOfficialPriceSection {
  rangeLabel: string;
  inputValue?: string;
  outputValue?: string;
  perCallValue?: string;
  unitLabel?: string;
  rows: ModelOfficialPriceRow[];
}

export function getTierOfficialPriceSections(
  model: ModelPricingItem,
  tokenUnit: TokenPriceUnit = 'million',
): TierOfficialPriceSection[] {
  if (!isTierPricingModel(model)) return [];

  return (model.promptPriceGroups ?? []).map((group) => {
    const rows = getPromptPriceRowsFromGroup(group, tokenUnit, model.billingMode);
    if (model.billingMode === 'count') {
      return {
        rangeLabel: formatInputRange(group),
        perCallValue: typeof group.perCallPrice === 'number'
          ? formatPerCallDisplayPrice(group.perCallPrice)
          : '—',
        rows,
      };
    }

    return {
      rangeLabel: formatInputRange(group),
      inputValue: formatOfficialTokenPrice(group.inputPrice ?? 0, tokenUnit),
      outputValue: formatOfficialTokenPrice(group.completionPrice ?? 0, tokenUnit),
      unitLabel: getTokenPriceUnitLabel(tokenUnit),
      rows,
    };
  });
}

export function getOfficialPriceSectionTitle(
  billingMode: ModelPricingItem['billingMode'],
  tokenUnit: TokenPriceUnit = 'million',
): string {
  if (billingMode === 'count') return '官方价格（CNY）';
  return `官方价格（${getTokenPriceUnitLabel(tokenUnit)}）`;
}

export interface ModelBasicInfoRow {
  label: string;
  value: string;
  span?: 1 | 2;
}

export function getModelBasicInfoRows(model: ModelPricingItem): ModelBasicInfoRow[] {
  return [
    { label: '模型名称', value: model.modelName },
    { label: '厂商类型', value: getModelVendorTypeLabel(model.vendorType) },
    { label: '模型类型', value: getModelTypeLabel(model.modelType) },
    { label: '计费模式', value: getBillingModeLabel(model.billingMode) },
    { label: '阶梯价格', value: model.tierPricing ? '是' : '否' },
  ];
}

/** 详情正文「基本信息」字段（模型名称已在抽屉标题展示） */
export function getModelDetailMetaRows(model: MarketplaceModel): ModelBasicInfoRow[] {
  return [
    { label: '厂商类型', value: getModelVendorTypeLabel(model.vendorType) },
    { label: '模型类型', value: getModelTypeLabel(model.modelType) },
    { label: '上下文', value: formatModelSpecValue(model.contextWindow) },
    { label: '最大输入', value: formatModelSpecValue(model.maxInput) },
    { label: '最大输出', value: formatModelSpecValue(model.maxOutput) },
    { label: '计费模式', value: getBillingModeLabel(model.billingMode) },
    { label: '模型发布', value: formatModelYearMonth(model.releasedAt) },
    { label: '知识截止时间', value: formatModelYearMonth(model.knowledgeCutoffAt) },
  ];
}

export interface ModelOfficialPriceRow {
  label: string;
  value: string;
  unit?: string;
}

/** 卡片列表用的官方价格摘要 */
export function getOfficialPriceSummary(
  model: ModelPricingItem,
  tokenUnit: TokenPriceUnit = 'million',
): string {
  if (isTierPricingModel(model)) {
    const sections = getTierOfficialPriceSections(model, tokenUnit);
    if (sections.length === 0) return '—';
    return sections.map((section) => {
      if (model.billingMode === 'count') {
        return `${section.rangeLabel} · ${section.perCallValue ?? '—'} / 次`;
      }
      return `${section.rangeLabel} · 输入 ${section.inputValue ?? '—'} / 输出 ${section.outputValue ?? '—'}`;
    }).join('；');
  }

  if (model.billingMode === 'count') {
    return `${formatPerCallDisplayPrice(model.perCallPrice ?? 0)} / 次`;
  }
  const unitLabel = getTokenPriceUnitLabel(tokenUnit);
  const input = formatOfficialTokenPrice(model.inputPrice ?? 0, tokenUnit);
  const output = formatOfficialTokenPrice(model.completionPrice ?? 0, tokenUnit);
  return `输入 ${input} / 输出 ${output} (${unitLabel})`;
}

export interface CardPriceDisplay {
  mode: 'token' | 'count' | 'tier-token' | 'tier-count';
  unitLabel?: string;
  inputLabel?: string;
  inputValue?: string;
  outputLabel?: string;
  outputValue?: string;
  perCallValue?: string;
  tierSections?: TierOfficialPriceSection[];
}

/** 卡片概览用的结构化价格展示 */
export function getCardPriceDisplay(
  model: ModelPricingItem,
  tokenUnit: TokenPriceUnit = 'million',
): CardPriceDisplay {
  if (isTierPricingModel(model)) {
    const tierSections = getTierOfficialPriceSections(model, tokenUnit);
    return model.billingMode === 'count'
      ? { mode: 'tier-count', tierSections }
      : { mode: 'tier-token', tierSections, unitLabel: getTokenPriceUnitLabel(tokenUnit) };
  }

  if (model.billingMode === 'count') {
    return {
      mode: 'count',
      perCallValue: formatPerCallDisplayPrice(model.perCallPrice ?? 0),
    };
  }
  return {
    mode: 'token',
    unitLabel: getTokenPriceUnitLabel(tokenUnit),
    inputLabel: '输入',
    inputValue: formatOfficialTokenPrice(model.inputPrice ?? 0, tokenUnit),
    outputLabel: '输出',
    outputValue: formatOfficialTokenPrice(model.completionPrice ?? 0, tokenUnit),
  };
}

/** 展示用：运营管理端模型价格管理「更新时间」，截取到年月日（YYYY-MM-DD） */
export function formatModelUpdatedDate(updatedAt?: string): string {
  const trimmed = updatedAt?.trim();
  if (!trimmed) return '—';
  const datePart = trimmed.split(/\s+/)[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;
  return trimmed.slice(0, 10);
}

export function getModelOfficialPriceRows(
  model: ModelPricingItem,
  tokenUnit: TokenPriceUnit = 'million',
): ModelOfficialPriceRow[] {
  if (isTierPricingModel(model)) return [];

  if (model.billingMode === 'count') {
    return [{
      label: '每次价格',
      value: formatPerCallDisplayPrice(model.perCallPrice ?? 0),
      unit: 'CNY / 次',
    }];
  }

  const tokenUnitLabel = getTokenPriceUnitLabel(tokenUnit);

  return OFFICIAL_PRICE_FIELDS.flatMap(({ name, label, unit }) => {
    const raw = model[name];
    if (typeof raw !== 'number' || Number.isNaN(raw)) return [];
    if (unit) {
      return [{ label, value: formatFixedUnitPrice(raw), unit }];
    }
    return [{
      label,
      value: formatOfficialTokenPrice(raw, tokenUnit),
      unit: tokenUnitLabel,
    }];
  });
}

export const MODEL_TYPE_OPTIONS = (
  Object.entries(MODEL_TYPE_LABELS) as [ModelPricingItem['modelType'], string][]
).map(([value, label]) => ({ value, label }));

export interface ModelMarketFilter {
  modelNames?: string[];
  vendorTypes?: ModelPricingItem['vendorType'][];
  modelTypes?: ModelPricingItem['modelType'][];
}

export function matchesModelMarketFilters(
  model: ModelPricingItem,
  filters: ModelMarketFilter,
): boolean {
  const { modelNames, vendorTypes, modelTypes } = filters;
  if (modelNames?.length && !modelNames.includes(model.modelName)) return false;
  if (vendorTypes?.length && !vendorTypes.includes(model.vendorType)) return false;
  if (modelTypes?.length && !modelTypes.includes(model.modelType)) return false;
  return true;
}
