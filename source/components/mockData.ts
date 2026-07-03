export type KeyStatus = 'enabled' | 'disabled';

/** 密钥来源：运营管理端增量获取为系统，企业自建为自建 */
export type ApiKeySource = 'system' | 'self';

export const API_KEY_SOURCE_LABELS: Record<ApiKeySource, string> = {
  system: '系统',
  self: '自建',
};

export type UsageLogType = '消耗' | '充值' | '扣款';

export type ApplyStatus = 'pending' | 'approved' | 'rejected';

/** SaaS 管理端：企业申请处理状态（由运营管理端同步，非企业提交字段） */
export type EnterpriseApplyProcessStatus = 'unprocessed' | 'processed' | 'ignored';

export const ENTERPRISE_APPLY_PROCESS_LABELS: Record<EnterpriseApplyProcessStatus, string> = {
  unprocessed: '未处理',
  processed: '已处理',
  ignored: '不处理',
};

export interface EnterpriseApplyForm {
  companyName: string;
  creditCode: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  usageScene: string;
}

export interface StoredApplyRecord extends EnterpriseApplyForm {
  id: string;
  submittedAt: string;
  status: ApplyStatus;
  /** SaaS 管理端处理状态，默认未处理 */
  processStatus: EnterpriseApplyProcessStatus;
}

export type { ModelPricingItem } from '../../untitled/components/mockData';
import type { ModelPricingItem } from '../../untitled/components/mockData';
import {
  mockModels as baseMockModels,
  mockModelsForPricingCopy,
  mockModelVendorTypes,
  getModelVendorTypeLabel,
} from '../../untitled/components/mockData';

export { mockModelVendorTypes, getModelVendorTypeLabel };

/** 模型广场补充数据：覆盖更多厂商与模型类型 */
const mockMarketplaceExtraModels: ModelPricingItem[] = [
  {
    id: 'mp-deepseek-v3',
    modelName: 'deepseek-v3',
    vendorType: 'deepseek',
    modelType: 'text',
    remark: 'DeepSeek 旗舰文本模型；按输入区间阶梯计价，长上下文调用单价递增',
    billingMode: 'token',
    tierPricing: true,
    promptPriceGroups: [
      { rangeMin: 0, rangeMax: 64, inputPrice: 1.4, completionPrice: 5.6, cacheReadPrice: 0.28 },
      { rangeMin: 64, rangeMax: 256, inputPrice: 2.0, completionPrice: 8.0, cacheReadPrice: 0.4 },
      { rangeMin: 256, inputPrice: 2.8, completionPrice: 11.2, cacheReadPrice: 0.56 },
    ],
    channelPrices: [],
    updatedAt: '2025-06-18 10:30:00',
  },
  {
    id: 'mp-deepseek-r1',
    modelName: 'deepseek-r1',
    vendorType: 'deepseek',
    modelType: 'text',
    remark: '强化推理链模型；区间价格随输入 Token 规模分段',
    billingMode: 'token',
    tierPricing: true,
    promptPriceGroups: [
      { rangeMin: 0, rangeMax: 32, inputPrice: 3.2, completionPrice: 12.8 },
      { rangeMin: 32, rangeMax: 128, inputPrice: 4.0, completionPrice: 16.0 },
      { rangeMin: 128, inputPrice: 5.5, completionPrice: 22.0 },
    ],
    channelPrices: [],
    updatedAt: '2025-06-17 14:20:00',
  },
  {
    id: 'mp-qwen-max',
    modelName: 'qwen-max',
    vendorType: 'qwen',
    modelType: 'text',
    remark: '通义千问旗舰模型，长文本理解与复杂指令遵循能力强；官方价为按输入区间阶梯计价',
    billingMode: 'token',
    tierPricing: true,
    promptPriceGroups: [
      {
        rangeMin: 0,
        rangeMax: 32,
        inputPrice: 1.2,
        completionPrice: 4.8,
        cacheReadPrice: 0.24,
        cacheWritePrice: 1.5,
      },
      {
        rangeMin: 32,
        rangeMax: 128,
        inputPrice: 2.4,
        completionPrice: 9.6,
        cacheReadPrice: 0.48,
        cacheWritePrice: 3.0,
      },
      {
        rangeMin: 128,
        inputPrice: 3.6,
        completionPrice: 14.4,
        cacheReadPrice: 0.72,
        cacheWritePrice: 4.5,
      },
    ],
    channelPrices: [],
    updatedAt: '2025-06-16 09:15:00',
  },
  {
    id: 'mp-qwen-plus',
    modelName: 'qwen-plus',
    vendorType: 'qwen',
    modelType: 'text',
    remark: '高性价比文本模型；短上下文与长上下文分段计价',
    billingMode: 'token',
    tierPricing: true,
    promptPriceGroups: [
      { rangeMin: 0, rangeMax: 16, inputPrice: 0.6, completionPrice: 1.5, cacheReadPrice: 0.12 },
      { rangeMin: 16, rangeMax: 64, inputPrice: 0.8, completionPrice: 2.0, cacheReadPrice: 0.16 },
      { rangeMin: 64, inputPrice: 1.1, completionPrice: 2.8, cacheReadPrice: 0.22 },
    ],
    channelPrices: [],
    updatedAt: '2025-06-15 16:40:00',
  },
  {
    id: 'mp-qwen-vl-max',
    modelName: 'qwen-vl-max',
    vendorType: 'qwen',
    modelType: 'image',
    remark: '视觉语言模型；图文输入规模按区间计价，含图像输入价',
    billingMode: 'token',
    tierPricing: true,
    promptPriceGroups: [
      {
        rangeMin: 0,
        rangeMax: 32,
        inputPrice: 2.4,
        completionPrice: 7.2,
        imageInputPrice: 0.01,
      },
      {
        rangeMin: 32,
        rangeMax: 128,
        inputPrice: 3.0,
        completionPrice: 9.0,
        imageInputPrice: 0.012,
      },
      { rangeMin: 128, inputPrice: 3.6, completionPrice: 10.8, imageInputPrice: 0.014 },
    ],
    channelPrices: [],
    updatedAt: '2025-06-14 11:00:00',
  },
  {
    id: 'mp-kimi-latest',
    modelName: 'kimi-latest',
    vendorType: 'kimi',
    modelType: 'text',
    remark: 'Moonshot 最新对话模型，超长上下文；按输入规模四档区间计价',
    billingMode: 'token',
    tierPricing: true,
    promptPriceGroups: [
      { rangeMin: 0, rangeMax: 32, inputPrice: 8.0, completionPrice: 8.0, cacheReadPrice: 1.6 },
      { rangeMin: 32, rangeMax: 128, inputPrice: 10.0, completionPrice: 10.0, cacheReadPrice: 2.0 },
      { rangeMin: 128, rangeMax: 512, inputPrice: 12.0, completionPrice: 12.0, cacheReadPrice: 2.4 },
      { rangeMin: 512, inputPrice: 15.0, completionPrice: 15.0, cacheReadPrice: 3.0 },
    ],
    channelPrices: [],
    updatedAt: '2025-06-13 08:50:00',
  },
  {
    id: 'mp-moonshot-v1-128k',
    modelName: 'moonshot-v1-128k',
    vendorType: 'kimi',
    modelType: 'text',
    remark: '128K 上下文窗口，适合长文档分段处理与全文摘要',
    billingMode: 'token',
    tierPricing: false,
    inputPrice: 5.0,
    completionPrice: 5.0,
    channelPrices: [],
    updatedAt: '2025-06-12 17:25:00',
  },
  {
    id: 'mp-claude-3-opus',
    modelName: 'claude-3-opus',
    vendorType: 'anthropic',
    modelType: 'text',
    remark: 'Anthropic 最强模型；高端区间价格，含缓存读写价',
    billingMode: 'token',
    tierPricing: true,
    promptPriceGroups: [
      {
        rangeMin: 0,
        rangeMax: 64,
        inputPrice: 72.0,
        completionPrice: 360.0,
        cacheReadPrice: 7.2,
        cacheWritePrice: 90.0,
      },
      {
        rangeMin: 64,
        rangeMax: 200,
        inputPrice: 90.0,
        completionPrice: 450.0,
        cacheReadPrice: 9.0,
        cacheWritePrice: 112.5,
      },
      { rangeMin: 200, inputPrice: 108.0, completionPrice: 540.0, cacheReadPrice: 10.8, cacheWritePrice: 135.0 },
    ],
    channelPrices: [],
    updatedAt: '2025-06-11 13:10:00',
  },
  {
    id: 'mp-claude-3-haiku',
    modelName: 'claude-3-haiku',
    vendorType: 'anthropic',
    modelType: 'text',
    remark: '轻量快速模型；两档区间价格，适合高频调用',
    billingMode: 'token',
    tierPricing: true,
    promptPriceGroups: [
      { rangeMin: 0, rangeMax: 128, inputPrice: 1.44, completionPrice: 7.2, cacheReadPrice: 0.18 },
      { rangeMin: 128, inputPrice: 1.8, completionPrice: 9.0, cacheReadPrice: 0.22 },
    ],
    channelPrices: [],
    updatedAt: '2025-06-10 10:00:00',
  },
  {
    id: 'mp-gemini-2-flash',
    modelName: 'gemini-2.0-flash',
    vendorType: 'gemini',
    modelType: 'text',
    remark: 'Google 新一代快速模型；区间价格覆盖短对话与长上下文',
    billingMode: 'token',
    tierPricing: true,
    promptPriceGroups: [
      { rangeMin: 0, rangeMax: 32, inputPrice: 0.54, completionPrice: 2.16 },
      { rangeMin: 32, rangeMax: 128, inputPrice: 0.72, completionPrice: 2.88 },
      { rangeMin: 128, inputPrice: 0.9, completionPrice: 3.6 },
    ],
    channelPrices: [],
    updatedAt: '2025-06-09 15:30:00',
  },
  {
    id: 'mp-gemini-15-flash',
    modelName: 'gemini-1.5-flash',
    vendorType: 'gemini',
    modelType: 'text',
    remark: '百万级上下文；超长输入按区间递增计价',
    billingMode: 'token',
    tierPricing: true,
    promptPriceGroups: [
      { rangeMin: 0, rangeMax: 64, inputPrice: 0.42, completionPrice: 1.68 },
      { rangeMin: 64, rangeMax: 256, inputPrice: 0.54, completionPrice: 2.16 },
      { rangeMin: 256, rangeMax: 1024, inputPrice: 0.72, completionPrice: 2.88 },
      { rangeMin: 1024, inputPrice: 0.9, completionPrice: 3.6 },
    ],
    channelPrices: [],
    updatedAt: '2025-06-08 12:00:00',
  },
  {
    id: 'mp-gpt-4-turbo',
    modelName: 'gpt-4-turbo',
    vendorType: 'openai',
    modelType: 'text',
    remark: 'GPT-4 Turbo；三档输入区间官方价',
    billingMode: 'token',
    tierPricing: true,
    promptPriceGroups: [
      { rangeMin: 0, rangeMax: 32, inputPrice: 54.0, completionPrice: 162.0, cacheReadPrice: 5.4 },
      { rangeMin: 32, rangeMax: 128, inputPrice: 72.0, completionPrice: 216.0, cacheReadPrice: 7.2 },
      { rangeMin: 128, inputPrice: 90.0, completionPrice: 270.0, cacheReadPrice: 9.0 },
    ],
    channelPrices: [],
    updatedAt: '2025-06-07 09:45:00',
  },
  {
    id: 'mp-o1-preview',
    modelName: 'o1-preview',
    vendorType: 'openai',
    modelType: 'text',
    remark: 'OpenAI 推理模型；推理 Token 规模越大单价越高',
    billingMode: 'token',
    tierPricing: true,
    promptPriceGroups: [
      { rangeMin: 0, rangeMax: 16, inputPrice: 90.0, completionPrice: 360.0 },
      { rangeMin: 16, rangeMax: 64, inputPrice: 108.0, completionPrice: 432.0 },
      { rangeMin: 64, inputPrice: 135.0, completionPrice: 540.0 },
    ],
    channelPrices: [],
    updatedAt: '2025-06-06 18:20:00',
  },
  {
    id: 'mp-text-embedding-3',
    modelName: 'text-embedding-3-large',
    vendorType: 'openai',
    modelType: 'vector',
    remark: 'OpenAI 嵌入模型，用于语义检索、聚类与推荐召回',
    billingMode: 'token',
    tierPricing: false,
    inputPrice: 0.936,
    completionPrice: 0,
    channelPrices: [],
    updatedAt: '2025-06-05 11:30:00',
  },
  {
    id: 'mp-text-embedding-v3',
    modelName: 'text-embedding-v3',
    vendorType: 'qwen',
    modelType: 'vector',
    remark: '通义嵌入模型；批量嵌入按输入规模两档区间计价',
    billingMode: 'token',
    tierPricing: true,
    promptPriceGroups: [
      { rangeMin: 0, rangeMax: 128, inputPrice: 0.28, completionPrice: 0 },
      { rangeMin: 128, inputPrice: 0.35, completionPrice: 0 },
    ],
    channelPrices: [],
    updatedAt: '2025-06-04 14:00:00',
  },
  {
    id: 'mp-tts-1',
    modelName: 'tts-1',
    vendorType: 'openai',
    modelType: 'audio',
    remark: '文本转语音模型，支持多种音色，按字符 Token 计费',
    billingMode: 'token',
    tierPricing: false,
    inputPrice: 0,
    audioOutputPrice: 0.108,
    channelPrices: [],
    updatedAt: '2025-06-03 10:15:00',
  },
  {
    id: 'mp-stable-video',
    modelName: 'stable-video-diffusion',
    vendorType: 'gemini',
    modelType: 'video',
    remark: '视频生成模型，按次计费，每次生成一段标准分辨率视频',
    billingMode: 'count',
    tierPricing: false,
    perCallPrice: 0.35,
    channelPrices: [],
    updatedAt: '2025-06-02 16:50:00',
  },
  {
    id: 'mp-qwen-image',
    modelName: 'qwen-image',
    vendorType: 'qwen',
    modelType: 'image',
    remark: '通义万相图像生成，按次计费，每次生成一张标准尺寸图片',
    billingMode: 'count',
    tierPricing: false,
    perCallPrice: 0.06,
    channelPrices: [],
    updatedAt: '2025-06-01 09:00:00',
  },
  {
    id: 'mp-minimax-abab65',
    modelName: 'abab6.5-chat',
    vendorType: 'minimax',
    modelType: 'text',
    remark: 'MiniMax 旗舰对话模型，中文表达自然，角色扮演与创意写作表现优秀',
    billingMode: 'token',
    tierPricing: false,
    inputPrice: 1.0,
    completionPrice: 1.0,
    channelPrices: [],
    updatedAt: '2025-06-19 11:00:00',
  },
  {
    id: 'mp-minimax-abab65s',
    modelName: 'abab6.5s-chat',
    vendorType: 'minimax',
    modelType: 'text',
    remark: 'MiniMax 轻量快速模型，适合高并发客服与实时对话场景',
    billingMode: 'token',
    tierPricing: false,
    inputPrice: 0.5,
    completionPrice: 0.5,
    channelPrices: [],
    updatedAt: '2025-06-19 10:30:00',
  },
  {
    id: 'mp-minimax-speech',
    modelName: 'speech-02-turbo',
    vendorType: 'minimax',
    modelType: 'audio',
    remark: 'MiniMax 语音合成，多音色、低延迟，适合有声内容与播报',
    billingMode: 'token',
    tierPricing: false,
    audioOutputPrice: 0.08,
    channelPrices: [],
    updatedAt: '2025-06-18 16:00:00',
  },
  {
    id: 'mp-glm-4-plus',
    modelName: 'glm-4-plus',
    vendorType: 'glm',
    modelType: 'text',
    remark: '智谱 GLM-4 旗舰；工具调用场景按输入区间计价',
    billingMode: 'token',
    tierPricing: true,
    promptPriceGroups: [
      { rangeMin: 0, rangeMax: 32, inputPrice: 4.0, completionPrice: 4.0 },
      { rangeMin: 32, rangeMax: 128, inputPrice: 5.0, completionPrice: 5.0 },
      { rangeMin: 128, inputPrice: 6.5, completionPrice: 6.5 },
    ],
    channelPrices: [],
    updatedAt: '2025-06-19 09:20:00',
  },
  {
    id: 'mp-glm-4-flash',
    modelName: 'glm-4-flash',
    vendorType: 'glm',
    modelType: 'text',
    remark: 'GLM-4 快速版，性价比高，适合批量文本处理与日常问答',
    billingMode: 'token',
    tierPricing: false,
    inputPrice: 0.1,
    completionPrice: 0.1,
    channelPrices: [],
    updatedAt: '2025-06-18 14:40:00',
  },
  {
    id: 'mp-glm-4v',
    modelName: 'glm-4v-plus',
    vendorType: 'glm',
    modelType: 'image',
    remark: '智谱视觉语言模型，支持 OCR、图表理解与图文问答',
    billingMode: 'token',
    tierPricing: false,
    inputPrice: 4.0,
    completionPrice: 4.0,
    imageInputPrice: 0.01,
    channelPrices: [],
    updatedAt: '2025-06-17 11:10:00',
  },
  {
    id: 'mp-mistral-large',
    modelName: 'mistral-large-latest',
    vendorType: 'mistral',
    modelType: 'text',
    remark: 'Mistral 旗舰模型，欧洲主流开源生态，多语言与代码能力均衡',
    billingMode: 'token',
    tierPricing: false,
    inputPrice: 16.0,
    completionPrice: 48.0,
    channelPrices: [],
    updatedAt: '2025-06-19 08:00:00',
  },
  {
    id: 'mp-mistral-small',
    modelName: 'mistral-small-latest',
    vendorType: 'mistral',
    modelType: 'text',
    remark: 'Mistral 轻量模型，低延迟、成本友好，适合边缘部署',
    billingMode: 'token',
    tierPricing: false,
    inputPrice: 1.8,
    completionPrice: 5.4,
    channelPrices: [],
    updatedAt: '2025-06-18 12:30:00',
  },
  {
    id: 'mp-meta-llama33',
    modelName: 'llama-3.3-70b-instruct',
    vendorType: 'meta',
    modelType: 'text',
    remark: 'Meta Llama 3.3 开源指令模型，可私有化部署，通用能力强',
    billingMode: 'token',
    tierPricing: false,
    inputPrice: 2.16,
    completionPrice: 2.16,
    channelPrices: [],
    updatedAt: '2025-06-17 15:00:00',
  },
  {
    id: 'mp-cohere-command-r',
    modelName: 'command-r-plus',
    vendorType: 'cohere',
    modelType: 'text',
    remark: 'Cohere 企业级 RAG 模型，检索增强与引用生成表现突出',
    billingMode: 'token',
    tierPricing: false,
    inputPrice: 21.6,
    completionPrice: 86.4,
    channelPrices: [],
    updatedAt: '2025-06-16 13:20:00',
  },
  {
    id: 'mp-xai-grok2',
    modelName: 'grok-2',
    vendorType: 'xai',
    modelType: 'text',
    remark: 'xAI Grok 系列，实时信息检索与幽默风格对话',
    billingMode: 'token',
    tierPricing: false,
    inputPrice: 14.4,
    completionPrice: 57.6,
    channelPrices: [],
    updatedAt: '2025-06-15 10:50:00',
  },
  {
    id: 'mp-baichuan4',
    modelName: 'baichuan4-turbo',
    vendorType: 'baichuan',
    modelType: 'text',
    remark: '百川 4 代 Turbo，中文理解与知识问答能力优秀',
    billingMode: 'token',
    tierPricing: false,
    inputPrice: 1.2,
    completionPrice: 1.2,
    channelPrices: [],
    updatedAt: '2025-06-14 09:30:00',
  },
  {
    id: 'mp-doubao-pro',
    modelName: 'doubao-pro-32k',
    vendorType: 'doubao',
    modelType: 'text',
    remark: '字节豆包 Pro，32K 上下文，适合企业知识库与办公助手',
    billingMode: 'token',
    tierPricing: false,
    inputPrice: 0.8,
    completionPrice: 2.0,
    channelPrices: [],
    updatedAt: '2025-06-13 14:00:00',
  },
  {
    id: 'mp-doubao-lite',
    modelName: 'doubao-lite-32k',
    vendorType: 'doubao',
    modelType: 'text',
    remark: '豆包 Lite；轻量场景两档区间价格',
    billingMode: 'token',
    tierPricing: true,
    promptPriceGroups: [
      { rangeMin: 0, rangeMax: 32, inputPrice: 0.24, completionPrice: 0.48 },
      { rangeMin: 32, inputPrice: 0.3, completionPrice: 0.6 },
    ],
    channelPrices: [],
    updatedAt: '2025-06-12 11:40:00',
  },
  {
    id: 'mp-hunyuan-pro',
    modelName: 'hunyuan-pro',
    vendorType: 'hunyuan',
    modelType: 'text',
    remark: '腾讯混元 Pro；中文长文本三档区间计价',
    billingMode: 'token',
    tierPricing: true,
    promptPriceGroups: [
      { rangeMin: 0, rangeMax: 32, inputPrice: 2.4, completionPrice: 7.2 },
      { rangeMin: 32, rangeMax: 128, inputPrice: 3.0, completionPrice: 9.0 },
      { rangeMin: 128, inputPrice: 3.6, completionPrice: 10.8 },
    ],
    channelPrices: [],
    updatedAt: '2025-06-11 16:20:00',
  },
  {
    id: 'mp-wenxin-4',
    modelName: 'ernie-4.0-8k',
    vendorType: 'wenxin',
    modelType: 'text',
    remark: '百度文心 4.0；知识问答场景区间价格',
    billingMode: 'token',
    tierPricing: true,
    promptPriceGroups: [
      { rangeMin: 0, rangeMax: 16, inputPrice: 6.4, completionPrice: 19.2 },
      { rangeMin: 16, rangeMax: 64, inputPrice: 8.0, completionPrice: 24.0 },
      { rangeMin: 64, inputPrice: 9.6, completionPrice: 28.8 },
    ],
    channelPrices: [],
    updatedAt: '2025-06-10 13:50:00',
  },
  {
    id: 'mp-step-2',
    modelName: 'step-2-16k',
    vendorType: 'stepfun',
    modelType: 'text',
    remark: '阶跃 Step-2 模型，数学与逻辑推理能力突出',
    billingMode: 'token',
    tierPricing: false,
    inputPrice: 1.5,
    completionPrice: 1.5,
    channelPrices: [],
    updatedAt: '2025-06-09 10:10:00',
  },
  {
    id: 'mp-spark-max',
    modelName: 'spark-max',
    vendorType: 'spark',
    modelType: 'text',
    remark: '讯飞星火 Max，中文语音与文本多模态，教育与企业场景常用',
    billingMode: 'token',
    tierPricing: false,
    inputPrice: 2.1,
    completionPrice: 2.1,
    channelPrices: [],
    updatedAt: '2025-06-08 15:30:00',
  },
  {
    id: 'mp-yi-large',
    modelName: 'yi-large',
    vendorType: 'yi',
    modelType: 'text',
    remark: '零一万物 Yi-Large；双语长文本区间价格',
    billingMode: 'token',
    tierPricing: true,
    promptPriceGroups: [
      { rangeMin: 0, rangeMax: 64, inputPrice: 1.6, completionPrice: 1.6 },
      { rangeMin: 64, rangeMax: 256, inputPrice: 2.0, completionPrice: 2.0 },
      { rangeMin: 256, inputPrice: 2.5, completionPrice: 2.5 },
    ],
    channelPrices: [],
    updatedAt: '2025-06-07 12:00:00',
  },
  {
    id: 'mp-yi-vision',
    modelName: 'yi-vision',
    vendorType: 'yi',
    modelType: 'image',
    remark: 'Yi 视觉模型，图文理解与视觉问答',
    billingMode: 'token',
    tierPricing: false,
    inputPrice: 2.5,
    completionPrice: 2.5,
    imageInputPrice: 0.008,
    channelPrices: [],
    updatedAt: '2025-06-06 09:40:00',
  },
  {
    id: 'mp-gpt-4o-mini-tier',
    modelName: 'gpt-4o-mini',
    vendorType: 'openai',
    modelType: 'text',
    remark: 'GPT-4o Mini 区间价专版；高频调用分档计价示范',
    billingMode: 'token',
    tierPricing: true,
    promptPriceGroups: [
      { rangeMin: 0, rangeMax: 16, inputPrice: 0.12, completionPrice: 0.48, cacheReadPrice: 0.06 },
      { rangeMin: 16, rangeMax: 64, inputPrice: 0.15, completionPrice: 0.6, cacheReadPrice: 0.075 },
      { rangeMin: 64, rangeMax: 256, inputPrice: 0.18, completionPrice: 0.72, cacheReadPrice: 0.09 },
      { rangeMin: 256, inputPrice: 0.22, completionPrice: 0.88, cacheReadPrice: 0.11 },
    ],
    channelPrices: [],
    updatedAt: '2025-06-20 10:00:00',
  },
  {
    id: 'mp-doubao-pro-tier',
    modelName: 'doubao-pro-128k',
    vendorType: 'doubao',
    modelType: 'text',
    remark: '豆包 Pro 128K；企业长文档场景五档区间官方价',
    billingMode: 'token',
    tierPricing: true,
    promptPriceGroups: [
      { rangeMin: 0, rangeMax: 32, inputPrice: 0.8, completionPrice: 2.0 },
      { rangeMin: 32, rangeMax: 64, inputPrice: 1.0, completionPrice: 2.5 },
      { rangeMin: 64, rangeMax: 128, inputPrice: 1.2, completionPrice: 3.0 },
      { rangeMin: 128, rangeMax: 512, inputPrice: 1.5, completionPrice: 3.75 },
      { rangeMin: 512, inputPrice: 1.8, completionPrice: 4.5 },
    ],
    channelPrices: [],
    updatedAt: '2025-06-20 09:30:00',
  },
  {
    id: 'mp-minimax-image-tier',
    modelName: 'minimax-image-01',
    vendorType: 'minimax',
    modelType: 'image',
    remark: 'MiniMax 图像生成，按次计费，每次生成一张标准尺寸图片',
    billingMode: 'count',
    tierPricing: false,
    perCallPrice: 0.05,
    channelPrices: [],
    updatedAt: '2025-06-20 08:00:00',
  },
];

/** SaaS 模型广场：基础模型 + 阶梯价格示例 + 广场补充模型 */
export const mockModels = [
  ...baseMockModels,
  ...mockModelsForPricingCopy.filter(
    (model) => model.tierPricing && !baseMockModels.some((item) => item.id === model.id),
  ),
  ...mockMarketplaceExtraModels,
];

export interface ApiKeyRow {
  id: string;
  name: string;
  key: string;
  /** 密钥来源 */
  source: ApiKeySource;
  /** 企业工作台侧状态 */
  status: KeyStatus;
  /** 运营管理端状态 */
  adminStatus: AdminKeyStatus;
  /** 运营管理端额度限制类型 */
  quotaMode: QuotaMode;
  /** 密钥所属分组名称 */
  groupName: string;
  /** 密钥分组是否为启用状态 */
  groupEnabled: boolean;
  /** 与密钥分组匹配的渠道分组是否为启用状态 */
  channelGroupEnabled: boolean;
  /** 密钥分组是否与渠道分组一致（已匹配） */
  groupMatched: boolean;
  createdAt: string;
  lastUsedAt: string | null;
  /** 运营管理端对应项目密钥的备注（列表展示为「描述」） */
  remark: string;
  /** 运营管理端 API 地址；系统密钥只读，自建密钥可编辑 */
  apiBaseUrl?: string;
  /** 自建密钥绑定的模型名称 */
  modelName?: string;
  /** 运营管理端配置的允许模型；空数组表示未显式配置，按分组与渠道分组匹配解析 */
  allowedModels: string[];
  /** 运营管理端配置的 IP 白名单；未配置时为空展示（与允许模型无关） */
  ipWhitelist: string;
}

export type AdminKeyStatus = 'enabled' | 'disabled' | 'exhausted';

export type QuotaMode = 'limited' | 'unlimited';

/** 消耗记录来源：平台网关调用 | 系统内部应用调用（自建密钥仅统计后者） */
export type UsageLogOrigin = 'platform' | 'internal';

export interface UsageLogRow {
  id: string;
  type: UsageLogType;
  time: string;
  model: string;
  apiKeyName: string;
  tokens: number;
  costCny: number;
  durationMs: number;
  remark: string;
  /** 消耗类日志的来源；自建密钥工作台仅展示 internal */
  usageOrigin?: UsageLogOrigin;
}

export type AccountAdjustmentType = '充值' | '扣款';

export interface RechargeRecordRow {
  id: string;
  type: AccountAdjustmentType;
  time: string;
  /** 金额绝对值（展示时充值带 +，扣款带 −） */
  amount: number;
  balanceAfter: number;
  channel: string;
  operator: string;
  remark: string;
}

export interface AccountBalance {
  current: number;
  totalSpent: number;
  unlimited: boolean;
}

export const DEMO_ACCOUNT = {
  username: 'demo',
  password: 'lsyz123',
  companyName: '汇特科技（演示）',
};

export const DEFAULT_SYSTEM_API_BASE_URL = 'https://gateway.lingshu.ai/v1';

export const mockApiKeys: ApiKeyRow[] = [
  {
    id: 'k1',
    name: '生产环境密钥',
    key: 'sk-ls-prod-a8f3k2m9x7q1w5e6r4t2y8u0',
    source: 'system',
    status: 'enabled',
    adminStatus: 'enabled',
    quotaMode: 'unlimited',
    groupName: '默认分组',
    groupEnabled: true,
    channelGroupEnabled: true,
    groupMatched: true,
    createdAt: '2026-04-10 09:30:00',
    lastUsedAt: null,
    remark: '线上业务主密钥',
    apiBaseUrl: DEFAULT_SYSTEM_API_BASE_URL,
    allowedModels: ['gpt-4o', 'gpt-4o-mini'],
    ipWhitelist: '192.168.1.0/24',
  },
  {
    id: 'k2',
    name: '测试环境密钥',
    key: 'sk-ls-test-b2c4d6f8h0j1k3l5m7n9p1',
    source: 'system',
    status: 'enabled',
    adminStatus: 'enabled',
    quotaMode: 'limited',
    groupName: 'VIP渠道组',
    groupEnabled: true,
    channelGroupEnabled: true,
    groupMatched: false,
    createdAt: '2026-05-02 11:15:00',
    lastUsedAt: null,
    remark: '分组与渠道未匹配；允许模型为空时无可路由模型',
    apiBaseUrl: DEFAULT_SYSTEM_API_BASE_URL,
    allowedModels: [],
    ipWhitelist: '',
  },
  {
    id: 'k3',
    name: '第三方 OpenAI 代理',
    key: 'sk-self-demo-9f8e7d6c5b4a3210',
    source: 'self',
    status: 'enabled',
    adminStatus: 'enabled',
    quotaMode: 'unlimited',
    groupName: '',
    groupEnabled: true,
    channelGroupEnabled: true,
    groupMatched: true,
    createdAt: '2026-05-20 16:00:00',
    lastUsedAt: null,
    remark: '对接客户自有 OpenAI 兼容网关',
    apiBaseUrl: 'https://api.openai.com/v1',
    modelName: 'gpt-4o-mini',
    allowedModels: ['gpt-4o-mini', 'gpt-4o'],
    ipWhitelist: '',
  },
  {
    id: 'k6',
    name: '全量路由密钥',
    key: 'sk-ls-route-f6h8j0l2n4p6r8t0v2x4',
    source: 'system',
    status: 'enabled',
    adminStatus: 'enabled',
    quotaMode: 'unlimited',
    groupName: '默认分组',
    groupEnabled: true,
    channelGroupEnabled: true,
    groupMatched: true,
    createdAt: '2026-06-10 08:00:00',
    lastUsedAt: null,
    remark: '允许模型为空；分组「默认分组」已匹配渠道路由',
    apiBaseUrl: DEFAULT_SYSTEM_API_BASE_URL,
    allowedModels: [],
    ipWhitelist: '10.20.0.0/16',
  },
  {
    id: 'k7',
    name: 'VIP路由密钥',
    key: 'sk-ls-vip-g7i9k1m3o5q7s9u1w3y5',
    source: 'system',
    status: 'enabled',
    adminStatus: 'enabled',
    quotaMode: 'unlimited',
    groupName: 'VIP渠道组',
    groupEnabled: true,
    channelGroupEnabled: true,
    groupMatched: true,
    createdAt: '2026-06-15 11:20:00',
    lastUsedAt: null,
    remark: '允许模型为空；分组「VIP渠道组」已匹配 VIP 渠道',
    apiBaseUrl: DEFAULT_SYSTEM_API_BASE_URL,
    allowedModels: [],
    ipWhitelist: '203.0.113.0/24',
  },
];

/** 运营管理端增量返回的企业项目密钥（创建时间为运营端创建时间；不含最近使用与企业侧状态） */
export interface AdminProjectApiKeyRecord {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  remark: string;
  apiBaseUrl: string;
  adminStatus: AdminKeyStatus;
  quotaMode: QuotaMode;
  groupName: string;
  groupEnabled: boolean;
  channelGroupEnabled: boolean;
  groupMatched: boolean;
  allowedModels: string[];
  ipWhitelist: string;
}

export const mockAdminProjectApiKeys: AdminProjectApiKeyRecord[] = [
  {
    id: 'k1',
    name: '生产环境密钥',
    key: 'sk-ls-prod-a8f3k2m9x7q1w5e6r4t2y8u0',
    createdAt: '2026-04-10 09:30:00',
    remark: '线上业务主密钥',
    apiBaseUrl: DEFAULT_SYSTEM_API_BASE_URL,
    adminStatus: 'enabled',
    quotaMode: 'unlimited',
    groupName: '默认分组',
    groupEnabled: true,
    channelGroupEnabled: true,
    groupMatched: true,
    allowedModels: ['gpt-4o', 'gpt-4o-mini'],
    ipWhitelist: '192.168.1.0/24',
  },
  {
    id: 'k4',
    name: '运营分配密钥',
    key: 'sk-ls-admin-d4f6h8j0l2n4p6r8t0v2x4',
    createdAt: '2026-06-18 10:00:00',
    remark: '运营管理端新分配',
    apiBaseUrl: DEFAULT_SYSTEM_API_BASE_URL,
    adminStatus: 'disabled',
    quotaMode: 'unlimited',
    groupName: '默认分组',
    groupEnabled: true,
    channelGroupEnabled: true,
    groupMatched: true,
    allowedModels: ['claude-3-5-sonnet', 'qwen-max'],
    ipWhitelist: '10.0.0.0/8',
  },
  {
    id: 'k5',
    name: '灰度环境密钥',
    key: 'sk-ls-gray-e5g7i9k1m3o5q7s9u1w3y5',
    createdAt: '2026-06-21 14:30:00',
    remark: '运营管理端增量分配',
    apiBaseUrl: DEFAULT_SYSTEM_API_BASE_URL,
    adminStatus: 'exhausted',
    quotaMode: 'limited',
    groupName: '企业客户组',
    groupEnabled: false,
    channelGroupEnabled: true,
    groupMatched: true,
    allowedModels: [],
    ipWhitelist: '203.0.113.10\n203.0.113.11',
  },
];

/** 运营管理端：渠道分组与旗下模型（密钥分组匹配后用于「允许模型为空」时的测试列表） */
export interface AdminChannelRoute {
  channelId: string;
  channelName: string;
  /** 与密钥 groupName 对应的分组名称 */
  groupName: string;
  models: string[];
}

export const mockAdminChannelRoutes: AdminChannelRoute[] = [
  {
    channelId: 'ch-openai',
    channelName: 'OpenAI-主渠道',
    groupName: '默认分组',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  },
  {
    channelId: 'ch-anthropic',
    channelName: 'Anthropic-备用',
    groupName: '默认分组',
    models: ['claude-3-5-sonnet', 'claude-3-haiku'],
  },
  {
    channelId: 'ch-vip',
    channelName: 'VIP-高速通道',
    groupName: 'VIP渠道组',
    models: ['gpt-4o-mini', 'deepseek-v3'],
  },
  {
    channelId: 'ch-enterprise',
    channelName: '企业专属通道',
    groupName: '企业客户组',
    models: ['qwen-max', 'kimi-latest'],
  },
];

function recentTime(daysAgo: number, hour: number, minute: number, second: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, second, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export const mockUsageLogs: UsageLogRow[] = [
  {
    id: 'u1',
    type: '消耗',
    time: recentTime(0, 14, 32, 18),
    model: 'gpt-4o-mini',
    apiKeyName: '生产环境密钥',
    tokens: 1856,
    costCny: 0.37,
    durationMs: 1240,
    remark: '对话补全',
    usageOrigin: 'platform',
  },
  {
    id: 'u2',
    type: '消耗',
    time: recentTime(0, 13, 58, 2),
    model: 'gpt-4o',
    apiKeyName: '生产环境密钥',
    tokens: 4208,
    costCny: 2.52,
    durationMs: 3420,
    remark: '代码生成',
    usageOrigin: 'platform',
  },
  {
    id: 'u3',
    type: '消耗',
    time: recentTime(1, 16, 45, 33),
    model: 'claude-3-5-sonnet',
    apiKeyName: '测试环境密钥',
    tokens: 3102,
    costCny: 1.86,
    durationMs: 2100,
    remark: '文档分析',
    usageOrigin: 'platform',
  },
  {
    id: 'u4',
    type: '扣款',
    time: recentTime(1, 18, 20, 11),
    model: '',
    apiKeyName: '',
    tokens: 0,
    costCny: -200,
    durationMs: 0,
    remark: '项目余额扣款（运营管理）',
  },
  {
    id: 'u5',
    type: '消耗',
    time: recentTime(2, 9, 12, 44),
    model: 'gpt-4o-mini',
    apiKeyName: '生产环境密钥',
    tokens: 512,
    costCny: 0.1,
    durationMs: 680,
    remark: '摘要提取',
    usageOrigin: 'platform',
  },
  {
    id: 'u6',
    type: '消耗',
    time: recentTime(0, 11, 8, 36),
    model: 'gpt-4o-mini',
    apiKeyName: '第三方 OpenAI 代理',
    tokens: 256,
    costCny: 0.05,
    durationMs: 612,
    remark: '系统内部应用调用',
    usageOrigin: 'internal',
  },
  {
    id: 'u6b',
    type: '消耗',
    time: recentTime(3, 15, 22, 10),
    model: 'gpt-4o-mini',
    apiKeyName: '第三方 OpenAI 代理',
    tokens: 96,
    costCny: 0.02,
    durationMs: 480,
    remark: '外部业务调用（工作台不可见）',
    usageOrigin: 'platform',
  },
  {
    id: 'u7',
    type: '充值',
    time: recentTime(3, 10, 0, 0),
    model: '',
    apiKeyName: '',
    tokens: 0,
    costCny: 5000,
    durationMs: 0,
    remark: '项目额度充值',
  },
];

export const mockRechargeRecords: RechargeRecordRow[] = [
  {
    id: 'r1',
    type: '充值',
    time: recentTime(0, 10, 0, 0),
    amount: 5000,
    balanceAfter: 12850.5,
    channel: '运营管理端',
    operator: '系统管理员',
    remark: '项目额度充值',
  },
  {
    id: 'r2',
    type: '充值',
    time: recentTime(15, 14, 30, 0),
    amount: 10000,
    balanceAfter: 7850.5,
    channel: '运营管理端',
    operator: '系统管理员',
    remark: '季度额度补充',
  },
  {
    id: 'r3',
    type: '充值',
    time: recentTime(45, 9, 15, 22),
    amount: 3000,
    balanceAfter: -2149.5,
    channel: '运营管理端',
    operator: '财务专员',
    remark: '试用额度开通',
  },
  {
    id: 'r4',
    type: '扣款',
    time: recentTime(3, 18, 20, 11),
    amount: 200,
    balanceAfter: 12650.5,
    channel: '运营管理端',
    operator: '系统管理员',
    remark: '项目余额扣款（运营管理）',
  },
  {
    id: 'r5',
    type: '扣款',
    time: recentTime(8, 16, 5, 40),
    amount: 500,
    balanceAfter: 7350.5,
    channel: '运营管理端',
    operator: '财务专员',
    remark: '超额使用调整扣款',
  },
];

export const accountBalance: AccountBalance = {
  current: 12850.5,
  totalSpent: 24680.32,
  unlimited: false,
};

/** SaaS 客户端 CNY 金额展示与汇总精度（四舍五入） */
export const AMOUNT_DISPLAY_DECIMALS = 3;

export function roundAmountCny(value: number): number {
  const factor = 10 ** AMOUNT_DISPLAY_DECIMALS;
  return Math.round(value * factor) / factor;
}

export function formatCny(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: AMOUNT_DISPLAY_DECIMALS,
    maximumFractionDigits: AMOUNT_DISPLAY_DECIMALS,
  });
}

export function formatTokens(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return Math.round(value).toLocaleString('zh-CN');
}

/** 根据密钥名称解析来源；充值/扣款等无密钥名称时返回 null */
export function resolveUsageLogApiKeySource(apiKeyName: string): ApiKeySource | null {
  if (!apiKeyName?.trim()) return null;
  return mockApiKeys.find((item) => item.name === apiKeyName)?.source ?? null;
}

export function sortUsageLogsByTimeDesc(rows: UsageLogRow[]): UsageLogRow[] {
  return [...rows].sort((a, b) => (a.time < b.time ? 1 : a.time > b.time ? -1 : 0));
}

/** 消耗日志是否应在工作台展示（自建密钥仅展示系统内部应用调用） */
export function isUsageLogVisibleInWorkbench(log: UsageLogRow, apiKeyName: string): boolean {
  if (log.type !== '消耗') return true;
  const key = mockApiKeys.find((item) => item.name === apiKeyName);
  if (key?.source === 'self') return log.usageOrigin === 'internal';
  return log.usageOrigin !== 'internal';
}

export function filterUsageLogsForWorkbench(rows: UsageLogRow[]): UsageLogRow[] {
  return rows.filter((row) => {
    if (row.type !== '消耗' || !row.apiKeyName) return true;
    return isUsageLogVisibleInWorkbench(row, row.apiKeyName);
  });
}

/** 最近使用：取该密钥在消耗日志中最新一条「消耗」记录的时间 */
export function getApiKeyLastUsedFromConsumeLogs(apiKeyName: string): string | null {
  let latest: string | null = null;
  for (const log of mockUsageLogs) {
    if (log.type !== '消耗' || log.apiKeyName !== apiKeyName) continue;
    if (!isUsageLogVisibleInWorkbench(log, apiKeyName)) continue;
    if (!latest || log.time > latest) latest = log.time;
  }
  return latest;
}

export function withApiKeyLastUsed(row: ApiKeyRow): ApiKeyRow {
  return { ...row, lastUsedAt: getApiKeyLastUsedFromConsumeLogs(row.name) };
}

export function formatUsageLogTime(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** 校验密钥是否满足调用成功前提（与 saas-copy 第 6 节一致） */
export function evaluateApiKeyCallable(key: ApiKeyRow): { ok: true } | { ok: false; reason: string } {
  if (key.status !== 'enabled') return { ok: false, reason: '企业侧密钥已禁用' };
  if (key.source === 'self') return { ok: true };
  if (key.adminStatus === 'disabled') return { ok: false, reason: '运营管理端密钥已禁用' };
  if (key.adminStatus === 'exhausted') return { ok: false, reason: '运营管理端密钥额度已耗尽' };
  if (!key.groupMatched) return { ok: false, reason: '密钥分组与渠道分组未匹配' };
  if (!key.groupEnabled) return { ok: false, reason: '密钥分组已禁用' };
  if (!key.channelGroupEnabled) return { ok: false, reason: '渠道分组已禁用' };
  return { ok: true };
}

export interface ApiKeyTestConnectionRow {
  modelName: string;
  durationMs: number;
  errorMessage: string;
  testedAt: string;
}

/** 测试弹窗中的模型行（含未测试状态） */
export interface ApiKeyTestModelRow {
  modelName: string;
  durationMs: number | null;
  errorMessage: string;
  testedAt: string;
}

export interface ApiKeyTestResult {
  success: boolean;
  keyName: string;
  rows: ApiKeyTestConnectionRow[];
  testedAt?: string;
  /** @deprecated 保留兼容；请使用 rows */
  message?: string;
  model?: string;
  tokens?: number;
  costCny?: number;
  durationMs?: number;
  failureReason?: string;
}

export function getSelfKeyModelNames(row: ApiKeyRow): string[] {
  if (row.source !== 'self') return [];
  const fromList = row.allowedModels?.map((name) => name.trim()).filter(Boolean) ?? [];
  if (fromList.length) return fromList;
  return row.modelName?.trim() ? [row.modelName.trim()] : [];
}

/** 列表/详情展示用：系统密钥有效模型（含允许模型为空时的渠道路由结果） */
export function getSystemKeyEffectiveModels(key: ApiKeyRow): string[] {
  if (key.source !== 'system') return [];
  const allowed = key.allowedModels.map((name) => name.trim()).filter(Boolean);
  if (allowed.length > 0) return allowed;
  return resolveApiKeyTestModels(key);
}

/** 系统密钥允许模型是否为空（展示与测试均走渠道路由解析） */
export function isSystemKeyChannelRoutedModels(key: ApiKeyRow): boolean {
  if (key.source !== 'system') return false;
  return key.allowedModels.map((name) => name.trim()).filter(Boolean).length === 0;
}

export function getApiKeyDisplayModels(key: ApiKeyRow): {
  models: string[];
  channelRouted: boolean;
} {
  if (key.source === 'self') {
    return { models: getSelfKeyModelNames(key), channelRouted: false };
  }
  const channelRouted = isSystemKeyChannelRoutedModels(key);
  return { models: getSystemKeyEffectiveModels(key), channelRouted };
}

/** 解析密钥可测试的模型列表（系统 / 自建规则见 saas-copy 第 7.1 节） */
export function resolveApiKeyTestModels(key: ApiKeyRow): string[] {
  if (key.source === 'self') {
    return getSelfKeyModelNames(key);
  }
  const allowed = key.allowedModels.map((name) => name.trim()).filter(Boolean);
  if (allowed.length > 0) return allowed;
  if (!key.groupMatched) return [];
  const fromChannels = mockAdminChannelRoutes
    .filter((route) => route.groupName === key.groupName)
    .flatMap((route) => route.models);
  return [...new Set(fromChannels)];
}

export function buildApiKeyTestModelRows(
  models: string[],
  results: Record<string, Pick<ApiKeyTestConnectionRow, 'durationMs' | 'errorMessage' | 'testedAt'>> = {},
): ApiKeyTestModelRow[] {
  return models.map((modelName) => {
    const result = results[modelName];
    if (!result) {
      return { modelName, durationMs: null, errorMessage: '', testedAt: '' };
    }
    return {
      modelName,
      durationMs: result.durationMs,
      errorMessage: result.errorMessage,
      testedAt: result.testedAt,
    };
  });
}

/** @deprecated 请使用 resolveApiKeyTestModels */
export function getApiKeyModelsToTest(key: ApiKeyRow): string[] {
  return resolveApiKeyTestModels(key);
}

export function maskApiKey(key: string): string {
  if (key.length <= 14) return key;
  return `${key.slice(0, 10)}...${key.slice(-4)}`;
}

const APPLY_STORAGE_KEY = 'lingshu-saas-apply-records';
const OPS_APPLY_STORAGE_KEY = 'lingshu-ops-apply-records';

function normalizeProcessStatus(status?: EnterpriseApplyProcessStatus | 'deleted'): EnterpriseApplyProcessStatus {
  if (status === 'processed') return 'processed';
  if (status === 'ignored' || status === 'deleted') return 'ignored';
  return 'unprocessed';
}

function loadOpsApplyRecordsForSync(): Array<{ id: string; processStatus: EnterpriseApplyProcessStatus }> {
  try {
    const raw = sessionStorage.getItem(OPS_APPLY_STORAGE_KEY);
    if (!raw) return [];
    const records = JSON.parse(raw) as Array<{ id: string; processStatus?: string }>;
    if (!Array.isArray(records)) return [];
    return records.map((item) => ({
      id: item.id,
      processStatus: normalizeProcessStatus(item.processStatus as EnterpriseApplyProcessStatus | 'deleted'),
    }));
  } catch {
    return [];
  }
}

export interface SyncApplyStatusResult {
  syncedAt: string;
  updatedCount: number;
  ignoredCount: number;
  processedCount: number;
  skippedCount: number;
}

/** 从运营管理端增量同步已在运营端入库的申请状态；未同步到运营端的申请不更新 */
export function syncApplyProcessStatusFromOps(): SyncApplyStatusResult {
  const records = loadApplyRecords();
  const opsMap = new Map(loadOpsApplyRecordsForSync().map((item) => [item.id, item]));

  let updatedCount = 0;
  let ignoredCount = 0;
  let processedCount = 0;
  let skippedCount = 0;

  const next = records.map((record) => {
    const opsRecord = opsMap.get(record.id);
    if (!opsRecord) {
      skippedCount += 1;
      return record;
    }

    const nextStatus = normalizeProcessStatus(opsRecord.processStatus);
    if (record.processStatus !== nextStatus) {
      updatedCount += 1;
      if (nextStatus === 'ignored') ignoredCount += 1;
      if (nextStatus === 'processed') processedCount += 1;
    }

    return { ...record, processStatus: nextStatus };
  });

  persistApplyRecords(next);

  return {
    syncedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    updatedCount,
    ignoredCount,
    processedCount,
    skippedCount,
  };
}

function formatApplySubmittedAt(daysAgo: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toLocaleString('zh-CN', { hour12: false });
}

const SEED_APPLY_RECORDS: StoredApplyRecord[] = [
  {
    id: 'apply-seed-1',
    companyName: '汇特科技有限公司',
    creditCode: '91440300MA5F8K2X3P',
    contactName: '张明',
    contactPhone: '13800138001',
    contactEmail: 'zhangming@huitech.cn',
    usageScene: '智能客服与知识库问答，预计日调用量 50 万次。',
    submittedAt: formatApplySubmittedAt(0, 10, 25),
    status: 'pending',
    processStatus: 'unprocessed',
  },
  {
    id: 'apply-seed-2',
    companyName: '星云智能科技',
    creditCode: '91310115MA1K4D9E7W',
    contactName: '李薇',
    contactPhone: '13900139002',
    contactEmail: 'liwei@nebula-ai.com',
    usageScene: '代码辅助与文档分析，接入 GPT 与 Claude 系列模型。',
    submittedAt: formatApplySubmittedAt(1, 15, 40),
    status: 'pending',
    processStatus: 'processed',
  },
  {
    id: 'apply-seed-3',
    companyName: '蓝海数据服务',
    creditCode: '',
    contactName: '王浩',
    contactPhone: '13700137003',
    contactEmail: 'wanghao@blueocean-data.cn',
    usageScene: '数据标注与摘要提取，内部业务系统调用。',
    submittedAt: formatApplySubmittedAt(2, 9, 12),
    status: 'pending',
    processStatus: 'unprocessed',
  },
  {
    id: 'apply-seed-4',
    companyName: '匠心创新实验室',
    creditCode: '91110108MA01R5T67K',
    contactName: '陈悦',
    contactPhone: '13600136004',
    contactEmail: 'chenyue@jiangxin-lab.com',
    usageScene: '产品研发阶段的模型能力评测与对比。',
    submittedAt: formatApplySubmittedAt(4, 14, 8),
    status: 'pending',
    processStatus: 'processed',
  },
  {
    id: 'apply-seed-5',
    companyName: '明德教育集团',
    creditCode: '91440101MA59Y3H21L',
    contactName: '赵琳',
    contactPhone: '13500135005',
    contactEmail: 'zhaolin@mingde-edu.cn',
    usageScene: '教学辅助、作业批改与学情分析，需支持多模态模型。',
    submittedAt: formatApplySubmittedAt(0, 16, 52),
    status: 'pending',
    processStatus: 'unprocessed',
  },
  {
    id: 'apply-seed-6',
    companyName: '云帆物流科技',
    creditCode: '',
    contactName: '刘洋',
    contactPhone: '13300133006',
    contactEmail: 'liuyang@yunfan-logistics.com',
    usageScene: '运单 OCR 识别与智能调度对话助手。',
    submittedAt: formatApplySubmittedAt(6, 11, 30),
    status: 'pending',
    processStatus: 'processed',
  },
];

function normalizeApplyRecords(records: StoredApplyRecord[]): StoredApplyRecord[] {
  return records.map((record) => ({
    ...record,
    processStatus: normalizeProcessStatus(record.processStatus),
  }));
}

function withSeedApplyRecords(records: StoredApplyRecord[]): StoredApplyRecord[] {
  const existingIds = new Set(records.map((item) => item.id));
  const missingSeeds = SEED_APPLY_RECORDS.filter((item) => !existingIds.has(item.id));
  if (missingSeeds.length === 0) return normalizeApplyRecords(records);
  const merged = [...missingSeeds, ...records];
  persistApplyRecords(merged);
  return normalizeApplyRecords(merged);
}

export function loadApplyRecords(): StoredApplyRecord[] {
  try {
    const raw = sessionStorage.getItem(APPLY_STORAGE_KEY);
    if (!raw) {
      persistApplyRecords(SEED_APPLY_RECORDS);
      return normalizeApplyRecords(SEED_APPLY_RECORDS);
    }
    const records = JSON.parse(raw) as StoredApplyRecord[];
    return withSeedApplyRecords(records);
  } catch {
    persistApplyRecords(SEED_APPLY_RECORDS);
    return normalizeApplyRecords(SEED_APPLY_RECORDS);
  }
}

function persistApplyRecords(records: StoredApplyRecord[]) {
  sessionStorage.setItem(APPLY_STORAGE_KEY, JSON.stringify(records));
}

export function saveApplyRecord(form: EnterpriseApplyForm): StoredApplyRecord {
  const records = loadApplyRecords();
  const record: StoredApplyRecord = {
    ...form,
    id: `apply-${Date.now()}`,
    submittedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    status: 'pending',
    processStatus: 'unprocessed',
  };
  records.unshift(record);
  persistApplyRecords(records);
  return record;
}

export function markApplyRecordProcessed(id: string): StoredApplyRecord | null {
  const records = loadApplyRecords();
  const index = records.findIndex((item) => item.id === id);
  if (index < 0) return null;
  records[index] = { ...records[index], processStatus: 'processed' };
  persistApplyRecords(records);
  return records[index];
}

export function deleteApplyRecord(id: string): boolean {
  const records = loadApplyRecords();
  const target = records.find((item) => item.id === id);
  if (!target || target.processStatus === 'processed') return false;
  persistApplyRecords(records.filter((item) => item.id !== id));
  return true;
}

const SESSION_KEY = 'lingshu-saas-session';

export function getSession(): { companyName: string } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as { companyName: string } : null;
  } catch {
    return null;
  }
}

export function setSession(companyName: string): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ companyName }));
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
