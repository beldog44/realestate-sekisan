import type { Property } from "@/types";
import { usePropertyStore } from "@/store";
import { OverviewTab } from "@/components/tabs/OverviewTab";
import { SekisanTab } from "@/components/tabs/SekisanTab";
import { AirbnbTab } from "@/components/tabs/AirbnbTab";
import { LoanTab } from "@/components/tabs/LoanTab";
import { ExitTab } from "@/components/tabs/ExitTab";
import { MemoTab } from "@/components/tabs/MemoTab";
import { PropertyListTab } from "@/components/tabs/PropertyListTab";
import { ManualEntryTab } from "@/components/tabs/ManualEntryTab";
import { Home, Calculator, Building, Banknote, TrendingUp, FileText, List, PenLine } from "lucide-react";

type Tab = "overview" | "sekisan" | "airbnb" | "loan" | "exit" | "memo" | "list" | "manual";

const TABS: Array<{ id: Tab; label: string; Icon: React.ElementType }> = [
  { id: "overview", label: "概要", Icon: Home },
  { id: "sekisan", label: "積算", Icon: Calculator },
  { id: "airbnb", label: "民泊", Icon: Building },
  { id: "loan", label: "融資", Icon: Banknote },
  { id: "exit", label: "出口", Icon: TrendingUp },
  { id: "memo", label: "メモ", Icon: FileText },
  { id: "list", label: "一覧", Icon: List },
  { id: "manual", label: "手動", Icon: PenLine },
];

export function SidePanelLayout() {
  const { properties, activePropertyId, activeTab, setActiveTab } = usePropertyStore();
  const activeProperty = properties.find((p) => p.id === activePropertyId);

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900" style={{ width: "100%", maxWidth: "420px" }}>
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center gap-2 shadow-sm">
        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">積</div>
        <div>
          <div className="text-xs font-bold text-gray-800">不動産積算ナビ</div>
          {activeProperty && activeTab !== "manual" && activeTab !== "list" && (
            <div className="text-2xs text-gray-400 truncate max-w-[200px]">
              {activeProperty.raw.name ?? activeProperty.raw.address ?? activeProperty.id}
            </div>
          )}
        </div>
        <div className="ml-auto text-2xs text-gray-400">{properties.length}件</div>
      </div>

      {/* タブナビ */}
      <div className="bg-white border-b border-gray-200 flex overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 text-2xs whitespace-nowrap transition-colors border-b-2 flex-1 min-w-0 ${
              activeTab === id
                ? "border-blue-600 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "list" ? (
          <PropertyListTab />
        ) : activeTab === "manual" ? (
          <ManualEntryTab />
        ) : activeProperty ? (
          <PropertyTabContent property={activeProperty} tab={activeTab} />
        ) : (
          <EmptyState onManual={() => setActiveTab("manual")} />
        )}
      </div>
    </div>
  );
}

function PropertyTabContent({ property, tab }: { property: Property; tab: Tab }) {
  switch (tab) {
    case "overview": return <OverviewTab property={property} />;
    case "sekisan": return <SekisanTab property={property} />;
    case "airbnb": return <AirbnbTab property={property} />;
    case "loan": return <LoanTab property={property} />;
    case "exit": return <ExitTab property={property} />;
    case "memo": return <MemoTab property={property} />;
    default: return null;
  }
}

function EmptyState({ onManual }: { onManual: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <Home size={32} className="text-blue-600" />
      </div>
      <h2 className="text-sm font-bold text-gray-700 mb-2">物件を登録しよう</h2>
      <p className="text-xs text-gray-500 mb-4">
        不動産サイト（楽待・健美家・SUUMO等）で物件を開いてから、
        ポップアップの「物件を取得」ボタンを押してください
      </p>
      <button
        onClick={onManual}
        className="mb-4 text-xs bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700"
      >
        手動で物件を入力する
      </button>
      <div className="bg-blue-50 rounded-lg p-3 text-left text-xs text-blue-700 w-full">
        <div className="font-bold mb-1">自動取得対応サイト</div>
        <ul className="space-y-0.5">
          <li>• 楽待（rakumachi.jp）</li>
          <li>• 健美家（kenbiya.com）</li>
          <li>• SUUMO（suumo.jp）</li>
          <li>• アットホーム（athome.co.jp）</li>
          <li>• LIFULL HOME'S（homes.co.jp）</li>
        </ul>
      </div>
    </div>
  );
}
