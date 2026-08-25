"use client";

import { useCart } from "@/store/cart";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useCheckout } from "@/store/checkout";
import { calculateOrderPricing } from "@/lib/order-pricing";
import {
  getAvailableTodayTimeSlots,
  getOrderingAvailability,
  NO_TODAY_SLOTS_NOTICE,
} from "@/lib/ordering-availability";

export default function CheckoutPage() {
  const [orderingAvailability, setOrderingAvailability] = useState(
    () => getOrderingAvailability()
  );
  const orderingAvailable = orderingAvailability.isAvailable;
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clearCart);
  const subtotal = items.reduce(

  (sum, i) => sum + i.price * i.qty,

  0

);


  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");

const [coupon, setCoupon] = useState<{
  code: string;
  type: "fixed" | "percent";
  value: number;
} | null>(null);

const [checkingCoupon, setCheckingCoupon] =
  useState(false);
  const [payment, setPayment] = useState<"cash" | "card">("cash");
  const [deliveryType, setDeliveryType] =
  useState<"delivery" | "pickup">("pickup");

const [timeType, setTimeType] =
  useState<"asap" | "today">("asap");

const [selectedTime, setSelectedTime] = useState("");
  const todayTimeSlots = getAvailableTodayTimeSlots();

const [deliveryFee, setDeliveryFee] =

  useState(0);

  const { discount, total } = calculateOrderPricing({
    items,
    deliveryFee,
    coupon,
  });

const [deliveryAvailable, setDeliveryAvailable] =

  useState(true);

const [deliveryDistance, setDeliveryDistance] =

  useState("");

const [checkingDelivery, setCheckingDelivery] =

  useState(false);

const form = useCheckout((s) => s.form);

const setForm = useCheckout(

  (s) => s.setForm

);

const clearForm = useCheckout(

  (s) => s.clearForm

);

  useEffect(() => {
    const refreshOrderingAvailability = () => {
      setOrderingAvailability(getOrderingAvailability());
    };

    const interval = window.setInterval(refreshOrderingAvailability, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {

  if (
    deliveryType !== "delivery"
  ) {
    return;
  }

  if (
    !form.street ||
    !form.zip ||
    !form.city
  ) {
    return;
  }

  if (!/^\d{5}$/.test(form.zip)) {
    return;
  }

  const timeout = setTimeout(() => {

    checkDelivery(
      `${form.street}, ${form.zip} ${form.city}, Germany`
    );

  }, 500);

  return () => clearTimeout(timeout);

}, [
  form.street,
  form.zip,
  form.city,
  deliveryType,
]);

 
  async function checkDelivery(

  address: string

) {

  if (!address) return;

  try {

    setCheckingDelivery(true);

    const res = await fetch(

      "/api/delivery",

      {

        method: "POST",

        headers: {

          "Content-Type":

            "application/json",

        },

        body: JSON.stringify({

          address,

        }),

      }

    );

    const data = await res.json();

    setDeliveryAvailable(

      data.available

    );

    setDeliveryFee(data.fee || 0);

    setDeliveryDistance(

      data.distance || ""

    );

  } catch (err) {

    console.error(err);

  } finally {

    setCheckingDelivery(false);

  }

}

async function applyCoupon() {
  if (!couponCode.trim()) {
    toast.error("Bitte Gutscheincode eingeben");
    return;
  }

  try {
    setCheckingCoupon(true);

    const res = await fetch("/api/coupon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: couponCode,
      }),
    });

    const data = await res.json();

    if (!data.valid) {
      toast.error(data.message);

      setCoupon(null);

      return;
    }

    setCoupon(data.coupon);

    toast.success("Gutschein angewendet 🎉");
  } finally {
    setCheckingCoupon(false);
  }
}

const handleSubmit = async () => {
  const currentOrderingAvailability = getOrderingAvailability();
  if (!currentOrderingAvailability.isAvailable) {
    toast.error(currentOrderingAvailability.message);
    return;
  }

  if (loading) return;

  // ✅ validation
  if (
    !form.name ||
    !form.phone ||
    (

  deliveryType === "delivery" &&

  (

    !form.street ||

    !form.zip ||

    !form.city

  )

)
  ) {
    toast.error("Bitte alle Pflichtfelder ausfüllen");
    return;
  }

  if (
  deliveryType === "delivery" &&
  !deliveryAvailable
) {

  toast.error(
    "Lieferung nicht verfügbar"
  );

  return;

}

if (
  deliveryType === "delivery" &&
  subtotal < 15
) {

  toast.error(
    "Mindestbestellwert für Lieferung ist 15 €"
  );

  return;

}

if (

  deliveryType === "delivery" &&

  !/^\d{5}$/.test(form.zip)

) {

  toast.error("Ungültige PLZ");

  return;

}

if (
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
) {

  toast.error("Ungültige E-Mail");

  return;

}

  if (timeType === "today") {
    if (todayTimeSlots.length === 0) {
      toast.error(NO_TODAY_SLOTS_NOTICE);
      return;
    }

    if (!todayTimeSlots.includes(selectedTime)) {
      toast.error("Bitte wählen Sie eine verfügbare Uhrzeit für heute.");
      return;
    }
  }

  setLoading(true);

  const fullAddress =
  `${form.street}, ${form.zip} ${form.city}, Germany`;

  try {

    // 💳 CARD PAYMENT
    if (payment === "card") {

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  items,

  form: {
    ...form,
    address: fullAddress,
  },

  payment: "card",

  deliveryType,
  deliveryFee,
  timeType,
  selectedTime,

  coupon: coupon?.code ?? null,
})
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Stripe Fehler");
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      toast.error("Fehler bei Stripe");
    }

    // 💵 CASH PAYMENT
    if (payment === "cash") {

      const res = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({

  items,

  form: {

    ...form,

    address: fullAddress,

  },

  payment: "cash",

  deliveryType,

  deliveryFee,

  timeType,
  selectedTime,

  coupon: coupon?.code ?? null,

}),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Fehler beim Senden");
        setLoading(false);
        return;
      }

      toast.success("Bestellung gesendet 🎉");

      clearCart();

      clearForm();

      router.push("/success");
    }

  } catch (e) {

    console.error(e);

    toast.error("Fehler beim Senden");

  } finally {

    setLoading(false);

  }
};

  return (
    <main className="bg-[#e9dfcf] pt-[90px] md:pt-[110px] min-h-screen px-6 md:px-20 py-12">

      <div className="max-w-3xl mx-auto space-y-10">

        {!orderingAvailable && (
          <div
            role="status"
            className="whitespace-pre-line rounded-2xl border border-[#b88a5a] bg-[#fff9ef] p-6 text-center leading-relaxed text-[#5c4432] shadow-md"
          >
            {orderingAvailability.message}
          </div>
        )}

        <h1 className="text-3xl md:text-5xl font-semibold text-center text-[#2c2c2c]">
          Checkout
        </h1>

        {/* FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">

          <input
            placeholder="Name *"
            className="w-full border px-4 py-2 rounded-lg"
            value={form.name}
            onChange={(e) =>

  setForm({
  ...form,
  name: e.target.value,
})

}
          />

          {/* PHONE */}

<input

  placeholder="Telefon *"

  className="w-full border px-4 py-2 rounded-lg"

  value={form.phone}

  onChange={(e) =>

    setForm({

      ...form,

      phone: e.target.value,

    })

  }

/>

{/* EMAIL */}

<input

  type="email"

  placeholder="E-Mail *"

  className="w-full border px-4 py-2 rounded-lg"

  value={form.email}

  onChange={(e) =>

    setForm({

      ...form,

      email: e.target.value,

    })

  }

/>
            

         {deliveryType === "delivery" && (

<div className="space-y-3">

    {/* STREET */}
    <input
      placeholder="Straße und Hausnummer *"
      className="w-full border px-4 py-2 rounded-lg"

      value={form.street}

      onChange={(e) =>

  setForm({
  ...form,
  street: e.target.value,
})

}
    />

    {/* ZIP + CITY */}
    <div className="grid grid-cols-2 gap-3">

      <input
        placeholder="PLZ *"
        className="border px-4 py-2 rounded-lg"

        value={form.zip}

        onChange={(e) =>

  setForm({
  ...form,
  zip: e.target.value,
})

}
      />

      <input

  placeholder="Ort *"

  className="border px-4 py-2 rounded-lg"

  value={form.city}

  onChange={(e) =>

    setForm({

  ...form,

  city: e.target.value,

})

  }

/>

    </div>


    <div className="bg-[#f8f8f8] rounded-2xl p-3 text-sm">

      {checkingDelivery && (

        <p className="text-gray-500">

          Lieferkosten werden berechnet...

        </p>

      )}

      {!checkingDelivery &&

        deliveryDistance && (

        <div className="space-y-1">

          <p>

            Entfernung:

            {" "}

            {deliveryDistance} km

          </p>

          {deliveryAvailable ? (

            <p>

              Lieferkosten:

              {" "}

              {deliveryFee.toFixed(2)} €

            </p>

          ) : (

            <p className="text-red-500">

              Leider liefern wir

              nicht in diese Region.

            </p>

          )}

        </div>

      )}

    </div>

  </div>

)}

          <textarea
            placeholder="Kommentar"
            className="w-full border px-4 py-2 rounded-lg"
            value={form.comment}
            onChange={(e) => setForm({
  ...form,
  comment: e.target.value,
})}
          />

        </div>

{/* DELIVERY TYPE */}
<div className="bg-white p-6 rounded-2xl shadow-md space-y-4">

  <h2 className="text-lg font-semibold">
    Bestellungstyp
  </h2>

  <div className="flex gap-4 flex-wrap">

    <button
  disabled
  className="
    px-4
    py-2
    rounded-full
    bg-gray-100
    text-gray-400
    cursor-not-allowed
    opacity-80
  "
>
  🚚 Lieferung ab September
</button>

    <button
      onClick={() => {
  setDeliveryType("pickup");

  setForm({

  ...form,

  street: "",

  zip: "",

  city: "",

});

setDeliveryFee(0);

setDeliveryDistance("");

setDeliveryAvailable(true);
}}
      className={`px-4 py-2 rounded-full ${
        deliveryType === "pickup"
          ? "bg-[#2c2c2c] text-white"
          : "bg-gray-100"
      }`}
    >
      🥡 Abholung
    </button>

    </div>

    <p className="text-sm text-[#5c4432]/70 leading-relaxed">
  🚚 Unser Lieferservice startet im September.
  <br />
  Bis dahin bieten wir ausschließlich Abholung an.
</p>

</div>

{/* DELIVERY TIME */}
<div className="bg-white p-6 rounded-2xl shadow-md space-y-4">

  <h2 className="text-lg font-semibold">
    Lieferzeit
  </h2>

  <div className="flex gap-4 flex-wrap">

    <button
      onClick={() => {
        setTimeType("asap");
        setSelectedTime("");
      }}
      className={`px-4 py-2 rounded-full ${
        timeType === "asap"
          ? "bg-[#2c2c2c] text-white"
          : "bg-gray-100"
      }`}
    >
      ⚡ So schnell wie möglich
    </button>

    <button
      onClick={() => setTimeType("today")}
      className={`px-4 py-2 rounded-full ${
        timeType === "today"
          ? "bg-[#2c2c2c] text-white"
          : "bg-gray-100"
      }`}
    >
      🕒 Heute um
    </button>

  </div>

  {orderingAvailable && todayTimeSlots.length === 0 && (
    <p className="rounded-xl bg-[#fff9ef] p-4 text-sm text-[#5c4432]">
      {NO_TODAY_SLOTS_NOTICE}
    </p>
  )}

  {timeType === "today" && todayTimeSlots.length > 0 && (
    <div className="space-y-2 w-full">
      <label className="text-sm text-[#2c2c2c]/70 block" htmlFor="today-time">
        ⏰ Uhrzeit heute
      </label>
      <select
        id="today-time"
        value={selectedTime}
        onChange={(event) => setSelectedTime(event.target.value)}
        className="w-full border border-black/15 rounded-2xl bg-white px-4 h-[56px] text-[#2c2c2c] outline-none"
      >
        <option value="">Uhrzeit wählen</option>
        {todayTimeSlots.map((time) => (
          <option key={time} value={time}>
            {time} Uhr
          </option>
        ))}
      </select>
    </div>
  )}

</div>

        {/* PAYMENT */}
        <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">

          <h2 className="text-lg font-semibold">Zahlungsmethode</h2>

          <div className="flex gap-4">

            <button
              onClick={() => setPayment("cash")}
              className={`px-4 py-2 rounded-full ${
                payment === "cash"
                  ? "bg-[#2c2c2c] text-white"
                  : "bg-gray-100"
              }`}
            >
              💵 Bar
            </button>

            <button

  onClick={() => setPayment("card")}

  className={`px-4 py-2 rounded-full ${

    payment === "card"

      ? "bg-[#2c2c2c] text-white"

      : "bg-gray-100"

  }`}

>

  💳 Karte

</button>

          </div>

        </div>

        {/* SUMMARY */}

<div className="bg-white p-6 rounded-2xl shadow-md">

  <h2 className="font-semibold mb-4">

    Bestellung

  </h2>

  <div className="space-y-2">

    {items.map((item) => (

      <div

        key={item.id}

        className="flex justify-between"

      >

        <span>

          {item.name} x{item.qty}

        </span>

        <span>

          {(item.price * item.qty).toFixed(2)} €

        </span>

      </div>

    ))}

  </div>

  <div className="mt-6">
  <label className="block text-sm font-medium mb-2">
    🎁 Gutscheincode
  </label>

  <div className="flex gap-2">
    <input
      type="text"
      value={couponCode}
      onChange={(e) =>
        setCouponCode(e.target.value.toUpperCase())
      }
      placeholder="z.B. 10ERET10"
      className="flex-1 border rounded-lg px-4 py-2"
    />

    <button
      type="button"
      onClick={applyCoupon}
      disabled={checkingCoupon}
      className="px-4 rounded-lg bg-[#2c2c2c] text-white disabled:opacity-50"
    >
      {checkingCoupon ? "..." : "Anwenden"}
    </button>
  </div>
</div>

  <div className="mt-4 border-t pt-4 space-y-2">

  <div className="flex justify-between">
    <span>Zwischensumme</span>
    <span>{subtotal.toFixed(2)} €</span>
  </div>

  {discount > 0 && (
    <div className="flex justify-between text-green-700">
      <span>Rabatt</span>
      <span>-{discount.toFixed(2)} €</span>
    </div>
  )}

  {deliveryType === "delivery" && (
    <div className="flex justify-between">
      <span>Lieferung</span>
      <span>{deliveryFee.toFixed(2)} €</span>
    </div>
  )}

  <div className="flex justify-between font-semibold text-lg border-t pt-2">
    <span>Gesamt</span>
    <span>{total.toFixed(2)} €</span>
  </div>

  {deliveryType === "delivery" && (
    <p className="text-sm text-gray-500">
      Mindestbestellwert für Lieferung: 15 €
    </p>
  )}

</div>

</div>

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={
  loading ||
  !orderingAvailable ||
  checkingDelivery ||
  (
    deliveryType === "delivery" &&
    !deliveryAvailable
  )
}
          className="
w-full
py-3
rounded-full
bg-gradient-to-r
from-[#fff3a3]
via-[#f4b740]
to-[#cc5c06]
disabled:opacity-50
disabled:cursor-not-allowed
"
        >
          {loading
  ? "Bestellung wird gesendet..."
  : !orderingAvailable
  ? "Bestellungen derzeit nicht möglich"
  : checkingDelivery
  ? "Lieferung wird berechnet..."
  : "Bestellen 🚀"}
        </button>

      </div>

    </main>
  );
}
