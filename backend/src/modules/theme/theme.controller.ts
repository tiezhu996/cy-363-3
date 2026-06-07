import type { Request, Response } from "express";
import { ThemeService } from "./theme.service";
import { themeTypes } from "./theme.data";

const service = new ThemeService();

function validateThemeData(body: any, isUpdate = false) {
  const errors: string[] = [];

  if (!isUpdate) {
    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      errors.push("主题名称不能为空");
    }
    if (!body.type || !themeTypes.includes(body.type)) {
      errors.push("请选择有效的主题类型");
    }
    if (!body.difficulty || body.difficulty < 1 || body.difficulty > 5) {
      errors.push("难度必须在1-5之间");
    }
    if (!body.minPlayers || body.minPlayers < 1) {
      errors.push("最少人数不能小于1");
    }
    if (!body.maxPlayers || body.maxPlayers < body.minPlayers) {
      errors.push("最多人数不能小于最少人数");
    }
    if (!body.duration || body.duration < 30) {
      errors.push("时长不能少于30分钟");
    }
  } else {
    if (body.name !== undefined && (typeof body.name !== "string" || body.name.trim().length === 0)) {
      errors.push("主题名称不能为空");
    }
    if (body.type !== undefined && !themeTypes.includes(body.type)) {
      errors.push("请选择有效的主题类型");
    }
    if (body.difficulty !== undefined && (body.difficulty < 1 || body.difficulty > 5)) {
      errors.push("难度必须在1-5之间");
    }
    if (body.minPlayers !== undefined && body.minPlayers < 1) {
      errors.push("最少人数不能小于1");
    }
    if (body.maxPlayers !== undefined && body.minPlayers !== undefined && body.maxPlayers < body.minPlayers) {
      errors.push("最多人数不能小于最少人数");
    }
    if (body.duration !== undefined && body.duration < 30) {
      errors.push("时长不能少于30分钟");
    }
  }

  return errors;
}

export function getAllThemes(_request: Request, response: Response) {
  const themes = service.getAllThemes();
  response.json({ data: themes, total: themes.length });
}

export function getOnlineThemes(_request: Request, response: Response) {
  const themes = service.getOnlineThemes();
  response.json({ data: themes, total: themes.length });
}

export function getThemeById(request: Request, response: Response) {
  const id = Number(request.params.id);
  if (isNaN(id)) {
    return response.status(400).json({ error: "无效的主题ID" });
  }

  const theme = service.getThemeById(id);
  if (!theme) {
    return response.status(404).json({ error: "主题不存在" });
  }

  response.json({ data: theme });
}

export function createTheme(request: Request, response: Response) {
  const errors = validateThemeData(request.body);
  if (errors.length > 0) {
    return response.status(400).json({ errors });
  }

  const { name, type, difficulty, minPlayers, maxPlayers, duration } = request.body;
  const newTheme = service.createTheme({
    name: name.trim(),
    type,
    difficulty: Number(difficulty),
    minPlayers: Number(minPlayers),
    maxPlayers: Number(maxPlayers),
    duration: Number(duration),
  });

  response.status(201).json({ data: newTheme, message: "主题创建成功" });
}

export function updateTheme(request: Request, response: Response) {
  const id = Number(request.params.id);
  if (isNaN(id)) {
    return response.status(400).json({ error: "无效的主题ID" });
  }

  const errors = validateThemeData(request.body, true);
  if (errors.length > 0) {
    return response.status(400).json({ errors });
  }

  const input: any = {};
  if (request.body.name !== undefined) input.name = request.body.name.trim();
  if (request.body.type !== undefined) input.type = request.body.type;
  if (request.body.difficulty !== undefined) input.difficulty = Number(request.body.difficulty);
  if (request.body.minPlayers !== undefined) input.minPlayers = Number(request.body.minPlayers);
  if (request.body.maxPlayers !== undefined) input.maxPlayers = Number(request.body.maxPlayers);
  if (request.body.duration !== undefined) input.duration = Number(request.body.duration);
  if (request.body.status !== undefined) input.status = request.body.status;

  const updatedTheme = service.updateTheme(id, input);
  if (!updatedTheme) {
    return response.status(404).json({ error: "主题不存在" });
  }

  response.json({ data: updatedTheme, message: "主题更新成功" });
}

export function toggleThemeStatus(request: Request, response: Response) {
  const id = Number(request.params.id);
  if (isNaN(id)) {
    return response.status(400).json({ error: "无效的主题ID" });
  }

  const updatedTheme = service.toggleThemeStatus(id);
  if (!updatedTheme) {
    return response.status(404).json({ error: "主题不存在" });
  }

  const action = updatedTheme.status === "online" ? "上架" : "下架";
  response.json({ data: updatedTheme, message: `主题${action}成功` });
}

export function deleteTheme(request: Request, response: Response) {
  const id = Number(request.params.id);
  if (isNaN(id)) {
    return response.status(400).json({ error: "无效的主题ID" });
  }

  const deleted = service.deleteTheme(id);
  if (!deleted) {
    return response.status(404).json({ error: "主题不存在" });
  }

  response.json({ message: "主题删除成功" });
}

export function getThemeTypes(_request: Request, response: Response) {
  response.json({ data: themeTypes });
}
