import { useEffect, useState, useCallback, useRef } from "react";
import {
  Typography,
  Table,
  Button,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Modal,
  Space,
  Tag,
  message,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SaveOutlined,
  StarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  fetchThemes,
  fetchThemeTypes,
  createTheme,
  updateTheme,
  toggleThemeStatus,
  deleteTheme,
} from "../api/client";
import type { Theme, ThemeUpdateInput } from "../types";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface FormValues {
  name: string;
  type: string;
  difficulty: number;
  minPlayers: number;
  maxPlayers: number;
  duration: number;
}

interface EditableCellProps {
  editing: boolean;
  dataIndex: string;
  title: string;
  inputType: "text" | "select" | "number";
  record: Theme;
  index: number;
  children: React.ReactNode;
  themeTypes: string[];
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  themeTypes,
  ...restProps
}) => {
  const inputNode =
    inputType === "select" ? (
      <Select style={{ width: "100%" }}>
        {themeTypes.map((type) => (
          <Option key={type} value={type}>
            {type}
          </Option>
        ))}
      </Select>
    ) : inputType === "number" ? (
      <InputNumber min={dataIndex === "difficulty" ? 1 : dataIndex === "duration" ? 30 : 1} max={dataIndex === "difficulty" ? 5 : undefined} style={{ width: "100%" }} />
    ) : (
      <Input />
    );

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `请输入${title}`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export function ThemeManagement({ onThemesChange }: { onThemesChange?: () => void }) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [themeTypes, setThemeTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [savingKey, setSavingKey] = useState<number | null>(null);
  const [form] = Form.useForm<FormValues>();
  const [editForm] = Form.useForm<ThemeUpdateInput>();
  const saveTimeoutRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const isEditing = (record: Theme) => record.id === editingKey;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [themesRes, typesRes] = await Promise.all([
        fetchThemes(),
        fetchThemeTypes(),
      ]);
      setThemes(themesRes.data);
      setThemeTypes(typesRes.data);
    } catch (error) {
      console.error("加载数据失败:", error);
      message.error("加载数据失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const notifyChange = useCallback(() => {
    if (onThemesChange) {
      onThemesChange();
    }
  }, [onThemesChange]);

  const debouncedSave = useCallback(
    (id: number, field: string, value: any) => {
      if (saveTimeoutRef.current[id]) {
        clearTimeout(saveTimeoutRef.current[id]);
      }

      setSavingKey(id);
      saveTimeoutRef.current[id] = setTimeout(async () => {
        try {
          await updateTheme(id, { [field]: value });
          message.success("自动保存成功");
          await loadData();
          notifyChange();
        } catch (error) {
          message.error(error instanceof Error ? error.message : "保存失败");
          await loadData();
        } finally {
          setSavingKey(null);
        }
      }, 800);
    },
    [loadData, notifyChange],
  );

  useEffect(() => {
    return () => {
      Object.values(saveTimeoutRef.current).forEach(clearTimeout);
    };
  }, []);

  const handleCreate = async (values: FormValues) => {
    try {
      await createTheme(values);
      message.success("主题创建成功");
      setModalVisible(false);
      form.resetFields();
      await loadData();
      notifyChange();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "创建失败");
    }
  };

  const edit = (record: Theme) => {
    setEditingKey(record.id);
    editForm.setFieldsValue({
      name: record.name,
      type: record.type,
      difficulty: record.difficulty,
      minPlayers: record.minPlayers,
      maxPlayers: record.maxPlayers,
      duration: record.duration,
    });
  };

  const save = async (id: number) => {
    try {
      const values = await editForm.validateFields();
      if (values.minPlayers && values.maxPlayers && values.minPlayers > values.maxPlayers) {
        message.error("最少人数不能大于最多人数");
        return;
      }
      setSavingKey(id);
      await updateTheme(id, values);
      message.success("保存成功");
      setEditingKey(null);
      await loadData();
      notifyChange();
    } catch (error) {
      if (error instanceof Error && error.name !== "ValidateError") {
        message.error("保存失败");
      }
    } finally {
      setSavingKey(null);
    }
  };

  const cancel = () => {
    setEditingKey(null);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await toggleThemeStatus(id);
      message.success(res.message);
      await loadData();
      notifyChange();
    } catch (error) {
      message.error("操作失败");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTheme(id);
      message.success("删除成功");
      await loadData();
      notifyChange();
    } catch (error) {
      message.error("删除失败");
    }
  };

  const handleInlineToggle = async (id: number, checked: boolean) => {
    try {
      await updateTheme(id, { status: checked ? "online" : "offline" });
      message.success(checked ? "主题已上架" : "主题已下架");
      await loadData();
      notifyChange();
    } catch (error) {
      message.error("操作失败");
      await loadData();
    }
  };

  const renderDifficulty = (level: number) => {
    return (
      <span className="difficulty-stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarOutlined
            key={i}
            style={{ color: i < level ? "#faad14" : "#d9d9d9" }}
          />
        ))}
      </span>
    );
  };

  const columns = [
    {
      title: "主题名称",
      dataIndex: "name",
      key: "name",
      width: 180,
      editable: true,
      render: (text: string, record: Theme) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="name"
            style={{ margin: 0 }}
            rules={[{ required: true, message: "请输入主题名称" }]}
          >
            <Input />
          </Form.Item>
        ) : (
          <strong>{text}</strong>
        );
      },
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 120,
      editable: true,
      render: (text: string, record: Theme) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="type"
            style={{ margin: 0 }}
            rules={[{ required: true, message: "请选择类型" }]}
          >
            <Select>
              {themeTypes.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <Tag color="blue">{text}</Tag>
        );
      },
    },
    {
      title: "难度",
      dataIndex: "difficulty",
      key: "difficulty",
      width: 140,
      editable: true,
      render: (text: number, record: Theme) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="difficulty"
            style={{ margin: 0 }}
            rules={[{ required: true, message: "请选择难度" }]}
          >
            <InputNumber min={1} max={5} style={{ width: "100%" }} />
          </Form.Item>
        ) : (
          renderDifficulty(text)
        );
      },
    },
    {
      title: "建议人数",
      dataIndex: "players",
      key: "players",
      width: 120,
      render: (_: any, record: Theme) => {
        const editable = isEditing(record);
        return editable ? (
          <Space.Compact style={{ width: "100%" }}>
            <Form.Item
              name="minPlayers"
              style={{ margin: 0 }}
              rules={[{ required: true, message: "请输入最少人数" }]}
            >
              <InputNumber min={1} style={{ width: "50%" }} />
            </Form.Item>
            <Form.Item
              name="maxPlayers"
              style={{ margin: 0 }}
              rules={[{ required: true, message: "请输入最多人数" }]}
            >
              <InputNumber min={1} style={{ width: "50%" }} />
            </Form.Item>
          </Space.Compact>
        ) : (
          <span>
            {record.minPlayers}-{record.maxPlayers}人
          </span>
        );
      },
    },
    {
      title: "时长(分钟)",
      dataIndex: "duration",
      key: "duration",
      width: 130,
      editable: true,
      render: (text: number, record: Theme) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="duration"
            style={{ margin: 0 }}
            rules={[{ required: true, message: "请输入时长" }]}
          >
            <InputNumber min={30} style={{ width: "100%" }} />
          </Form.Item>
        ) : (
          <span>{text}分钟</span>
        );
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) =>
        status === "online" ? (
          <Tag icon={<CheckCircleOutlined />} color="green">
            已上架
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="default">
            已下架
          </Tag>
        ),
    },
    {
      title: "上下架",
      dataIndex: "toggle",
      key: "toggle",
      width: 100,
      render: (_: any, record: Theme) => (
        <Tooltip title={record.status === "online" ? "点击下架" : "点击上架"}>
          <Switch
            checked={record.status === "online"}
            checkedChildren={<ArrowUpOutlined />}
            unCheckedChildren={<ArrowDownOutlined />}
            onChange={(checked) => handleInlineToggle(record.id, checked)}
            disabled={editingKey !== null && editingKey !== record.id}
          />
        </Tooltip>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 180,
      render: (_: any, record: Theme) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<SaveOutlined />}
              onClick={() => save(record.id)}
              loading={savingKey === record.id}
            >
              保存
            </Button>
            <Button size="small" onClick={cancel} disabled={savingKey === record.id}>
              取消
            </Button>
          </Space>
        ) : (
          <Space>
            <Tooltip title="编辑">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => edit(record)}
                disabled={editingKey !== null}
              />
            </Tooltip>
            <Tooltip title={record.status === "online" ? "下架" : "上架"}>
              <Button
                type="link"
                size="small"
                icon={
                  record.status === "online" ? (
                    <ArrowDownOutlined />
                  ) : (
                    <ArrowUpOutlined />
                  )
                }
                onClick={() => handleToggleStatus(record.id)}
                disabled={editingKey !== null}
              />
            </Tooltip>
            <Popconfirm
              title="确定要删除这个主题吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
              disabled={editingKey !== null}
            >
              <Tooltip title="删除">
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={editingKey !== null}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Theme) => ({
        record,
        inputType: col.dataIndex === "type" ? "select" : col.dataIndex === "difficulty" || col.dataIndex === "duration" ? "number" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        themeTypes,
      }),
    };
  });

  return (
    <section className="work-panel theme-management">
      <div className="section-header">
        <Title level={3} style={{ margin: 0 }}>
          主题管理
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          新增主题
        </Button>
      </div>

      <Form form={editForm} component={false}>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={themes}
          columns={mergedColumns}
          components={{
            body: {
              cell: EditableCell as any,
            },
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1100 }}
        />
      </Form>

      <Modal
        title="新增主题"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{
            difficulty: 3,
            minPlayers: 2,
            maxPlayers: 6,
            duration: 90,
          }}
        >
          <Form.Item
            name="name"
            label="主题名称"
            rules={[{ required: true, message: "请输入主题名称" }]}
          >
            <Input placeholder="请输入主题名称" maxLength={50} />
          </Form.Item>

          <Form.Item
            name="type"
            label="主题类型"
            rules={[{ required: true, message: "请选择主题类型" }]}
          >
            <Select placeholder="请选择主题类型">
              {themeTypes.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="difficulty"
            label="难度等级"
            rules={[{ required: true, message: "请选择难度等级" }]}
          >
            <InputNumber min={1} max={5} style={{ width: "100%" }} placeholder="1-5星" />
          </Form.Item>

          <div className="form-row">
            <Form.Item
              name="minPlayers"
              label="最少人数"
              style={{ flex: 1, marginRight: 12 }}
              rules={[{ required: true, message: "请输入最少人数" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} placeholder="最少人数" />
            </Form.Item>
            <Form.Item
              name="maxPlayers"
              label="最多人数"
              style={{ flex: 1 }}
              rules={[{ required: true, message: "请输入最多人数" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} placeholder="最多人数" />
            </Form.Item>
          </div>

          <Form.Item
            name="duration"
            label="游戏时长(分钟)"
            rules={[{ required: true, message: "请输入游戏时长" }]}
          >
            <InputNumber min={30} style={{ width: "100%" }} placeholder="最少30分钟" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
