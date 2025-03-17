/*
 * @Date: 2025-03-11 10:35:17
 * @LastEditors: shaolong sl3037302304@gmail.com
 * @LastEditTime: 2025-03-11 13:45:09
 * @FilePath: /tokenManage/src/Layout/Token.tsx
 * @Description: from shaolong
 */
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Card,
  Typography,
  Tooltip,
  Modal,
  Form,
  Input,
  Select,
} from "antd";
import { useMessage } from "../utils/useMessage";
import {
  CheckCircleOutlined,
  StopOutlined,
  KeyOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { getAllTokens, addNewToken, setTokenStatus } from "../api/token";
const { Title } = Typography;
interface TokenData {
  id: number;
  modelname: string;
  key: string;
  status: number;
  time: number;
  generateTime: string;
  text: string;
}

const getToken = async () => {
  const result = await getAllTokens();
  return result;
};

export default function Token() {
  const [data, setData] = useState<TokenData[]>([]);
  useEffect(() => {
    getToken().then((res: any) => {
      setData(res);
    });
  }, []);
  const CopyVal = (item: string) => {
    navigator.clipboard
      .writeText(item)
      .then(() => {
        success("复制成功");
      })
      .catch(() => {
        error("复制失败");
      });
  };
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { success, error } = useMessage();

  const handleStatusChange = async (record: TokenData, newStatus: number) => {
    const result: any = await setTokenStatus({
      key: record.key,
      val: newStatus,
    });
    if (result.success) {
      const list = await getAllTokens();
      setData(list as any);
    }

    success(`Token ${newStatus === 1 ? "已启用" : "已禁用"}`);
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      const result: any = await addNewToken(values);

      if (result.token) {
        setIsModalVisible(false);
        form.resetFields();
        success("添加成功");
        const list = await getAllTokens();
        setData(list as any);
      } else {
        error("添加失败");
      }
    } catch (error) {
      setIsModalVisible(false);
      form.resetFields();
      console.error("验证失败:", error);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 30,
      align: "center" as const,
    },
    {
      title: "模型名称",
      dataIndex: "modelname",
      key: "modelname",
      width: 100,
      // ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
      width: 200,
      render: (text: string) => (
        <Tooltip title="点击复制">
          <span
            style={{
              background: "#f5f5f5",
              padding: "4px 8px",
              borderRadius: 4,
              fontSize: "12px",
              fontFamily: "monospace",
              cursor: "pointer",
            }}
            onClick={() => CopyVal(text)}
          >
            {text}
          </span>
        </Tooltip>
      ),
    },

    {
      title: "使用次数",
      dataIndex: "time",
      key: "time",
      width: 100,
      align: "center" as const,
    },
    {
      title: "创建时间",
      dataIndex: "generateTime",
      key: "generateTime",
      width: 160,
      align: "center" as const,
    },
    {
      title: "备注",
      dataIndex: "text",
      key: "text",
      width: 150,
    },
    {
      title: "状态",
      key: "status",
      width: 100,
      align: "center" as const,
      render: (_: any, record: TokenData) => (
        <Tag
          color={record.status === 1 ? "success" : "error"}
          style={{ minWidth: 60, textAlign: "center" }}
        >
          {record.status === 1 ? (
            <>
              <CheckCircleOutlined /> 已启用
            </>
          ) : (
            <>
              <StopOutlined /> 已禁用
            </>
          )}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      align: "center" as const,
      render: (_: any, record: TokenData) => (
        <Space size="small">
          {record.status === 0 ? (
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusChange(record, 1)}
            >
              启用
            </Button>
          ) : (
            <Button
              type="link"
              danger
              size="small"
              icon={<StopOutlined />}
              onClick={() => handleStatusChange(record, 0)}
            >
              禁用
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card bordered={false}>
      <Space
        style={{
          marginBottom: 24,
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Title level={4}>
          <KeyOutlined style={{ marginRight: 8 }} />
          Token 管理
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          新增 Token
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={false}
        bordered
        size="middle"
        style={{
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
          borderRadius: 8,
        }}
      />

      <Modal
        title="新增 Token"
        open={isModalVisible}
        onOk={handleAdd}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="model_name"
            label="模型 ID"
            rules={[{ required: true, message: "请输入模型 ID" }]}
          >
            <Input placeholder="请输入模型 ID" />
          </Form.Item>
          <Form.Item
            name="api_key"
            label="API Key"
            rules={[{ required: true, message: "请输入API Key" }]}
          >
            <Input placeholder="请输入API Key" />
          </Form.Item>
          <Form.Item
            name="supplier"
            label="供应商"
            rules={[{ required: true, message: "请选择供应商" }]}
          >
            <Select placeholder="请选择供应商">
              <Select.Option value="alv1">阿里云</Select.Option>
              <Select.Option value="hsv3">火山</Select.Option>
              <Select.Option value="bianxie">便携api</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="text"
            label="备注"
            rules={[{ required: true, message: "请输入备注" }]}
          >
            <Input.TextArea placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
