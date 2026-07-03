import '../components/page.css';

import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Drawer,
  Empty,
  Form,
  Grid,
  Segmented,
  Select,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowRightOutlined,
  CloseCircleFilled,
  DownOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';

const { Paragraph, Text } = Typography;

function stopCardActivation(event: React.MouseEvent | React.KeyboardEvent) {
  event.stopPropagation();
}

function ModelNameCopyable({
  modelName,
  className,
  onActivateStop,
}: {
  modelName: string;
  className?: string;
  onActivateStop?: boolean;
}) {
  const wrapProps = onActivateStop
    ? {
        onClick: stopCardActivation,
        onKeyDown: stopCardActivation,
      }
    : {};

  return (
    <span className={`model-name-copyable${className ? ` ${className}` : ''}`} {...wrapProps}>
      <Text
        copyable={{
          text: modelName,
          tooltips: ['复制模型名称', '已复制'],
        }}
        ellipsis={{ tooltip: modelName }}
      >
        {modelName}
      </Text>
    </span>
  );
}

import { PageHeader } from '../components/PageHeader';
import {
  formatModelUpdatedDate,
  getBillingModeLabel,
  getCardPriceDisplay,
  getModelDetailMetaRows,
  getModelOfficialPriceRows,
  getModelTypeLabel,
  getOfficialPriceSectionTitle,
  getTierOfficialPriceSections,
  isTierPricingModel,
  matchesModelMarketFilters,
  MODEL_TYPE_OPTIONS,
  TOKEN_PRICE_UNIT_OPTIONS,
  type ModelMarketFilter,
  type TierOfficialPriceSection,
  type TokenPriceUnit,
} from '../components/modelOfficialPrice';
import {
  getModelVendorTypeLabel,
  mockModelVendorTypes,
  mockModels,
  type ModelPricingItem,
} from '../components/mockData';
import { getVendorAccentClass } from '../components/vendorAccent';
import { VendorLogo } from '../components/VendorLogo';

function VendorFilterOption({ value, label }: { value: string; label: React.ReactNode }) {
  return (
    <span className="marketplace-vendor-option">
      <VendorLogo vendorType={value as ModelPricingItem['vendorType']} size="sm" />
      <span>{label}</span>
    </span>
  );
}

function ModelDetailMetaGrid({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div className="model-drawer-meta-grid">
      {rows.map((row) => (
        <div className="model-drawer-meta-item" key={row.label}>
          <span className="model-drawer-meta-label">{row.label}</span>
          <span className="model-drawer-meta-value">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function ModelDetailPriceGrid({ rows }: { rows: { label: string; value: string; unit?: string }[] }) {
  return (
    <div className="model-drawer-price-grid">
      {rows.map((row) => (
        <div className="model-drawer-price-card" key={`${row.label}-${row.unit ?? ''}`}>
          <span className="model-drawer-price-label">{row.label}</span>
          <div className="model-drawer-price-value-row">
            <span className="model-drawer-price-value">{row.value}</span>
            {row.unit ? <span className="model-drawer-price-unit">{row.unit}</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function ModelDetailPriceHighlight({
  model,
  tokenUnit,
  section,
}: {
  model: ModelPricingItem;
  tokenUnit: TokenPriceUnit;
  section?: TierOfficialPriceSection;
}) {
  const display = getCardPriceDisplay(model, tokenUnit);

  if (display.mode === 'tier-count' && section) {
    return (
      <div className="model-drawer-price-highlight model-drawer-price-highlight--tier">
        <div className="model-drawer-price-highlight-item">
          <span className="model-drawer-price-highlight-label">每次价格</span>
          <span className="model-drawer-price-highlight-amount">{section.perCallValue ?? '—'}</span>
          <span className="model-drawer-price-highlight-unit">/ 次</span>
        </div>
      </div>
    );
  }

  if (display.mode === 'tier-token' && section) {
    return (
      <div className="model-drawer-price-highlight model-drawer-price-highlight--tier">
        <div className="model-drawer-price-highlight-item">
          <span className="model-drawer-price-highlight-label">输入</span>
          <span className="model-drawer-price-highlight-amount">{section.inputValue ?? '—'}</span>
        </div>
        <div className="model-drawer-price-highlight-divider" aria-hidden />
        <div className="model-drawer-price-highlight-item">
          <span className="model-drawer-price-highlight-label">输出</span>
          <span className="model-drawer-price-highlight-amount">{section.outputValue ?? '—'}</span>
        </div>
        <span className="model-drawer-price-highlight-unit">{section.unitLabel}</span>
      </div>
    );
  }

  if (display.mode === 'count') {
    return (
      <div className="model-drawer-price-highlight">
        <div className="model-drawer-price-highlight-item">
          <span className="model-drawer-price-highlight-label">每次价格</span>
          <span className="model-drawer-price-highlight-amount">{display.perCallValue}</span>
          <span className="model-drawer-price-highlight-unit">/ 次</span>
        </div>
      </div>
    );
  }

  return (
    <div className="model-drawer-price-highlight">
      <div className="model-drawer-price-highlight-item">
        <span className="model-drawer-price-highlight-label">{display.inputLabel}</span>
        <span className="model-drawer-price-highlight-amount">{display.inputValue}</span>
      </div>
      <div className="model-drawer-price-highlight-divider" aria-hidden />
      <div className="model-drawer-price-highlight-item">
        <span className="model-drawer-price-highlight-label">{display.outputLabel}</span>
        <span className="model-drawer-price-highlight-amount">{display.outputValue}</span>
      </div>
      <span className="model-drawer-price-highlight-unit">{display.unitLabel}</span>
    </div>
  );
}

function ModelDetailDrawer({
  model,
  open,
  onClose,
  tokenUnit,
  onTokenUnitChange,
}: {
  model: ModelPricingItem | null;
  open: boolean;
  onClose: () => void;
  tokenUnit: TokenPriceUnit;
  onTokenUnitChange: (unit: TokenPriceUnit) => void;
}) {
  const screens = Grid.useBreakpoint();
  const drawerWidth = screens.md ? 720 : '100%';

  if (!model) return null;

  const metaRows = getModelDetailMetaRows(model);
  const priceRows = getModelOfficialPriceRows(model, tokenUnit);
  const tierSections = getTierOfficialPriceSections(model, tokenUnit);
  const vendorClass = getVendorAccentClass(model.vendorType);
  const showTokenUnitSwitch = model.billingMode === 'token';
  const priceSectionTitle = getOfficialPriceSectionTitle(model.billingMode, tokenUnit);
  const remark = model.remark?.trim();
  const isTierPricing = tierSections.length > 0;

  return (
    <Drawer
      title={(
        <div className="model-drawer-title">
          <ModelNameCopyable modelName={model.modelName} className="model-drawer-title-name" />
          <span className="model-drawer-title-label">模型详情</span>
        </div>
      )}
      placement="right"
      width={drawerWidth}
      open={open}
      onClose={onClose}
      destroyOnClose
      className={`model-market-drawer ${vendorClass}`}
    >
      <div className="model-drawer-content">
        <section className="model-drawer-panel">
          <header className="model-drawer-panel-head">
            <h3 className="model-drawer-panel-title">基本信息</h3>
          </header>
          <div className="model-drawer-basic-tags">
            <VendorLogo vendorType={model.vendorType} size="lg" className="model-drawer-vendor-logo" />
            <Tag bordered={false} className={`model-vendor-tag ${vendorClass}`}>
              {getModelVendorTypeLabel(model.vendorType)}
            </Tag>
            <Tag bordered={false} className="model-meta-tag">
              {getModelTypeLabel(model.modelType)}
            </Tag>
          </div>
          {remark ? (
            <div className="model-drawer-intro-box">
              <span className="model-drawer-intro-label">模型简介</span>
              <Paragraph className="model-drawer-header-intro" ellipsis={{ rows: 3, expandable: true, symbol: '展开' }}>
                {remark}
              </Paragraph>
            </div>
          ) : null}
          <ModelDetailMetaGrid rows={metaRows} />
        </section>

        <section className="model-drawer-panel model-drawer-panel--price">
          <header className="model-drawer-panel-head model-drawer-panel-head--split">
            <div className="model-drawer-panel-head-main">
              <h3 className="model-drawer-panel-title">{priceSectionTitle}</h3>
              {isTierPricing ? (
                <Tag bordered={false} color="processing" className="model-drawer-tier-tag">
                  区间价格
                </Tag>
              ) : null}
            </div>
            {showTokenUnitSwitch ? (
              <Segmented
                size="small"
                className="model-price-unit-switch model-price-unit-switch--drawer"
                value={tokenUnit}
                onChange={(value) => onTokenUnitChange(value as TokenPriceUnit)}
                options={TOKEN_PRICE_UNIT_OPTIONS}
              />
            ) : null}
          </header>
          {isTierPricing ? (
            <p className="model-drawer-tier-intro">
              按输入 Token 区间分段计价；区间为 <strong>(下限, 上限]</strong>，单位为 k Tokens；未填上限时为 <strong>(下限, +∞)</strong>。
            </p>
          ) : null}
          {!isTierPricing ? (
            <ModelDetailPriceHighlight model={model} tokenUnit={tokenUnit} />
          ) : null}
          {isTierPricing ? (
            tierSections.length > 0 ? (
            <div className="model-drawer-tier-sections">
              {tierSections.map((section) => (
                <div className="model-drawer-tier-section" key={section.rangeLabel}>
                  <div className="model-drawer-tier-section-head">
                    <span className="model-drawer-tier-range-label">输入区间</span>
                    <span className="model-drawer-tier-range-value">{section.rangeLabel}</span>
                  </div>
                  <ModelDetailPriceHighlight model={model} tokenUnit={tokenUnit} section={section} />
                  {section.rows.length > 0 ? (
                    <ModelDetailPriceGrid rows={section.rows} />
                  ) : null}
                </div>
              ))}
            </div>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无区间价格配置" className="model-drawer-empty" />
            )
          ) : priceRows.length > 0 ? (
            <ModelDetailPriceGrid rows={priceRows} />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无官方价格" className="model-drawer-empty" />
          )}
        </section>
      </div>
    </Drawer>
  );
}

export default function ModelMarketplacePage() {
  const [form] = Form.useForm();
  const [drawerTokenUnit, setDrawerTokenUnit] = useState<TokenPriceUnit>('million');
  const [appliedFilter, setAppliedFilter] = useState<ModelMarketFilter>({});
  const [activeModel, setActiveModel] = useState<ModelPricingItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(false);

  const modelNameOptions = useMemo(
    () => [...new Set(mockModels.map((model) => model.modelName))]
      .sort((a, b) => a.localeCompare(b, 'zh-CN'))
      .map((name) => ({ value: name, label: name })),
    [],
  );

  const vendorOptions = useMemo(
    () => mockModelVendorTypes.map((item) => ({ value: item.value, label: item.label })),
    [],
  );

  const filtered = useMemo(
    () => mockModels.filter((model) => matchesModelMarketFilters(model, appliedFilter)),
    [appliedFilter],
  );

  const appliedFilterTags = useMemo(() => {
    const tags: { key: string; label: string }[] = [];

    appliedFilter.modelNames?.forEach((name) => {
      tags.push({ key: `name-${name}`, label: name });
    });

    appliedFilter.vendorTypes?.forEach((value) => {
      const label = vendorOptions.find((item) => item.value === value)?.label ?? value;
      tags.push({ key: `vendor-${value}`, label });
    });

    appliedFilter.modelTypes?.forEach((value) => {
      const label = MODEL_TYPE_OPTIONS.find((item) => item.value === value)?.label ?? value;
      tags.push({ key: `type-${value}`, label });
    });

    return tags;
  }, [appliedFilter, vendorOptions]);

  const activeFilterCount = appliedFilterTags.length;

  const handleSearch = () => {
    const values = form.getFieldsValue();
    setAppliedFilter({
      modelNames: values.modelNames?.length ? values.modelNames : undefined,
      vendorTypes: values.vendorTypes?.length ? values.vendorTypes : undefined,
      modelTypes: values.modelTypes?.length ? values.modelTypes : undefined,
    });
    setFilterExpanded(false);
  };

  const handleReset = () => {
    form.resetFields();
    setAppliedFilter({});
  };

  const openDetail = (model: ModelPricingItem) => {
    setActiveModel(model);
    setDrawerOpen(true);
  };

  return (
    <div className="saas-page model-market-page">
      <PageHeader
        title="模型广场"
        description="浏览已接入模型，按条件筛选后点击卡片查看完整官方价格。"
      />

      <Card bordered={false} className="page-card marketplace-toolbar">
        <div className="marketplace-toolbar-row marketplace-toolbar-row--primary">
          <div className="marketplace-toolbar-leading">
            <button
              type="button"
              className={`marketplace-filter-trigger${filterExpanded ? ' is-expanded' : ''}${activeFilterCount > 0 ? ' has-filters' : ''}`}
              onClick={() => setFilterExpanded((prev) => !prev)}
              aria-expanded={filterExpanded}
            >
              <span className="marketplace-filter-trigger-icon" aria-hidden>
                <FilterOutlined />
              </span>
              <span className="marketplace-filter-trigger-label">筛选</span>
              {activeFilterCount > 0 ? (
                <Badge
                  count={activeFilterCount}
                  size="small"
                  className="marketplace-filter-trigger-badge"
                />
              ) : null}
              <DownOutlined className="marketplace-filter-trigger-chevron" aria-hidden />
            </button>

            {!filterExpanded && activeFilterCount > 0 ? (
              <div className="marketplace-filter-summary">
                <span className="marketplace-filter-summary-label">已选</span>
                <div className="marketplace-filter-summary-tags">
                  {appliedFilterTags.map((tag) => (
                    <Tag key={tag.key} bordered={false} className="marketplace-filter-summary-tag">
                      {tag.label}
                    </Tag>
                  ))}
                </div>
                <Button
                  type="link"
                  size="small"
                  className="marketplace-filter-summary-clear"
                  icon={<CloseCircleFilled />}
                  onClick={handleReset}
                >
                  清除
                </Button>
              </div>
            ) : null}
          </div>

          <div className="marketplace-toolbar-actions">
            <span className="marketplace-count">{filtered.length} 个模型</span>
          </div>
        </div>

        <div
          className={`marketplace-filter-panel${filterExpanded ? ' is-expanded' : ''}`}
          aria-hidden={!filterExpanded}
        >
          <div className="marketplace-filter-panel-inner">
            <div className="marketplace-filter-surface">
              <p className="marketplace-filter-hint">
                <InfoCircleOutlined className="marketplace-filter-hint-icon" aria-hidden />
                <span>各条件支持多选；未选择表示不限制，多条件之间为且关系。</span>
              </p>
              <Form form={form} layout="vertical" className="marketplace-filter-form">
                <div className="marketplace-filter-grid">
                  <Form.Item name="modelNames" label="模型名称" className="marketplace-filter-field">
                    <Select
                      mode="multiple"
                      allowClear
                      placeholder="请选择模型名称"
                      options={modelNameOptions}
                      maxTagCount="responsive"
                    />
                  </Form.Item>
                  <Form.Item name="vendorTypes" label="模型厂商" className="marketplace-filter-field">
                    <Select
                      mode="multiple"
                      allowClear
                      placeholder="请选择模型厂商"
                      options={vendorOptions}
                      maxTagCount="responsive"
                      optionRender={(option) => (
                        <VendorFilterOption value={String(option.value ?? '')} label={option.label} />
                      )}
                    />
                  </Form.Item>
                  <Form.Item name="modelTypes" label="模型类型" className="marketplace-filter-field">
                    <Select
                      mode="multiple"
                      allowClear
                      placeholder="请选择模型类型"
                      options={MODEL_TYPE_OPTIONS}
                      maxTagCount="responsive"
                    />
                  </Form.Item>
                </div>
                <div className="marketplace-filter-footer">
                  <span className="marketplace-filter-footer-tip">
                    {activeFilterCount > 0
                      ? `当前已生效 ${activeFilterCount} 项条件`
                      : '设置条件后点击查询应用筛选'}
                  </span>
                  <div className="marketplace-filter-footer-actions">
                    <Button icon={<ReloadOutlined />} onClick={handleReset}>
                      重置
                    </Button>
                    <Button
                      type="link"
                      className="marketplace-filter-footer-collapse"
                      onClick={() => setFilterExpanded(false)}
                    >
                      收起
                    </Button>
                    <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                      查询
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card bordered={false} className="page-card marketplace-empty">
          <Empty description="未找到匹配的模型" />
        </Card>
      ) : (
        <div className="model-market-grid">
          {filtered.map((model) => {
            const vendorClass = getVendorAccentClass(model.vendorType);
            const tierPricing = isTierPricingModel(model);
            return (
              <article
                key={model.id}
                className={`model-market-card ${vendorClass}`}
                onClick={() => openDetail(model)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openDetail(model);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`查看 ${model.modelName} 详情`}
              >
                <div className="model-market-card-accent" aria-hidden />

                <div className="model-market-card-body">
                  <div className="model-market-card-top">
                    <div className={`model-market-card-icon ${vendorClass}`}>
                      <VendorLogo vendorType={model.vendorType} size="md" />
                    </div>
                    <div className="model-market-card-heading">
                      <ModelNameCopyable
                        modelName={model.modelName}
                        className="model-market-card-name-row"
                        onActivateStop
                      />
                      <div className="model-market-card-meta">
                        <span className={`model-market-card-vendor ${vendorClass}`}>
                          {getModelVendorTypeLabel(model.vendorType)}
                        </span>
                        <span className="model-market-card-meta-sep" aria-hidden>·</span>
                        <span className="model-market-card-meta-text">
                          {getModelTypeLabel(model.modelType)}
                        </span>
                        <span className="model-market-card-meta-sep" aria-hidden>·</span>
                        <span className="model-market-card-meta-text">
                          {getBillingModeLabel(model.billingMode)}
                        </span>
                        {tierPricing ? (
                          <>
                            <span className="model-market-card-meta-sep" aria-hidden>·</span>
                            <Tag bordered={false} className="model-market-card-tier-tag">
                              区间价
                            </Tag>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {model.remark?.trim() ? (
                    <div className="model-market-card-intro-wrap">
                      <Paragraph type="secondary" className="model-market-card-intro" ellipsis={{ rows: 2 }}>
                        {model.remark.trim()}
                      </Paragraph>
                    </div>
                  ) : (
                    <div className="model-market-card-intro-spacer" aria-hidden />
                  )}
                </div>

                <footer className="model-market-card-footer">
                  <span className="model-market-card-updated">
                    更新 {formatModelUpdatedDate(model.updatedAt)}
                  </span>
                  <span className="model-market-card-link">
                    查看详情
                    <ArrowRightOutlined />
                  </span>
                </footer>
              </article>
            );
          })}
        </div>
      )}

      <ModelDetailDrawer
        model={activeModel}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        tokenUnit={drawerTokenUnit}
        onTokenUnitChange={setDrawerTokenUnit}
      />
    </div>
  );
}
