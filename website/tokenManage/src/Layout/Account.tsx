import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Card, Typography, Modal, Form, Input, Select, Tooltip } from 'antd';
import { useMessage } from '../utils/useMessage';
import { DeleteOutlined, PlusOutlined, EditOutlined, KeyOutlined } from '@ant-design/icons';
import {getAllList,getUserById,delUserById,createUser,UpdateUserById }from "../api/accounts"
import {getAllTokens} from "../api/token"
const { Title } = Typography;
const { Option } = Select;

interface TokenInfo {
  generateTime: number;
  key: string;
  modelname: string;
  status: number;
  time: number;
  token: string;
  text: string;
}

interface AccountData {
  id: number;
  username: string;
  account: string;
  password: string;
  status: number;
  apikeys: string;
  tokens: TokenInfo[];
  createTime: string;
}

export default function Account() {
  const [data, setData] = useState<AccountData[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTokenModalVisible, setIsTokenModalVisible] = useState(false);
  const [currentTokens, setCurrentTokens] = useState<TokenInfo[]>([]);
  const [editingRecord, setEditingRecord] = useState<AccountData | null>(null);
  const [tokenList, setTokenList] = useState<TokenInfo[]>([]);
  const [form] = Form.useForm();
  const { success, error } = useMessage();

  useEffect(() => {
    fetchData();
    fetchTokens();
  }, []);

  // 获取所有Token列表
  const fetchTokens = async () => {
    try {
      const result:any = await getAllTokens();
      setTokenList(result);
    } catch (err) {
      error('获取Token列表失败');
    }
  };

  // 获取所有用户列表
  const fetchData = async () => {
    try {
      const result:any = await getAllList();
      setData(result.data);
    } catch (err) {
      error('获取用户列表失败');
    }
  };

  const handleDelete = (record: AccountData) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 ${record.username} 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await delUserById(record.id);
          await fetchData();
          success('账户已删除');
        } catch (err) {
          error('删除失败');
        }
      }
    });
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = async (record: AccountData) => {
    try {
      const userDetail:any = await getUserById(record.id);
      setEditingRecord(userDetail.data);
      console.log(userDetail.data.apikeys );
      let apiKeysArray = [] as any
      if (typeof userDetail.data.apikeys === 'string') {
        apiKeysArray = userDetail.data.apikeys ?  userDetail.data.apikeys.split(',') : [];
      }else{
        apiKeysArray = userDetail.data.apikeys;
      }
      // 将apikeys字符串转换为数组
    
      form.setFieldsValue({
        ...userDetail.data,
        apikeys: apiKeysArray
      });
      setIsModalVisible(true);
    } catch (err) {
      console.log(err);
      
      error('获取用户详情失败');
    }
  };

  const showTokens = (tokens: TokenInfo[]) => {
    setCurrentTokens(tokens);
    setIsTokenModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      console.log(values);
      
      // 获取选中的token keys并拼接
      const selectedKeys = Array.isArray(values.apikeys) ? 
        values.apikeys.map((key: string) => {
          const token = tokenList.find(t => t.key === key);
          return token?.key;
        }).join(',') :
        values.apikeys;
      
      const submitData = {
        ...values,
        apikey: selectedKeys
      };

      if (editingRecord) {
        await UpdateUserById(editingRecord.id, submitData);
        success('账户更新成功');
      } else {
        await createUser(submitData);
        success('账户创建成功');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (err) {
      console.log(err);
      
      error(editingRecord ? '更新失败' : '创建失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      align: 'center' as const,
      fixed: 'left' as 'left'
    },
   
    {
      title: '用户名',
      dataIndex: 'account',
      key: 'account',
      width: 120
    },
    {
      title: '账号',
      dataIndex: 'username',
      key: 'username',
      fixed: 'left' as 'left',
      width: 120
    },
    {
      title: '密码',
      dataIndex: 'password',
      key: 'password',
      width: 100,
      render: () => '******'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? 'success' : 'error'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: 'Token Keys',
      dataIndex: 'apikeys',
      key: 'apikeys',
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      )
    },
    {
      title: 'Token',
      key: 'token',
      width: 120,
      render: (_: any, record: AccountData) => (
        <Button 
          type="link"
          icon={<KeyOutlined />}
          onClick={() => showTokens(record.tokens)}
        >
          查看Token
        </Button>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as 'right',
      width: 150,
      render: (_: any, record: AccountData) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <div style={{ flex: 1 }}>
          <Title level={4} style={{ margin: 0 }}>账户管理</Title>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          新建账户
        </Button>
      </div>

      <Card  style={{ borderRadius: '8px' }}>
      <Table 
          columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={false}
        bordered
        size="middle"
        style={{ 
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
          borderRadius: 8
        }}
        />
      </Card>

      <Modal
        title={editingRecord ? "编辑账户" : "新建账户"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="account"
            label="账号"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input placeholder="请输入账号" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: !editingRecord, message: '请输入密码' }]}
          >
            <Input.Password placeholder={editingRecord ? "不修改请留空" : "请输入密码"} />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            initialValue={1}
          >
            <Select>
              <Option value={1}>启用</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="apikeys"
            label="API Keys"
            rules={[{ required: true, message: '请选择API Keys' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择API Keys"
              optionLabelProp="label"
            >
              {tokenList.map(token => (
                <Option 
                  key={token.key} 
                  value={token.key}
                  label={`${token.modelname}${token.text ? ` (${token.text})` : ''}`}
                >
                  <div>
                    <div>{token.modelname}</div>
                    {token.text && <div style={{ fontSize: '12px', color: '#999' }}>{token.text}</div>}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Token 详情"
        open={isTokenModalVisible}
        onCancel={() => setIsTokenModalVisible(false)}
        footer={null}
        width={800}
        styles={{ body:{ maxHeight: '600px', overflow: 'auto'} }}
      >
        <Table
          dataSource={currentTokens}
          columns={[
            {
              title: '模型名称',
              dataIndex: 'modelname',
              key: 'modelname',
              width: 150,
              ellipsis:true,
              render: (text: string) => (
                <Tooltip title={text}>
                  <span style={{ cursor: 'pointer' }}>{text}</span>
                </Tooltip>
              ),
              fixed: 'left' as 'left'
            },
            {
              title: '生成时间',
              dataIndex: 'generateTime',
              key: 'generateTime',
              width: 180,
              
            },
            {
              title: '备注',
              dataIndex: 'text',
              key: 'text',
              width: 180,
              
            },
            {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
              width: 100,
              render: (status: number) => (
                <Tag color={status === 1 ? 'success' : 'error'}>
                  {status === 1 ? '启用' : '禁用'}
                </Tag>
              )
            },
            {
              title: 'Token',
              dataIndex: 'token',
              key: 'token',
              width: 300,
              ellipsis: true,
              render: (text: string) => (
                <Tooltip title={text}>
                  <span style={{ cursor: 'pointer' }}>{text}</span>
                </Tooltip>
              )
            }
          ]}
          rowKey="key"
          scroll={{ x: 800 }}
          pagination={false}
        />
      </Modal>
    </div>
  );
}
