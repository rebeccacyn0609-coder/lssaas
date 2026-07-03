/**
 * @name SaaS客户端界面
 *
 * 参考资料：
 * - /src/themes/antd-new（Ant Design System 设计基底）
 * - /src/resources/saas-copy.md
 *
 * 含企业工作台与 SaaS 平台管理端（原 saas-admin）。
 */

import './style.css';

import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ApartmentOutlined,
  BarChartOutlined,
  BellOutlined,
  BookOutlined,
  DashboardOutlined,
  FileTextOutlined,
  HomeOutlined,
  KeyOutlined,
  LogoutOutlined,
  MenuOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Breadcrumb,
  Button,
  ConfigProvider,
  Drawer,
  Dropdown,
  Grid,
  Layout,
  Menu,
  Spin,
  Typography,
} from 'antd';
import type { MenuProps } from 'antd';

import { defineHashPageRoute, useHashPage } from '../../common/useHashPage';
import { AXHUB_FORM_PROVIDER_CONFIG } from '../../common/antdFormConfig';
import { SAAS_THEME } from './components/antdTheme';
import { clearSession, DEMO_ACCOUNT, getSession, setSession } from './components/mockData';

const LoginPage = lazy(() => import('./pages/login'));
const ApplyPage = lazy(() => import('./pages/apply'));
const ModelMarketplacePage = lazy(() => import('./pages/model-marketplace'));
const ApiKeysPage = lazy(() => import('./pages/api-keys'));
const UsageQueryPage = lazy(() => import('./pages/usage-query'));
const RechargeRecordsPage = lazy(() => import('./pages/recharge-records'));
const ApiDocsPage = lazy(() => import('./pages/api-docs'));
const DocGetApiKeyPage = lazy(() => import('./pages/doc-get-api-key'));
const DataDashboardPage = lazy(() => import('./pages/data-dashboard'));
const SystemDepartmentsPage = lazy(() => import('./pages/system-departments'));
const SystemUsersPage = lazy(() => import('./pages/system-users'));
const SystemRolesPage = lazy(() => import('./pages/system-roles'));
const EnterpriseApplicationsPage = lazy(() => import('./pages/admin/enterprise-applications'));
const TenantListPage = lazy(() => import('./pages/admin/tenant-list'));
const TenantPackagesPage = lazy(() => import('./pages/admin/tenant-packages'));
const DictionaryPage = lazy(() => import('./pages/admin/dictionary'));
const AnnouncementsPage = lazy(() => import('./pages/admin/announcements'));

const { Content, Header, Sider } = Layout;
const { Text } = Typography;

const AUTH_PAGES = new Set(['login', 'apply']);
const PLATFORM_ADMIN_PAGES = new Set([
  'enterprise-applications',
  'tenant-list',
  'tenant-packages',
  'dictionary',
  'announcements',
]);
const TENANT_ADMIN_PAGES = new Set(['tenant-list', 'tenant-packages']);
const MESSAGE_ADMIN_PAGES = new Set(['announcements']);
const DOC_PAGES = new Set(['doc-get-api-key', 'api-docs']);
const APP_PAGES = new Set([
  'model-marketplace',
  'data-dashboard',
  'api-keys',
  'usage-query',
  'recharge-records',
  ...DOC_PAGES,
  'system-departments',
  'system-users',
  'system-roles',
  ...PLATFORM_ADMIN_PAGES,
]);
const SYSTEM_ADMIN_PAGES = new Set(['system-departments', 'system-users', 'system-roles']);

const route = defineHashPageRoute(
  [
    { id: 'login', title: '登录' },
    { id: 'apply', title: '企业申请' },
    { id: 'model-marketplace', title: '模型广场' },
    { id: 'data-dashboard', title: '数据看板' },
    { id: 'api-keys', title: '企业密钥' },
    { id: 'usage-query', title: '用量查询' },
    { id: 'recharge-records', title: '充值记录' },
    { id: 'doc-get-api-key', title: '获取密钥' },
    { id: 'api-docs', title: '接口文档' },
    { id: 'system-departments', title: '部门管理' },
    { id: 'system-users', title: '人员管理' },
    { id: 'system-roles', title: '角色管理' },
    { id: 'enterprise-applications', title: '申请列表' },
    { id: 'tenant-list', title: '租户列表' },
    { id: 'tenant-packages', title: '租户套餐' },
    { id: 'dictionary', title: '字典管理' },
    { id: 'announcements', title: '通知公告' },
  ],
  { defaultPageId: 'login' },
);

const menuLabels: Record<string, string> = {
  'model-marketplace': '模型广场',
  'data-dashboard': '数据看板',
  'api-keys': '企业密钥',
  'usage-query': '用量查询',
  'recharge-records': '充值记录',
  'doc-get-api-key': '获取密钥',
  'api-docs': '接口文档',
  'system-departments': '部门管理',
  'system-users': '人员管理',
  'system-roles': '角色管理',
  'enterprise-applications': '申请列表',
  'tenant-list': '租户列表',
  'tenant-packages': '租户套餐',
  dictionary: '字典管理',
  announcements: '通知公告',
};

const menuParents: Partial<Record<string, string>> = {
  'doc-get-api-key': '文档说明',
  'api-docs': '文档说明',
  'system-departments': '系统管理',
  'system-users': '系统管理',
  'system-roles': '系统管理',
  'tenant-list': '租户管理',
  'tenant-packages': '租户管理',
  announcements: '消息中心',
};

const menuItems: MenuProps['items'] = [
  {
    type: 'group',
    label: '功能菜单',
    children: [
      { key: 'model-marketplace', icon: <ShopOutlined />, label: '模型广场' },
      { key: 'data-dashboard', icon: <DashboardOutlined />, label: '数据看板' },
      { key: 'api-keys', icon: <KeyOutlined />, label: '企业密钥' },
      { key: 'usage-query', icon: <BarChartOutlined />, label: '用量查询' },
      { key: 'recharge-records', icon: <WalletOutlined />, label: '充值记录' },
      {
        key: 'docs',
        icon: <BookOutlined />,
        label: '文档说明',
        children: [
          { key: 'doc-get-api-key', icon: <SafetyCertificateOutlined />, label: '获取密钥' },
          { key: 'api-docs', icon: <FileTextOutlined />, label: '接口文档' },
        ],
      },
      {
        key: 'system',
        icon: <SettingOutlined />,
        label: '系统管理',
        children: [
          { key: 'system-departments', icon: <ApartmentOutlined />, label: '部门管理' },
          { key: 'system-users', icon: <TeamOutlined />, label: '人员管理' },
          { key: 'system-roles', icon: <SafetyCertificateOutlined />, label: '角色管理' },
        ],
      },
    ],
  },
  {
    type: 'group',
    label: '平台管理',
    children: [
      { key: 'enterprise-applications', icon: <FileTextOutlined />, label: '申请列表' },
      {
        key: 'platform-tenant',
        icon: <TeamOutlined />,
        label: '租户管理',
        children: [
          { key: 'tenant-list', icon: <UnorderedListOutlined />, label: '租户列表' },
          { key: 'tenant-packages', icon: <ApartmentOutlined />, label: '租户套餐' },
        ],
      },
      { key: 'dictionary', icon: <BookOutlined />, label: '字典管理' },
      {
        key: 'platform-message',
        icon: <BellOutlined />,
        label: '消息中心',
        children: [
          { key: 'announcements', icon: <BellOutlined />, label: '通知公告' },
        ],
      },
    ],
  },
];

function PageLoading() {
  return (
    <div className="page-loading">
      <Spin size="large" />
    </div>
  );
}

function SidebarNav({
  page,
  openKeys,
  onOpenChange,
  onNavigate,
}: {
  page: string;
  openKeys: string[];
  onOpenChange: (keys: string[]) => void;
  onNavigate: (key: string) => void;
}) {
  return (
    <>
      <div className="sider-brand">
        <div className="brand-logo">灵</div>
        <div className="brand-copy">
          <span className="brand-text">灵数 API 开放平台</span>
          <span className="brand-subtext">企业工作台</span>
        </div>
      </div>
      <div className="saas-menu-label">导航</div>
      <Menu
        mode="inline"
        theme="light"
        selectedKeys={[page]}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        items={menuItems}
        onClick={({ key }) => {
          if (key === 'docs' || key === 'system' || key === 'platform-tenant' || key === 'platform-message') return;
          onNavigate(key);
        }}
        className="saas-menu saas-menu--grouped"
      />
    </>
  );
}

export default function SaasOpenPlatformApp() {
  const { page, setPage } = useHashPage(route);
  const [session, setSessionState] = useState<{ companyName: string } | null>(() => getSession());
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [menuOpenKeys, setMenuOpenKeys] = useState<string[]>(['docs', 'system', 'platform-tenant', 'platform-message']);
  const screens = Grid.useBreakpoint();
  const isCompact = screens.lg === false;

  useEffect(() => {
    setMenuOpenKeys((prev) => {
      const next = new Set(prev);
      if (DOC_PAGES.has(page)) next.add('docs');
      if (SYSTEM_ADMIN_PAGES.has(page)) next.add('system');
      if (TENANT_ADMIN_PAGES.has(page)) next.add('platform-tenant');
      if (MESSAGE_ADMIN_PAGES.has(page)) next.add('platform-message');
      return [...next];
    });
  }, [page]);

  useEffect(() => {
    if (AUTH_PAGES.has(page)) {
      if (session) {
        clearSession();
        setSessionState(null);
      }
      return;
    }
    if (!session && APP_PAGES.has(page)) {
      setSession(DEMO_ACCOUNT.companyName);
      setSessionState({ companyName: DEMO_ACCOUNT.companyName });
    }
  }, [page, session]);

  const handleLoginSuccess = useCallback(() => {
    const next = getSession();
    setSessionState(next);
    setPage('model-marketplace');
  }, [setPage]);

  const handleLogout = useCallback(() => {
    clearSession();
    setSessionState(null);
    setPage('login');
  }, [setPage]);

  const handleNavigate = useCallback((key: string) => {
    setPage(key);
    setMobileNavOpen(false);
  }, [setPage]);

  const userMenuItems: MenuProps['items'] = useMemo(() => [
    {
      key: 'company',
      label: session?.companyName ?? '企业用户',
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ], [handleLogout, session?.companyName]);

  const currentLabel = menuLabels[page] || '模型广场';
  const parentLabel = menuParents[page];
  const sectionLabel = PLATFORM_ADMIN_PAGES.has(page) ? '平台管理' : undefined;

  const breadcrumbItems = useMemo(() => {
    if (AUTH_PAGES.has(page)) return [];
    return [
      { title: <><HomeOutlined /> 首页</> },
      ...(sectionLabel ? [{ title: sectionLabel }] : []),
      ...(parentLabel && parentLabel !== sectionLabel ? [{ title: parentLabel }] : []),
      { title: currentLabel },
    ];
  }, [currentLabel, page, parentLabel, sectionLabel]);

  if (AUTH_PAGES.has(page)) {
    return (
      <ConfigProvider theme={SAAS_THEME} form={AXHUB_FORM_PROVIDER_CONFIG}>
        <Suspense fallback={<PageLoading />}>
          {page === 'apply' ? (
            <ApplyPage onBackLogin={() => setPage('login')} onSubmitted={() => undefined} />
          ) : (
            <LoginPage onLoginSuccess={handleLoginSuccess} onGoApply={() => setPage('apply')} />
          )}
        </Suspense>
      </ConfigProvider>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'data-dashboard':
        return <DataDashboardPage />;
      case 'api-keys':
        return <ApiKeysPage />;
      case 'usage-query':
        return <UsageQueryPage />;
      case 'recharge-records':
        return <RechargeRecordsPage />;
      case 'doc-get-api-key':
        return <DocGetApiKeyPage />;
      case 'api-docs':
        return <ApiDocsPage />;
      case 'system-departments':
        return <SystemDepartmentsPage />;
      case 'system-users':
        return <SystemUsersPage />;
      case 'system-roles':
        return <SystemRolesPage />;
      case 'enterprise-applications':
        return <EnterpriseApplicationsPage />;
      case 'tenant-list':
        return <TenantListPage />;
      case 'tenant-packages':
        return <TenantPackagesPage />;
      case 'dictionary':
        return <DictionaryPage />;
      case 'announcements':
        return <AnnouncementsPage />;
      case 'model-marketplace':
      default:
        return <ModelMarketplacePage />;
    }
  };

  return (
    <ConfigProvider theme={SAAS_THEME} form={AXHUB_FORM_PROVIDER_CONFIG}>
      <Layout className="saas-layout">
        {!isCompact ? (
          <Sider width={232} className="saas-sider" theme="light">
            <SidebarNav
              page={page}
              openKeys={menuOpenKeys}
              onOpenChange={setMenuOpenKeys}
              onNavigate={handleNavigate}
            />
          </Sider>
        ) : null}

        <Layout className="saas-main">
          <Header className="saas-header">
            <div className="saas-header-start">
              {isCompact ? (
                <Button
                  type="text"
                  className="saas-menu-trigger"
                  icon={<MenuOutlined />}
                  onClick={() => setMobileNavOpen(true)}
                  aria-label="打开导航菜单"
                />
              ) : null}
              <Breadcrumb
                className="saas-breadcrumb"
                items={breadcrumbItems}
              />
            </div>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <button type="button" className="saas-user-trigger">
                <Avatar size={28} icon={<UserOutlined />} className="saas-user-avatar" />
                <Text className="saas-user-name">{session?.companyName ?? '企业用户'}</Text>
              </button>
            </Dropdown>
          </Header>
          <Content className="saas-content">
            <Suspense fallback={<PageLoading />}>
              {renderPage()}
            </Suspense>
          </Content>
        </Layout>

        <Drawer
          title={null}
          placement="left"
          width={280}
          open={isCompact && mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          destroyOnClose
          className="saas-nav-drawer"
          styles={{ body: { padding: 0 } }}
        >
          <SidebarNav
            page={page}
            openKeys={menuOpenKeys}
            onOpenChange={setMenuOpenKeys}
            onNavigate={handleNavigate}
          />
        </Drawer>
      </Layout>
    </ConfigProvider>
  );
}
