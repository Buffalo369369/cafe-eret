"use client";

import { useCart } from "@/store/cart";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useCheckout } from "@/store/checkout";

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clearCart);
  const subtotal = items.reduce(

  (sum, i) => sum + i.price * i.qty,

  0

);


  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<"cash" | "card">("cash");
  const [deliveryType, setDeliveryType] =
  useState<"delivery" | "pickup">("delivery");

const [timeType, setTimeType] =
  useState<"asap" | "scheduled">("asap");

const [scheduleDate, setScheduleDate] = useState("");
const [scheduleTime, setScheduleTime] = useState("");

const [deliveryFee, setDeliveryFee] =

  useState(0);

  const total = subtotal + deliveryFee;

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

const handleSubmit = async () => {
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

  // ✅ scheduled time validation
  if (timeType === "scheduled") {

    if (!scheduleDate || !scheduleTime) {
      toast.error("Bitte Datum und Uhrzeit wählen");
      return;
    }

    const selected = new Date(
      `${scheduleDate}T${scheduleTime}`
    );

    const now = new Date();

    if (selected < now) {
      toast.error("Bitte zukünftige Zeit wählen");
      return;
    }

    const day = selected.getDay();
    const hour = selected.getHours();
    const minutes = selected.getMinutes();

    // Montag geschlossen
    if (day === 1) {
      toast.error("Montag geschlossen");
      return;
    }

    // vor 10:00
    if (hour < 10) {
      toast.error("Wir öffnen um 10:00");
      return;
    }

    // nach 17:00
    if (hour > 16 || (hour === 16 && minutes > 59)) {
      toast.error("Bestellungen nur bis 17:00 möglich");
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
          deliveryType,
          timeType,
          scheduleDate,
          scheduleTime,
        }),
      });

      if (!res.ok) {
        toast.error("Stripe Fehler");
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
          timeType,
          scheduleDate,
          scheduleTime,
        }),
      });

      if (!res.ok) {
        toast.error("Fehler beim Senden");
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

    name: e.target.value,

  })

}
          />

          <input
            placeholder="Telefon *"
            className="w-full border px-4 py-2 rounded-lg"
            value={form.phone}
            onChange={(e) =>

  setForm({

    phone: e.target.value,

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

      city: e.target.value,

    })

  }

/>

    </div>


    <div className="text-sm">

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
      onClick={() => setDeliveryType("delivery")}
      className={`px-4 py-2 rounded-full ${
        deliveryType === "delivery"
          ? "bg-[#2c2c2c] text-white"
          : "bg-gray-100"
      }`}
    >
      🚚 Lieferung
    </button>

    <button
      onClick={() => {
  setDeliveryType("pickup");

  setForm({

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

</div>

{/* DELIVERY TIME */}
<div className="bg-white p-6 rounded-2xl shadow-md space-y-4">

  <h2 className="text-lg font-semibold">
    Lieferzeit
  </h2>

  <div className="flex gap-4 flex-wrap">

    <button
      onClick={() => setTimeType("asap")}
      className={`px-4 py-2 rounded-full ${
        timeType === "asap"
          ? "bg-[#2c2c2c] text-white"
          : "bg-gray-100"
      }`}
    >
      ⚡ So schnell wie möglich
    </button>

    <button
      onClick={() => setTimeType("scheduled")}
      className={`px-4 py-2 rounded-full ${
        timeType === "scheduled"
          ? "bg-[#2c2c2c] text-white"
          : "bg-gray-100"
      }`}
    >
      🕒 Bestimmte Uhrzeit
    </button>

  </div>

  {timeType === "scheduled" && (
  <div className="flex flex-col gap-4 w-full overflow-hidden">

    {/* DATE */}
    <div className="space-y-2 w-full">

      <label className="text-sm text-[#2c2c2c]/70 block">
        📅 Datum
      </label>

      <input
        type="date"
        value={scheduleDate}
        min={new Date().toISOString().split("T")[0]}
        onChange={(e) => setScheduleDate(e.target.value)}
        className="
  w-full
  appearance-none
  border
  border-black/15
  rounded-2xl
  bg-white
  px-4
  h-[56px]
  text-[#2c2c2c]
  outline-none
  overflow-hidden
"
      />

    </div>

    {/* TIME */}
    <div className="space-y-2 w-full">

      <label className="text-sm text-[#2c2c2c]/70 block">
        ⏰ Uhrzeit
      </label>

      <input
        type="time"
        value={scheduleTime}
        onChange={(e) => setScheduleTime(e.target.value)}
        className="
  w-full
  appearance-none
  border
  border-black/15
  rounded-2xl
  bg-white
  px-4
  h-[56px]
  text-[#2c2c2c]
  outline-none
  overflow-hidden
"
      />

    </div>

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

  <div className="mt-4 border-t pt-4 space-y-2">

    {deliveryType === "delivery" && (

      <div className="flex justify-between">

        <span>Lieferung</span>

        <span>

          {deliveryFee.toFixed(2)} €

        </span>

      </div>

    )}

    <div className="flex justify-between font-semibold">

      <span>Gesamt</span>

      <span>

        {total.toFixed(2)} €

      </span>

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
  checkingDelivery ||
  (
    deliveryType === "delivery" &&
    !deliveryAvailable
  )
}
          className="w-full py-3 rounded-full bg-gradient-to-r from-[#fff3a3] via-[#f4b740] to-[#cc5c06]"
        >
          {loading ? "Lädt..." : "Bestellen 🚀"}
        </button>

      </div>

    </main>
  );
}