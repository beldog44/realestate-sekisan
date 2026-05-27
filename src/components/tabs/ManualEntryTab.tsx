import { useState } from "react";
import type { RawProperty, BuildingStructure, Zoning, RoadContact } from "@/types";
import { usePropertyStore } from "@/store";
import { PenLine } from "lucide-react";

const STRUCTURES: BuildingStructure[] = ["木造", "軽量鉄骨", "重量鉄骨", "RC", "SRC", "その他"];
const ROAD_CONTACTS: RoadContact[] = ["2面以上", "1面", "なし（旗竿）", "不明"];
const ZONINGS: Zoning[] = [
  "第一種低層住居専用地域", "第二種低層住居専用地域",
  "第一種中高層住居専用地域", "第二種中高層住居専用地域",
  "第一種住居地域", "第二種住居地域", "準住居地域", "田園住居地域",
  "近隣商業地域", "商業地域", "準工業地域", "工業地域", "工業専用地域",
  "市街化調整区域", "不明",
];

type FormState = {
  name: string;
  price: string;
  address: string;
  landArea: string;
  buildingArea: string;
  floorPlan: string;
  structure: BuildingStructure;
  builtYear: string;
  builtMonth: string;
  zoning: Zoning | "";
  buildingCoverageRatio: string;
  floorAreaRatio: string;
  roadContact: RoadContact;
  frontRoadWidth: string;
  canRebuild: boolean;
  setback: boolean;
  nearestStation: string;
  walkMinutes: string;
  assumedRent: string;
  grossYield: string;
};

const INITIAL: FormState = {
  name: "", price: "", address: "", landArea: "", buildingArea: "",
  floorPlan: "", structure: "木造", builtYear: "", builtMonth: "1",
  zoning: "", buildingCoverageRatio: "", floorAreaRatio: "",
  roadContact: "1面", frontRoadWidth: "", canRebuild: true, setback: false,
  nearestStation: "", walkMinutes: "", assumedRent: "", grossYield: "",
};

export function ManualEntryTab() {
  const { addProperty, setActiveTab, setActiveProperty } = usePropertyStore();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [saved, setSaved] = useState(false);

  function set(key: keyof FormState, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const isValid = !!form.address || !!form.price;

  function handleSave() {
    if (!isValid) return;

    const raw: RawProperty = {
      name: form.name || undefined,
      price: form.price ? parseFloat(form.price) * 10000 : undefined,
      address: form.address || undefined,
      landArea: form.landArea ? parseFloat(form.landArea) : undefined,
      buildingArea: form.buildingArea ? parseFloat(form.buildingArea) : undefined,
      floorPlan: form.floorPlan || undefined,
      structure: form.structure,
      builtYear: form.builtYear ? parseInt(form.builtYear) : undefined,
      builtMonth: form.builtMonth ? parseInt(form.builtMonth) : undefined,
      zoning: (form.zoning || undefined) as Zoning | undefined,
      buildingCoverageRatio: form.buildingCoverageRatio ? parseFloat(form.buildingCoverageRatio) : undefined,
      floorAreaRatio: form.floorAreaRatio ? parseFloat(form.floorAreaRatio) : undefined,
      roadContact: form.roadContact,
      frontRoadWidth: form.frontRoadWidth ? parseFloat(form.frontRoadWidth) : undefined,
      canRebuild: form.canRebuild,
      setback: form.setback,
      nearestStation: form.nearestStation || undefined,
      walkMinutes: form.walkMinutes ? parseInt(form.walkMinutes) : undefined,
      assumedRent: form.assumedRent ? parseFloat(form.assumedRent) * 10000 : undefined,
      grossYield: form.grossYield ? parseFloat(form.grossYield) / 100 : undefined,
      currentUrl: window.location?.href ?? "",
      source: "manual",
      fetchedAt: new Date().toISOString(),
    };

    const property = addProperty(raw);
    setActiveProperty(property.id);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setForm(INITIAL);
      setActiveTab("overview");
    }, 1200);
  }

  const labelCls = "text-gray-500 text-xs";
  const inputCls = "mt-0.5 w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300";

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1">
          <PenLine size={12} /> 物件を手動入力
        </h3>
        <p className="text-2xs text-gray-400 mb-3">
          パーサーが対応していないサイトや、数値のみわかっている場合に直接入力してください。
          住所か価格のいずれかは必須です。
        </p>

        <div className="space-y-2">
          <Section title="基本情報">
            <Field label="物件名">
              <input className={inputCls} value={form.name} placeholder="例: 大阪市木造アパート" onChange={(e) => set("name", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="販売価格（万円）*">
                <input type="number" className={inputCls} value={form.price} placeholder="3000" onChange={(e) => set("price", e.target.value)} />
              </Field>
              <Field label="想定賃料（月・万円）">
                <input type="number" className={inputCls} value={form.assumedRent} placeholder="30" onChange={(e) => set("assumedRent", e.target.value)} />
              </Field>
            </div>
            <Field label="所在地 *">
              <input className={inputCls} value={form.address} placeholder="大阪府大阪市浪速区..." onChange={(e) => set("address", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="最寄駅">
                <input className={inputCls} value={form.nearestStation} placeholder="難波駅" onChange={(e) => set("nearestStation", e.target.value)} />
              </Field>
              <Field label="徒歩（分）">
                <input type="number" className={inputCls} value={form.walkMinutes} placeholder="7" onChange={(e) => set("walkMinutes", e.target.value)} />
              </Field>
            </div>
          </Section>

          <Section title="土地・建物">
            <div className="grid grid-cols-2 gap-2">
              <Field label="土地面積（㎡）">
                <input type="number" className={inputCls} value={form.landArea} placeholder="82.5" onChange={(e) => set("landArea", e.target.value)} />
              </Field>
              <Field label="建物面積（㎡）">
                <input type="number" className={inputCls} value={form.buildingArea} placeholder="148.2" onChange={(e) => set("buildingArea", e.target.value)} />
              </Field>
              <Field label="間取り">
                <input className={inputCls} value={form.floorPlan} placeholder="1R×8" onChange={(e) => set("floorPlan", e.target.value)} />
              </Field>
              <Field label="表面利回り（%）">
                <input type="number" className={inputCls} value={form.grossYield} placeholder="10.5" onChange={(e) => set("grossYield", e.target.value)} />
              </Field>
            </div>
          </Section>

          <Section title="建物情報">
            <div className="grid grid-cols-2 gap-2">
              <Field label="構造">
                <select className={inputCls} value={form.structure} onChange={(e) => set("structure", e.target.value as BuildingStructure)}>
                  {STRUCTURES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="築年（西暦）">
                <input type="number" className={inputCls} value={form.builtYear} placeholder="1998" onChange={(e) => set("builtYear", e.target.value)} />
              </Field>
              <Field label="築月">
                <select className={inputCls} value={form.builtMonth} onChange={(e) => set("builtMonth", e.target.value)}>
                  {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}月</option>)}
                </select>
              </Field>
            </div>
          </Section>

          <Section title="法令・道路">
            <div className="grid grid-cols-2 gap-2">
              <Field label="用途地域">
                <select className={inputCls} value={form.zoning} onChange={(e) => set("zoning", e.target.value)}>
                  <option value="">選択...</option>
                  {ZONINGS.map((z) => <option key={z} value={z}>{z}</option>)}
                </select>
              </Field>
              <Field label="接道状況">
                <select className={inputCls} value={form.roadContact} onChange={(e) => set("roadContact", e.target.value as RoadContact)}>
                  {ROAD_CONTACTS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="建ぺい率（%）">
                <input type="number" className={inputCls} value={form.buildingCoverageRatio} placeholder="60" onChange={(e) => set("buildingCoverageRatio", e.target.value)} />
              </Field>
              <Field label="容積率（%）">
                <input type="number" className={inputCls} value={form.floorAreaRatio} placeholder="200" onChange={(e) => set("floorAreaRatio", e.target.value)} />
              </Field>
              <Field label="前面道路幅員（m）">
                <input type="number" step="0.1" className={inputCls} value={form.frontRoadWidth} placeholder="4.0" onChange={(e) => set("frontRoadWidth", e.target.value)} />
              </Field>
            </div>
            <div className="flex gap-4 text-xs mt-1">
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={form.canRebuild} onChange={(e) => set("canRebuild", e.target.checked)} />
                再建築可
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={form.setback} onChange={(e) => set("setback", e.target.checked)} />
                セットバックあり
              </label>
            </div>
          </Section>
        </div>

        <button
          onClick={handleSave}
          disabled={!isValid}
          className={`mt-4 w-full py-2 rounded-lg text-xs font-bold transition-colors ${
            saved ? "bg-green-500 text-white" :
            isValid ? "bg-blue-600 text-white hover:bg-blue-700" :
            "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {saved ? "✓ 登録しました" : "物件を登録する"}
        </button>
        {!isValid && (
          <p className="text-2xs text-red-400 mt-1 text-center">
            所在地または販売価格を入力してください
          </p>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-gray-100 pt-2">
      <div className="text-2xs text-gray-400 font-bold uppercase tracking-wide mb-2">{title}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-gray-500 text-xs">{label}</span>
      {children}
    </label>
  );
}
