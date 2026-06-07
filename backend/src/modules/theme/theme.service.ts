import { initialThemes, type Theme } from "./theme.data";

type ThemeCreateInput = Omit<Theme, "id" | "createdAt" | "updatedAt" | "status">;
type ThemeUpdateInput = Partial<Omit<Theme, "id" | "createdAt" | "updatedAt">>;

export class ThemeService {
  private themes: Theme[];
  private nextId: number;

  constructor() {
    this.themes = [...initialThemes];
    this.nextId = Math.max(...initialThemes.map((t) => t.id), 0) + 1;
  }

  getAllThemes(): Theme[] {
    return [...this.themes];
  }

  getOnlineThemes(): Theme[] {
    return this.themes.filter((t) => t.status === "online");
  }

  getThemeById(id: number): Theme | undefined {
    return this.themes.find((t) => t.id === id);
  }

  createTheme(input: ThemeCreateInput): Theme {
    const now = new Date().toISOString();
    const newTheme: Theme = {
      ...input,
      id: this.nextId++,
      status: "offline",
      createdAt: now,
      updatedAt: now,
    };
    this.themes.push(newTheme);
    return newTheme;
  }

  updateTheme(id: number, input: ThemeUpdateInput): Theme | null {
    const index = this.themes.findIndex((t) => t.id === id);
    if (index === -1) return null;

    this.themes[index] = {
      ...this.themes[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return this.themes[index];
  }

  toggleThemeStatus(id: number): Theme | null {
    const theme = this.getThemeById(id);
    if (!theme) return null;

    const newStatus = theme.status === "online" ? "offline" : "online";
    return this.updateTheme(id, { status: newStatus });
  }

  deleteTheme(id: number): boolean {
    const index = this.themes.findIndex((t) => t.id === id);
    if (index === -1) return false;

    this.themes.splice(index, 1);
    return true;
  }
}
