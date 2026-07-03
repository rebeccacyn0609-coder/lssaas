/** @lobehub/icons CDN URL helper — 与官方 getLobeIconCDN API 一致，避免引入完整 React 包 */
export type LobeIconCdnFormat = 'svg' | 'png' | 'webp' | 'avatar';
export type LobeIconCdnType = 'mono' | 'color' | 'text' | 'text-cn' | 'brand' | 'brand-color';
export type LobeIconCdn = 'github' | 'aliyun' | 'unpkg' | 'jsdelivr';

export interface LobeIconCdnConfig {
  format?: LobeIconCdnFormat;
  type?: LobeIconCdnType;
  isDarkMode?: boolean;
  cdn?: LobeIconCdn;
}

/** 固定版本，避免 @latest 在 unpkg 上偶发 404/500 */
const LOBE_ICONS_STATIC_VERSION = '1.62.0';

const GITHUB_ICON_CDN = (type: string) =>
  `https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-${type}`;

const ALIYUN_ICON_CDN = (type: string) =>
  `https://registry.npmmirror.com/@lobehub/icons-static-${type}/${LOBE_ICONS_STATIC_VERSION}/files`;

const UNPKG_ICON_CDN = (type: string) =>
  `https://unpkg.com/@lobehub/icons-static-${type}@${LOBE_ICONS_STATIC_VERSION}`;

const JSDELIVR_ICON_CDN = (type: string) =>
  `https://cdn.jsdelivr.net/npm/@lobehub/icons-static-${type}@${LOBE_ICONS_STATIC_VERSION}`;

export function getLobeIconCDN(id: string, config?: LobeIconCdnConfig): string {
  const {
    format = 'png',
    isDarkMode = false,
    type = 'color',
    cdn = 'github',
  } = config ?? {};

  let baseUrl = '';
  switch (cdn) {
    case 'github':
      baseUrl = GITHUB_ICON_CDN(format);
      break;
    case 'unpkg':
      baseUrl = UNPKG_ICON_CDN(format);
      break;
    case 'aliyun':
      baseUrl = ALIYUN_ICON_CDN(format);
      break;
    case 'jsdelivr':
      baseUrl = JSDELIVR_ICON_CDN(format);
      break;
  }

  if (format === 'avatar') {
    return `${baseUrl}/avatars/${id.toLowerCase()}.webp`;
  }

  const addon = type === 'mono' ? '' : `-${type}`;
  const slug = `${id.toLowerCase()}${addon}`;

  switch (format) {
    case 'svg':
      return `${baseUrl}/icons/${slug}.svg`;
    case 'webp':
      return `${baseUrl}/${isDarkMode ? 'dark' : 'light'}/${slug}.webp`;
    default:
      return `${baseUrl}/${isDarkMode ? 'dark' : 'light'}/${slug}.png`;
  }
}
