export default function HomeIndex() {
  return (
    <div className="home-index">
      {/* 欢迎区域 */}
      <div className="welcome-section">
        <h1>龙诚AIToken管理系统</h1>
        <p className="subtitle">专业、安全、高效的Token管理解决方案</p>
      </div>

      {/* 系统特点 */}
      <div className="features-section">
        <h2>为什么选择我们</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>安全可靠</h3>
            <p>采用军工级加密技术，多重安全防护，确保Token绝对安全</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>高效便捷</h3>
            <p>智能化界面设计，一键式操作，让Token管理更轻松</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>精准权限</h3>
            <p>多层级权限管理，支持团队协作，保障数据安全</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>智能监控</h3>
            <p>全方位数据监控，异常智能预警，使用分析一目了然</p>
          </div>
        </div>
      </div>

      {/* Token 管理介绍 */}
      <div className="management-section">
        <div className="management-card token-management">
          <div className="card-content">
            <h2>Token 智能管理</h2>
            <ul className="feature-list">
              <li>✓ 支持多平台API Key管理</li>
              <li>✓ 自动化Token生成与更新</li>
              <li>✓ 安全加密存储机制</li>
              <li>✓ 灵活的配置选项</li>
            </ul>
          </div>
        </div>

        <div className="management-card account-management">
          <div className="card-content">
            <h2>Account 账户管理</h2>
            <ul className="feature-list">
              <li>✓ 多模型支持与切换</li>
              <li>✓ 实时对话功能</li>
              <li>✓ 个性化设置</li>
              <li>✓ 使用数据分析</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 使用流程 */}
      <div className="workflow-section">
        <h2>快速开始</h2>
        <div className="workflow-steps">
          <div className="workflow-step">
            <div className="step-icon">1</div>
            <h3>注册登录</h3>
            <p>简单注册，即刻开启智能管理之旅</p>
          </div>
          <div className="workflow-step">
            <div className="step-icon">2</div>
            <h3>配置Token</h3>
            <p>轻松导入或创建新的Token</p>
          </div>
          <div className="workflow-step">
            <div className="step-icon">3</div>
            <h3>权限设置</h3>
            <p>灵活配置访问权限与使用规则</p>
          </div>
          <div className="workflow-step">
            <div className="step-icon">4</div>
            <h3>开始使用</h3>
            <p>享受专业的Token管理服务</p>
          </div>
        </div>
      </div>

      {/* 样式 */}
      <style>{`
        .home-index {
          padding: 40px 20px;
          max-width: 1200px;
          margin: 0 auto;
          background: #ffffff;
        }

        .welcome-section {
          text-align: center;
          margin-bottom: 60px;
          padding: 40px 0;
        }

        .welcome-section h1 {
          font-size: 3em;
          color: #1890ff;
          margin-bottom: 20px;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }

        .subtitle {
          font-size: 1.4em;
          color: #666;
        }

        .features-section,
        .management-section,
        .workflow-section {
          margin-bottom: 80px;
        }

        h2 {
          text-align: center;
          color: #333;
          font-size: 2.2em;
          margin-bottom: 40px;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
          padding: 20px;
        }

        .feature-card {
          padding: 30px;
          border-radius: 15px;
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          text-align: center;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }

        .feature-icon {
          font-size: 2.5em;
          margin-bottom: 20px;
        }

        .feature-card h3 {
          color: #1890ff;
          margin-bottom: 15px;
          font-size: 1.4em;
        }

        .management-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin: 40px 0;
        }

        .management-card {
          background: #f8f9fa;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
        }

        .management-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 20px 0;
        }

        .feature-list li {
          margin: 15px 0;
          color: #666;
          font-size: 1.1em;
        }

        .workflow-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
          padding: 20px;
        }

        .workflow-step {
          text-align: center;
          padding: 30px;
          background: #ffffff;
          border-radius: 15px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
        }

        .workflow-step:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }

        .step-icon {
          width: 60px;
          height: 60px;
          line-height: 60px;
          border-radius: 50%;
          background: #1890ff;
          color: white;
          font-size: 1.5em;
          margin: 0 auto 20px;
          font-weight: bold;
        }

        .workflow-step h3 {
          color: #1890ff;
          margin-bottom: 15px;
          font-size: 1.3em;
        }

        @media (max-width: 768px) {
          .welcome-section h1 {
            font-size: 2.2em;
          }
          
          .subtitle {
            font-size: 1.2em;
          }
          
          .feature-grid,
          .management-section,
          .workflow-steps {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
