import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PlanTier = "athlete" | "pro" | "legend";

export interface RedBullStore {
    selectedTier: PlanTier | null;
    categories: string[];
    addons: string[];
    setTier: (tier: PlanTier) => void;
    toggleCategory: (category: string) => void;
    toggleAddon: (addon: string) => void;
    calculateTotal: () => number;
}

const PLAN_PRICES = {
    athlete: 9,
    pro: 29,
    legend: 99,
};

const ADDON_PRICES: Record<string, number> = {
    "merch-box": 25,
    "coaching-calls": 50,
};

export const useRedBullStore = create<RedBullStore>()(
    persist(
        (set, get) => ({
            selectedTier: null,
            categories: [],
            addons: [],
            setTier: (tier) => set({ selectedTier: tier }),
            toggleCategory: (category) =>
                set((state) => ({
                    categories: state.categories.includes(category)
                        ? state.categories.filter((c) => c !== category)
                        : [...state.categories, category],
                })),
            toggleAddon: (addon) =>
                set((state) => ({
                    addons: state.addons.includes(addon)
                        ? state.addons.filter((a) => a !== addon)
                        : [...state.addons, addon],
                })),
            calculateTotal: () => {
                const state = get();
                const basePrice = state.selectedTier ? PLAN_PRICES[state.selectedTier] : 0;
                const addonsPrice = state.addons.reduce((acc, addon) => acc + (ADDON_PRICES[addon] || 0), 0);
                return basePrice + addonsPrice;
            },
        }),
        {
            name: "red-bull-storage",
        }
    )
);
