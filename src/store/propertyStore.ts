import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Property, RawProperty, SekisanInput, PropertyStatus } from "@/types";
import { calcSekisan, calcAirbnbScore, calcLoanAssessment, calcExitStrategy, calcScoreCard, generateExternalLinks } from "@/lib";
import { STORAGE_KEYS } from "@/constants";

interface PropertyStore {
  properties: Property[];
  activePropertyId: string | null;
  activeTab: "overview" | "sekisan" | "airbnb" | "loan" | "exit" | "memo" | "list";

  addProperty: (raw: RawProperty, sekisanInput?: Partial<SekisanInput>) => Property;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  setActiveProperty: (id: string | null) => void;
  setActiveTab: (tab: PropertyStore["activeTab"]) => void;
  recalculate: (id: string, sekisanInput: SekisanInput) => void;
  setStatus: (id: string, status: PropertyStatus) => void;
  updateMemo: (id: string, memo: string) => void;
  importProperties: (properties: Property[]) => void;
  clearAll: () => void;
}

function generateId(): string {
  return `prop_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const usePropertyStore = create<PropertyStore>()(
  persist(
    (set, get) => ({
      properties: [],
      activePropertyId: null,
      activeTab: "overview",

      addProperty: (raw, sekisanInput) => {
        const id = generateId();
        const now = new Date().toISOString();

        let sekisan = undefined;
        let airbnb = undefined;
        let loan = undefined;
        let exit = undefined;
        let score = undefined;

        if (sekisanInput && raw.price && raw.landArea && raw.buildingArea && raw.structure && raw.builtYear && sekisanInput.linePrice) {
          const fullInput: SekisanInput = {
            price: raw.price,
            landArea: raw.landArea,
            buildingArea: raw.buildingArea,
            structure: raw.structure,
            builtYear: raw.builtYear,
            builtMonth: raw.builtMonth,
            linePrice: sekisanInput.linePrice,
            zoning: raw.zoning,
            roadContact: raw.roadContact,
            frontRoadWidth: raw.frontRoadWidth,
            canRebuild: raw.canRebuild,
            setback: raw.setback,
            ...sekisanInput,
          };
          sekisan = calcSekisan(fullInput);
          airbnb = calcAirbnbScore({
            zoning: raw.zoning,
            walkMinutes: raw.walkMinutes,
            address: raw.address,
            assumedRent: raw.assumedRent,
            floorPlan: raw.floorPlan,
          });
          loan = calcLoanAssessment({ price: raw.price, sekisan, assumedRent: raw.assumedRent, builtYear: raw.builtYear });
          exit = calcExitStrategy({ price: raw.price, sekisan, raw });
          score = calcScoreCard({ price: raw.price, sekisan, airbnb, loan, exit, raw });
        }

        const externalLinks = raw.address ? generateExternalLinks(raw.address) : undefined;

        const property: Property = {
          id,
          raw,
          sekisan,
          airbnb,
          loan,
          exit,
          score,
          externalLinks,
          status: "未設定",
          memo: "",
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          properties: [property, ...state.properties],
          activePropertyId: id,
        }));

        return property;
      },

      updateProperty: (id, updates) => {
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      deleteProperty: (id) => {
        set((state) => ({
          properties: state.properties.filter((p) => p.id !== id),
          activePropertyId: state.activePropertyId === id ? null : state.activePropertyId,
        }));
      },

      setActiveProperty: (id) => set({ activePropertyId: id }),
      setActiveTab: (tab) => set({ activeTab: tab }),

      recalculate: (id, sekisanInput) => {
        const { properties } = get();
        const prop = properties.find((p) => p.id === id);
        if (!prop) return;

        const sekisan = calcSekisan(sekisanInput);
        const airbnb = calcAirbnbScore({
          zoning: prop.raw.zoning,
          walkMinutes: prop.raw.walkMinutes,
          address: prop.raw.address,
          assumedRent: prop.raw.assumedRent,
          floorPlan: prop.raw.floorPlan,
        });
        const loan = calcLoanAssessment({
          price: sekisanInput.price,
          sekisan,
          assumedRent: prop.raw.assumedRent,
          builtYear: prop.raw.builtYear,
        });
        const exit = calcExitStrategy({ price: sekisanInput.price, sekisan, raw: prop.raw });
        const score = calcScoreCard({ price: sekisanInput.price, sekisan, airbnb, loan, exit, raw: prop.raw });

        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === id
              ? { ...p, sekisan, airbnb, loan, exit, score, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      setStatus: (id, status) => {
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      updateMemo: (id, memo) => {
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === id ? { ...p, memo, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      importProperties: (properties) => {
        set((state) => ({
          properties: [...properties, ...state.properties],
        }));
      },

      clearAll: () => set({ properties: [], activePropertyId: null }),
    }),
    {
      name: STORAGE_KEYS.PROPERTIES,
      partialize: (state) => ({ properties: state.properties }),
    }
  )
);
