import { useEffect, useState } from "react";
import { Typography, Tag, Spin, Empty } from "antd";
import { StarOutlined, UserOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { fetchOnlineThemes } from "../api/client";
import type { Theme } from "../types";

const { Title } = Typography;

export function ThemeBoard() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  const loadThemes = async () => {
    try {
      setLoading(true);
      const response = await fetchOnlineThemes();
      setThemes(response.data);
    } catch (error) {
      console.error("加载主题失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThemes();
  }, []);

  if (loading) {
    return (
      <div className="theme-board-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (themes.length === 0) {
    return (
      <section className="work-panel">
        <Title level={3}>在营主题</Title>
        <Empty description="暂无上架主题" />
      </section>
    );
  }

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

  return (
    <section className="work-panel theme-board">
      <Title level={3}>在营主题</Title>
      <div className="theme-board-grid">
        {themes.map((theme) => (
          <article className="theme-card" key={theme.id}>
            <div className="theme-card-header">
              <strong className="theme-name">{theme.name}</strong>
              <Tag color="blue">{theme.type}</Tag>
            </div>
            <div className="theme-card-content">
              <div className="theme-info">
                <span className="info-label">难度</span>
                {renderDifficulty(theme.difficulty)}
              </div>
              <div className="theme-info">
                <span className="info-label">
                  <UserOutlined /> 人数
                </span>
                <span className="info-value">
                  {theme.minPlayers}-{theme.maxPlayers}人
                </span>
              </div>
              <div className="theme-info">
                <span className="info-label">
                  <ClockCircleOutlined /> 时长
                </span>
                <span className="info-value">{theme.duration}分钟</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
