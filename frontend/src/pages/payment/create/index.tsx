// src/pages/payment/create/index.tsx (UPDATED FULL FILE)
// - Keeps your original UI layout
// - Loads real data from backend
// - Uses separate /payment/checkout/:orderId and /promotions
// - Supports both /customer/payment/:orderId and /customer/payment?orderId=123

import "./Payment.css";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { BsQrCode, BsCashCoin } from "react-icons/bs";
import { GiWashingMachine } from "react-icons/gi";

import PromotionSelector, { type Promo as PromoSelectorType } from "./PromotionDemo";
import PaymentModal from "./PaymentModal";
import PaymentSuccessModal from "./slipDemo";
import CustomerSidebar from "../../../component/layout/customer/CusSidebar";

// ---------- Utilities ----------
const toBaht = (n: number) =>
  n.toLocaleString("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 2 });

// ---------- Types from backend ----------
export type ServiceItemSlim = {
  serviceTypeId: number;
  type: string;
  price: number;
};

// The checkout endpoint returns order/customer/address only (promotions fetched separately)
export type CheckoutResp = {
  customer: { fullName: string; phone: string };
  address: { text: string; parts?: { line1?: string; subdistrict?: string; district?: string; province?: string; postalCode?: string } };
  order: {
    id: number;
    summary: string;
    subtotal: number; // might be 0 — we will fallback to sum(items)
    paid: boolean;
    paymentId?: number;
    items: ServiceItemSlim[];
  };
};

// Promo shape used throughout the page and by PromotionSelector
export type Promo = {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountType: "percent" | "amount";
  discountValue: number;
  minSpend?: number;
  expiresAt?: string;
  disabled?: boolean;
  badge?: string;
};

function buildAddressText(a?: { line1?: string; subdistrict?: string; district?: string; province?: string; postalCode?: string }) {
  if (!a) return "";
  const parts = [a.line1, a.subdistrict, a.district, a.province, a.postalCode].filter(Boolean);
  return parts.join(" ");
}

export default function Payment() {
  // Read orderId from either route param or query string
  const { orderId: routeOrderId } = useParams<{ orderId?: string }>();
  const location = useLocation();
  const qOrderId = new URLSearchParams(location.search).get("orderId");
  const orderId = routeOrderId ? parseInt(routeOrderId, 10) : qOrderId ? parseInt(qOrderId, 10) : 0;

  const BASE_RAW = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
  const BASE = String(BASE_RAW).replace(/\/+$/, "");

  // ---------- Page UI states ----------
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Address / customer
  const [customerName, setCustomerName] = useState<string>("-");
  const [phone, setPhone] = useState<string>("-");
  const [fullAddress, setFullAddress] = useState<string>("-");

  // Order
  const [orderSummary, setOrderSummary] = useState<string>("ออร์เดอร์ #");
  const [items, setItems] = useState<ServiceItemSlim[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paid, setPaid] = useState(false);
  const [paidAt, setPaidAt] = useState<Date | null>(null);

  // Promotions
  const [promotions, setPromotions] = useState<Promo[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);

  // Modal
  const [openQR, setOpenQR] = useState(false);
  const promptPayTarget = "0645067561"; // your shop PromptPay target

  // Fetch checkout + promotions
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (!orderId) throw new Error("orderId is required");

        // 1) Checkout
        const checkoutRes = await fetch(`${BASE}/payment/checkout/${orderId}`);
        if (!checkoutRes.ok) throw new Error(`Checkout HTTP ${checkoutRes.status}`);
        const checkout: CheckoutResp = await checkoutRes.json();
        if (!mounted) return;

        // Customer / Address
        setCustomerName(checkout.customer?.fullName || "-");
        setPhone(checkout.customer?.phone || "-");
        const addrText = checkout.address?.text?.trim() || buildAddressText(checkout.address?.parts) || "-";
        setFullAddress(addrText);

        // Order basic
        setOrderSummary(checkout.order?.summary || `ออร์เดอร์ #${orderId}`);
        setItems(checkout.order?.items || []);
        setPaid(!!checkout.order?.paid);

        // subtotal fallback to sum of items when API returns 0
        const apiSubtotal = checkout.order?.subtotal ?? 0;
        const sumFromItems = (checkout.order?.items || []).reduce((s, it) => s + (it.price || 0), 0);
        setTotalAmount(apiSubtotal || sumFromItems);

        // 2) Promotions
        const promoRes = await fetch(`${BASE}/promotions`);
        if (!promoRes.ok) throw new Error(`Promotions HTTP ${promoRes.status}`);
        const rawPromos: any[] = await promoRes.json();
        if (!mounted) return;

        // Map raw to Promo shape used by UI
        const mapped: Promo[] = (rawPromos || []).map((p: any) => {
          // รองรับทั้ง lowerCamel และ UpperCamel จาก Go
          const id = String(p.id ?? p.ID);
          const promotionName = p.promotionName ?? p.PromotionName ?? "";
          const description = p.description ?? p.Description ?? "";
          const discountTypeID = p.discountTypeID ?? p.DiscountTypeID;
          const endDate = p.endDate ?? p.EndDate;

          const conditions: any[] = p.promotionCondition ?? p.PromotionCondition ?? [];

          const codeCond = conditions.find(
            (c) => String(c.conditionType ?? c.ConditionType).toUpperCase() === "CODE"
          );
          const minSpendCond = conditions.find(
            (c) => String(c.conditionType ?? c.ConditionType).toUpperCase() === "MIN_SPEND"
          );

          const minSpend = minSpendCond
            ? parseInt(String(minSpendCond.value ?? minSpendCond.Value), 10)
            : undefined;

          const discountType: Promo["discountType"] =
            Number(discountTypeID) === 1 ? "percent" : "amount";

          return {
            id,
            code: (codeCond?.value ?? codeCond?.Value ?? `PROMO${id}`) as string,
            title: promotionName,
            description,
            discountType,
            discountValue: Number(p.discountValue ?? p.DiscountValue ?? 0),
            minSpend,
            expiresAt: endDate ? String(endDate).slice(0, 10) : undefined,
            disabled: false,
          } satisfies Promo;
        });

        // Compute disabled + best promo client-side
        const subtotal = apiSubtotal || sumFromItems;
        const withDisabled = mapped.map((m) => ({
          ...m,
          disabled: m.minSpend ? subtotal < m.minSpend : false,
        }));
        setPromotions(withDisabled);

        // Pick best promo by discount value
        let bestId: string | null = null;
        let bestOff = -1;
        for (const pr of withDisabled) {
          if (pr.disabled) continue;
          let off = 0;
          if (pr.discountType === "amount") off = Math.min(pr.discountValue, subtotal);
          else off = Math.min(Math.round(subtotal * (pr.discountValue / 100) * 100) / 100, subtotal);
          if (off > bestOff) { bestOff = off; bestId = pr.id; }
        }
        if (bestId) {
          setSelectedId(bestId);
          setSelectedPromo(withDisabled.find((p) => p.id === bestId) ?? null);
        } else {
          setSelectedId(null);
          setSelectedPromo(null);
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [BASE, orderId]);

  // Discount / Final total
  const discount = useMemo(() => {
    if (!selectedPromo) return 0;
    if (selectedPromo.minSpend && totalAmount < selectedPromo.minSpend) return 0;
    if (selectedPromo.discountType === "amount") return Math.min(selectedPromo.discountValue, totalAmount);
    const cut = Math.round(totalAmount * (selectedPromo.discountValue / 100) * 100) / 100;
    return Math.min(cut, totalAmount);
  }, [totalAmount, selectedPromo]);

  const finalTotal = useMemo(() => Math.max(0, Math.round((totalAmount - discount) * 100) / 100), [totalAmount, discount]);

  if (loading) return <div className="p-6">กำลังโหลด...</div>;
  if (error) return <div className="p-6 text-red-600">เกิดข้อผิดพลาด: {String(error)}</div>;

  return (
    <CustomerSidebar>
      <div className="max-w-full mx-auto bg-white min-h-screen p-4">
        {/* Header */}
        <div className="flex items-center mb-4">
          <h1 className="text-center text-xl font-semibold flex-1">รายการชำระเงิน</h1>
        </div>

        {/* Address */}
        <div className="p-3 border rounded-lg mb-4">
          <p className="font-bold text-gray-800">{customerName}</p>
          <p className="text-sm text-gray-600">{fullAddress}</p>
          <p className="text-sm text-gray-600">{phone ? `${phone}` : "-"}</p>
        </div>

        {/* Order summary */}
        <div className="p-3 border rounded-lg mb-4 flex gap-3">
          <GiWashingMachine size={100} className="text-gray-600" />
          <div className="flex-1">
            <p className="text-sm font-medium">{orderSummary}</p>

            {/* Items from DB */}
            {items.length > 0 ? (
              <ul className="text-sm text-gray-500 space-y-1 mt-1">
                {items.map((it) => (
                  <li key={it.serviceTypeId} className="flex justify-between">
                    <span>{it.type}</span>
                    <span>{toBaht(it.price)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 mt-1">-</p>
            )}

            <div className="flex justify-between mt-2">
              <span className="text-red-500 font-semibold">{toBaht(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Promotions */}
        <div className="rounded-xl border p-3">
          
          <PromotionSelector
            promotions={promotions as unknown as PromoSelectorType[]}
            cartTotal={totalAmount}
            selectedId={selectedId ?? undefined}
            onChange={(p) => {
              // p มาจากคอมโพเนนต์ PromotionSelector (ชนิดสอดคล้องกัน)
              const picked = p as unknown as Promo | null;
              setSelectedPromo(picked);
              setSelectedId(picked?.id ?? null);
            }}
            singleSelect
          />
        </div>

        {/* Totals + actions */}
        <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-lg">
            <div>รวมก่อนหักโปร: <b>{toBaht(totalAmount)}</b></div>
            <div>ส่วนลด: <b className="text-green-600">- {toBaht(discount)}</b></div>
            <div>ยอดที่ต้องชำระ: <b className="text-blue-700">{toBaht(finalTotal)}</b></div>
          </div>

          <div className="flex gap-4">
            <button
              className="w-[320px] bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
              onClick={() => setOpenQR(true)}
              title="ชำระด้วยพร้อมเพย์"
            >
              <div className="flex items-center justify-center gap-2">
                <BsQrCode size={24} />
                <span>ชำระด้วยพร้อมเพย์</span>
              </div>
            </button>

            <button className="w-[320px] bg-gray-100 text-gray-700 py-2 rounded-xl border hover:bg-gray-200">
              <div className="flex items-center justify-center gap-2">
                <BsCashCoin size={24} />
                <span>ชำระเงินสด</span>
              </div>
            </button>
          </div>
        </div>

        {/* QR Modal */}
        <PaymentModal
          isOpen={openQR}
          onClose={() => setOpenQR(false)}
          promptPayTarget={promptPayTarget}
          amountTHB={finalTotal}            // ✅ send final amount
          orderId={orderId}
          durationSec={600}
          onVerified={(r) => {
            setOpenQR(false);
            setPaidAt(r?.date ? new Date(r.date) : new Date());
            setPaid(true);
          }}
        />

        {/* Success Modal */}
        <PaymentSuccessModal
          isOpen={paid}
          onClose={() => setPaid(false)}
          shopName="NATII."
          orderId={orderId}
          amount={finalTotal}
          currency="THB"
          paidAt={paidAt ?? new Date()}
          statusText="ชำระเงินแล้ว"
        />

        {/* <button className="text-sm text-gray-500 mt-1 ">
          testPullOrderId
        </button> */}
      </div>
    </CustomerSidebar>
  );
}