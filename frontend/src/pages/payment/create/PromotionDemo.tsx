import  { useMemo, useState } from "react";

type DiscountType = "percent" | "amount";

export type Promo = {
  id: string;
  code: string;               // CODE เช่น SAVE50
  title: string;              // ชื่อโปร เช่น "ลด 50 บาท"
  description?: string;       // คำอธิบายย่อย
  discountType: DiscountType; // "percent" = %, "amount" = บาท
  discountValue: number;      // มูลค่าที่ลด (ตาม type)
  minSpend?: number;          // ยอดขั้นต่ำ
  expiresAt?: string;         // วันหมดอายุ (ISO string)
  disabled?: boolean;         // ปิดใช้งาน
  badge?: string;             // ป้าย เช่น "แนะนำ", "พิเศษ"
};

export type PromotionSelectorProps = {
  promotions: Promo[];
  cartTotal: number;

  /** โหมด controlled (ถ้าส่งมา) */
  selectedId?: string | null;
  onChange?: (promo: Promo | null) => void;

  // /** เมื่อกด “ใช้คูปอง” */
  // onApply?: (promo: Promo | null) => void;

  /** ให้เลือกได้เพียงโปรเดียว (ค่าเริ่มต้น = true) */
  singleSelect?: boolean;
};

const toBaht = (n: number) =>
  n.toLocaleString("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 2 });

function computeDiscount(cartTotal: number, promo: Promo): number {
  if (promo.minSpend && cartTotal < promo.minSpend) return 0;
  if (promo.discountType === "amount") return Math.min(promo.discountValue, cartTotal);
  // percent
  const cut = Math.floor((cartTotal * promo.discountValue) * 100) / 100 / 100; // ปัดทศนิยม 2 ตำแหน่ง
  return Math.min(cut, cartTotal);
}

function formatDateTH(iso?: string) {
  if (!iso) return "";
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return "";
  const d = dt.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
  return `ถึง ${d}`;
}

export default function PromotionSelector({
  promotions,
  cartTotal,
  selectedId,
  onChange,
  // onApply,
  singleSelect = true,
}: PromotionSelectorProps) {
  const [internalId, setInternalId] = useState<string | null>(null);
  const currentId = selectedId ?? internalId;

  const bestId = useMemo(() => {
    // ใช้บอก “แนะนำ” โดยคำนวณส่วนลดสูงสุด (เฉพาะโปรที่ผ่าน minSpend และไม่ disabled)
    let best: { id: string; off: number } | null = null;
    for (const p of promotions) {
      if (p.disabled) continue;
      const off = computeDiscount(cartTotal, p);
      if (!best || off > best.off) best = { id: p.id, off };
    }
    return best?.id ?? null;
  }, [promotions, cartTotal]);

  const setSelected = (id: string | null) => {
    if (selectedId === undefined) setInternalId(id);
    const promo = promotions.find((x) => x.id === id) ?? null;
    onChange?.(promo);
  };

  return (
    <div className="w-full">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2">เลือกโปรโมชั่น</h3>
          <p className="text-sm text-gray-500">เลือกได้ {singleSelect ? "1 โปร" : "หลายโปร"}</p>
        </div>
        
      </div>

      <div className="space-y-3">
        {promotions.map((p) => {
          const off = computeDiscount(cartTotal, p);
          const unmet = !!p.minSpend && cartTotal < p.minSpend;
          const isSelected = currentId === p.id;
          const isDisabled = p.disabled || (singleSelect && unmet);

          return (
            <label
              key={p.id}
              className={[
                "relative flex items-start gap-3 rounded-2xl border p-4 shadow-sm cursor-pointer",
                "transition hover:shadow",
                isDisabled ? "opacity-60 cursor-not-allowed" : "",
                isSelected ? "border-blue-600 ring-2 ring-blue-600/20" : "border-gray-200",
              ].join(" ")}
            >
              {/* ซ่อน input ไว้แต่ยังเข้าถึงได้ (a11y) */}
              <input
                type="radio"
                name="promo"
                className="peer sr-only"
                checked={isSelected}
                onChange={() => !isDisabled && setSelected(p.id)}
                disabled={isDisabled}
              />

              {/* เนื้อหาโปรฝั่งซ้าย */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">{p.title}</span>
                  {p.badge && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {p.badge}
                    </span>
                  )}
                  {bestId === p.id && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      แนะนำ
                    </span>
                  )}
                </div>

                {!!p.description && (
                  <div className="mt-1 text-sm text-gray-600">{p.description}</div>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                    โค้ด: <strong>{p.code}</strong>
                  </span>
                  {p.minSpend !== undefined && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                      ยอดขั้นต่ำ {toBaht(p.minSpend)}
                    </span>
                  )}
                  {p.expiresAt && (
                    <span className="text-gray-500">{formatDateTH(p.expiresAt)}</span>
                  )}
                </div>

                {/* แจ้งเตือนกรณีไม่ถึงขั้นต่ำ */}
                {unmet && (
                  <div className="mt-2 rounded-xl bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
                    ยอดสั่งซื้อของคุณยังไม่ถึงขั้นต่ำสำหรับโปรนี้
                  </div>
                )}
              </div>

              {/* วงกลมเลือก (ด้านขวา) */}
              <div className="ml-2 flex items-center">
                <span
                  className={[
                    "inline-flex h-6 w-6 items-center justify-center rounded-full border",
                    isSelected ? "border-blue-600" : "border-gray-300",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "block h-3.5 w-3.5 rounded-full transition",
                      isSelected ? "bg-blue-600" : "bg-transparent",
                    ].join(" ")}
                  />
                </span>
              </div>

              {/* แถบสรุปลดราคา (แสดงทางขวาล่างของการ์ด) */}
              <div className="absolute bottom-3 right-12 text-sm">
                {off > 0 ? (
                  <span className="rounded-lg bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                    ลดทันที {toBaht(off)}
                  </span>
                ) : (
                  !isDisabled && (
                    <span className="rounded-lg bg-gray-100 px-2 py-1 text-gray-600">
                      เลือกเพื่อดูส่วนลด
                    </span>
                  )
                )}
              </div>
            </label>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          className="rounded-xl border px-4 py-2 text-gray-700 hover:bg-gray-50"
          onClick={() => setSelected(null)}
        >
          ล้างการเลือก
        </button>
        
      </div>
    </div>
  );
}
