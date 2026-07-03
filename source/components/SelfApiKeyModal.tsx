import './page.css';

import React, { useEffect } from 'react';
import { Form, Input, Modal, Select } from 'antd';

import { API_KEY_SOURCE_LABELS, getSelfKeyModelNames, type ApiKeyRow } from './mockData';
import type { SelfApiKeyFormPayload } from './services';

const DEFAULT_OPENAI_V1_BASE = 'https://api.openai.com/v1';

type SelfApiKeyFormValues = SelfApiKeyFormPayload;

export function SelfApiKeyModal({
  open,
  mode,
  editingRecord,
  confirming,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  editingRecord?: ApiKeyRow | null;
  confirming: boolean;
  onCancel: () => void;
  onSubmit: (payload: SelfApiKeyFormPayload, editingId?: string) => Promise<void>;
}) {
  const [form] = Form.useForm<SelfApiKeyFormValues>();
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!open) {
      form.resetFields();
      return;
    }
    if (isEdit && editingRecord) {
      form.setFieldsValue({
        name: editingRecord.name,
        apiBaseUrl: editingRecord.apiBaseUrl || DEFAULT_OPENAI_V1_BASE,
        key: editingRecord.key,
        modelNames: getSelfKeyModelNames(editingRecord),
        remark: editingRecord.remark || '',
      });
      return;
    }
    form.setFieldsValue({
      apiBaseUrl: DEFAULT_OPENAI_V1_BASE,
      modelNames: [],
    });
  }, [editingRecord, form, isEdit, open]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const modelNames = values.modelNames
      .map((name) => name.trim())
      .filter(Boolean);
    await onSubmit({ ...values, modelNames }, isEdit ? editingRecord?.id : undefined);
    if (!isEdit) form.resetFields();
  };

  return (
    <Modal
      title={isEdit ? '编辑自建密钥' : '自建密钥'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirming}
      okText={isEdit ? '保存' : '创建'}
      cancelText="取消"
      width={520}
      destroyOnClose
      className="self-api-key-modal"
    >
      <Form form={form} layout="vertical" className="axhub-required-form">
        <Form.Item
          name="name"
          label="密钥名称"
          rules={[{ required: true, message: '请输入密钥名称' }]}
        >
          <Input placeholder="例如：第三方 OpenAI 代理" maxLength={64} />
        </Form.Item>
        <Form.Item label="密钥来源">
          <Input value={API_KEY_SOURCE_LABELS.self} disabled />
        </Form.Item>
        <Form.Item
          name="apiBaseUrl"
          label="API 地址"
          extra="支持 OpenAI v1 协议，需包含 /v1 路径"
          rules={[
            { required: true, message: '请输入 API 地址' },
            { type: 'url', message: '请输入有效的 URL' },
          ]}
        >
          <Input placeholder={DEFAULT_OPENAI_V1_BASE} />
        </Form.Item>
        <Form.Item
          name="key"
          label="API Key"
          rules={[{ required: true, message: '请输入 API Key' }]}
        >
          <Input.Password placeholder="sk-..." visibilityToggle />
        </Form.Item>
        <Form.Item
          name="modelNames"
          label="模型名称"
          extra="支持自定义输入，输入后按回车添加，可添加多个"
          rules={[
            { required: true, message: '请至少添加一个模型名称' },
            {
              validator: (_, value: string[] | undefined) => {
                const names = (value ?? []).map((name) => name.trim()).filter(Boolean);
                if (!names.length) {
                  return Promise.reject(new Error('请至少添加一个模型名称'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Select
            mode="tags"
            className="self-api-key-model-select"
            placeholder="例如：gpt-4o-mini，回车确认"
            tokenSeparators={[',', '，', ';', '；']}
            maxTagCount="responsive"
            open={false}
          />
        </Form.Item>
        <Form.Item name="remark" label="描述">
          <Input.TextArea placeholder="选填，说明该密钥用途" rows={3} maxLength={200} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
}
