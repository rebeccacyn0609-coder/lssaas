import type { ThemeConfig } from 'antd';

import { AXHUB_FORM_THEME_COMPONENTS } from '../../../common/antdFormConfig';
import tokens from '../../../themes/antd-new/designToken.json';

const t = tokens as Record<string, string | number>;

/** 灵数 SaaS 深海蓝主题 token */
const DEEP_SEA = {
  primary: '#1f5f8f',
  primaryHover: '#2a74ad',
  primaryActive: '#184a72',
  primaryLight: '#3a84b8',
  primaryBg: '#e6f0f8',
  ink: '#152536',
  inkSecondary: '#3f5568',
  inkMuted: '#6b8294',
  canvas: '#f3f7fb',
  border: '#e2eaf2',
  borderSecondary: '#c8d6e4',
} as const;

function trimShadow(value: unknown): string | undefined {
  return typeof value === 'string' ? value.trim() : undefined;
}

/** ConfigProvider 主题：深海蓝覆盖 + antd-new 其余 token */
export const SAAS_THEME: ThemeConfig = {
  token: {
    colorPrimary: DEEP_SEA.primary,
    colorInfo: DEEP_SEA.primary,
    colorLink: DEEP_SEA.primary,
    colorLinkHover: DEEP_SEA.primaryHover,
    colorLinkActive: DEEP_SEA.primaryActive,
    colorSuccess: t.colorSuccess as string,
    colorWarning: t.colorWarning as string,
    colorError: t.colorError as string,
    borderRadius: t.borderRadius as number,
    borderRadiusLG: t.borderRadiusLG as number,
    fontSize: t.fontSize as number,
    fontFamily: t.fontFamily as string,
    colorBgLayout: DEEP_SEA.canvas,
    colorBorder: DEEP_SEA.border,
    colorBorderSecondary: DEEP_SEA.borderSecondary,
    colorText: DEEP_SEA.ink,
    colorTextSecondary: DEEP_SEA.inkSecondary,
    colorTextTertiary: DEEP_SEA.inkMuted,
    colorPrimaryBg: DEEP_SEA.primaryBg,
    colorPrimaryBgHover: DEEP_SEA.primaryBg,
    colorPrimaryBorder: DEEP_SEA.primaryLight,
    colorPrimaryHover: DEEP_SEA.primaryHover,
    colorPrimaryActive: DEEP_SEA.primaryActive,
    controlHeight: t.controlHeight as number,
    controlHeightLG: t.controlHeightLG as number,
    boxShadow: trimShadow(t.boxShadow),
    boxShadowSecondary: trimShadow(t.boxShadowSecondary),
    boxShadowTertiary: trimShadow(t.boxShadowTertiary),
  },
  components: {
    ...AXHUB_FORM_THEME_COMPONENTS,
    Menu: {
      itemSelectedBg: DEEP_SEA.primaryBg,
      itemSelectedColor: DEEP_SEA.primary,
      itemBorderRadius: t.borderRadius as number,
    },
    Card: {
      borderRadiusLG: t.borderRadiusLG as number,
    },
    Button: {
      borderRadius: t.borderRadius as number,
      controlHeight: t.controlHeight as number,
    },
    Input: {
      borderRadius: t.borderRadius as number,
      controlHeight: t.controlHeightLG as number,
    },
    Table: {
      borderRadius: t.borderRadiusLG as number,
      headerBg: t.colorFillAlter as string,
    },
    Drawer: {
      paddingLG: t.paddingLG as number,
    },
  },
};
