import { useEffect, useState, useCallback, useRef } from "react";
import { Button, ConfigProvider, Layout, Typography, theme, Tabs, Badge } from "antd";
import { ApiOutlined, ReloadOutlined } from "@ant-design/icons";
import { fetchOverview } from "./api/client";
import { APP_CODE, APP_NAME, APP_THEME } from "./constants/app";
import { REQUEST_MESSAGES } from "./constants/messages";
import { createFallbackOverview } from "./state/dashboard";
import type { OverviewResponse } from "./types";
import { FeatureStrip } from "./components/FeatureStrip";
import { MetricGrid } from "./components/MetricGrid";
import { OperationsTable } from "./components/OperationsTable";
import { ThemeBoard } from "./components/ThemeBoard";
import { ThemeManagement } from "./components/ThemeManagement";

const { Header, Content } = Layout;
const { Title } = Typography;

export default function App() {
  const [overview, setOverview] = useState<OverviewResponse>(createFallbackOverview());
  const [notice, setNotice] = useState(REQUEST_MESSAGES.overviewFallback);
  const [activeTab, setActiveTab] = useState("overview");
  const [themeUpdateKey, setThemeUpdateKey] = useState(0);
  const themeBoardRef = useRef<{ loadThemes: () => void } | null>(null);

  const loadOverview = useCallback(() => {
    fetchOverview()
      .then((payload) => {
        setOverview(payload);
        setNotice("后端服务已联通，当前展示实时接口数据。");
      })
      .catch(() => setNotice(REQUEST_MESSAGES.overviewFallback));
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const handleThemesChange = useCallback(() => {
    setThemeUpdateKey((prev) => prev + 1);
  }, []);

  const handleRefresh = () => {
    loadOverview();
    setThemeUpdateKey((prev) => prev + 1);
  };

  const tabItems = [
    {
      key: "overview",
      label: (
        <span>
          运营看板
        </span>
      ),
    },
    {
      key: "themes",
      label: (
        <span>
          主题管理
        </span>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: APP_THEME.accent,
          colorText: APP_THEME.ink,
          colorBgBase: APP_THEME.paper,
          borderRadius: 8,
        },
      }}
    >
      <Layout className="app-shell">
        <Header className="topbar">
          <div className="brand-block">
            <span className="brand-code">{APP_CODE}</span>
            <h1 className="brand-title">{APP_NAME}</h1>
          </div>
          <div className="topbar-actions">
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              style={{ marginRight: 12 }}
            >
              刷新数据
            </Button>
            <Button type="primary" icon={<ApiOutlined />} href={REQUEST_MESSAGES.healthPath}>
              API Health
            </Button>
          </div>
        </Header>
        <Content className="workspace">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="main-tabs"
            size="large"
          />

          {activeTab === "overview" && (
            <>
              <section className="lead-grid">
                <article className="hero-panel">
                  <span className="pill">{notice}</span>
                  <Title level={2}>{overview.appName}</Title>
                  <p>{overview.description}</p>
                </article>
                <MetricGrid items={overview.kpis} />
              </section>
              <FeatureStrip items={overview.features} />
              <ThemeBoard key={themeUpdateKey} />
              <section className="work-panel">
                <Title level={3}>运营任务流</Title>
                <OperationsTable records={overview.records} />
              </section>
            </>
          )}

          {activeTab === "themes" && (
            <ThemeManagement onThemesChange={handleThemesChange} />
          )}
        </Content>
      </Layout>
    </ConfigProvider>
  );
}
