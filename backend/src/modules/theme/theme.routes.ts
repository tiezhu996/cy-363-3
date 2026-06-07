import { Router } from "express";
import {
  getAllThemes,
  getOnlineThemes,
  getThemeById,
  createTheme,
  updateTheme,
  toggleThemeStatus,
  deleteTheme,
  getThemeTypes,
} from "./theme.controller";

export const themeRouter = Router();

themeRouter.get("/themes/types", getThemeTypes);
themeRouter.get("/themes", getAllThemes);
themeRouter.get("/themes/online", getOnlineThemes);
themeRouter.get("/themes/:id", getThemeById);
themeRouter.post("/themes", createTheme);
themeRouter.put("/themes/:id", updateTheme);
themeRouter.patch("/themes/:id/toggle", toggleThemeStatus);
themeRouter.delete("/themes/:id", deleteTheme);
