import { create } from "zustand";
import { createContext } from "react";
import { CanvasSlice, createCanvasSlice } from "./canvasSlice";

export const useBoundStore = create((...a) => ({
  ...createCanvasSlice(...a),
}));
