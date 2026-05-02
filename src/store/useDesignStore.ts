'use client';

import { create } from 'zustand';
import type { DesignState } from '@/types';

interface DesignStore extends DesignState {
  // Mutators
  setText:       (text: string) => void;
  setFont:       (font: string) => void;
  setColor:      (color: string) => void;
  setFontSize:   (size: number) => void;
  setImageUrl:   (url: string) => void;
  setLayoutData: (data: Record<string, unknown>) => void;
  resetDesign:   () => void;
  getSnapshot:   () => DesignState;
}

const defaultState: DesignState = {
  text:       '',
  font:       'Arial',
  color:      '#1a1a1a',
  fontSize:   18,
  imageUrl:   '',
  layoutData: {},
};

export const useDesignStore = create<DesignStore>((set, get) => ({
  ...defaultState,

  setText      (text)       { set({ text }); },
  setFont      (font)       { set({ font }); },
  setColor     (color)      { set({ color }); },
  setFontSize  (fontSize)   { set({ fontSize }); },
  setImageUrl  (imageUrl)   { set({ imageUrl }); },
  setLayoutData(layoutData) { set({ layoutData }); },
  resetDesign  ()           { set({ ...defaultState }); },

  getSnapshot() {
    const { text, font, color, fontSize, imageUrl, layoutData } = get();
    return { text, font, color, fontSize, imageUrl, layoutData };
  },
}));
