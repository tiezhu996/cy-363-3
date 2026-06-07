export interface Theme {
  id: number;
  name: string;
  type: string;
  difficulty: number;
  minPlayers: number;
  maxPlayers: number;
  duration: number;
  status: "online" | "offline";
  createdAt: string;
  updatedAt: string;
}

export const themeTypes = ["恐怖", "悬疑", "科幻", "解谜", "情感", "古风", "机械"];

export const initialThemes: Theme[] = [
  {
    id: 1,
    name: "午夜图书馆",
    type: "悬疑",
    difficulty: 4,
    minPlayers: 2,
    maxPlayers: 6,
    duration: 90,
    status: "online",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    name: "星际迷航",
    type: "科幻",
    difficulty: 3,
    minPlayers: 3,
    maxPlayers: 8,
    duration: 120,
    status: "online",
    createdAt: "2024-02-20T14:30:00Z",
    updatedAt: "2024-03-10T09:15:00Z",
  },
  {
    id: 3,
    name: "古宅惊魂",
    type: "恐怖",
    difficulty: 5,
    minPlayers: 4,
    maxPlayers: 6,
    duration: 100,
    status: "online",
    createdAt: "2024-03-01T08:00:00Z",
    updatedAt: "2024-03-01T08:00:00Z",
  },
  {
    id: 4,
    name: "时光倒流",
    type: "解谜",
    difficulty: 2,
    minPlayers: 2,
    maxPlayers: 4,
    duration: 60,
    status: "offline",
    createdAt: "2024-01-10T12:00:00Z",
    updatedAt: "2024-02-28T16:45:00Z",
  },
];
