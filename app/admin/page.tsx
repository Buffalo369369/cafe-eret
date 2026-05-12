"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {

  const audio =

  typeof window !== "undefined"

    ? new Audio("/sounds/order.mp3")

    : null;

  const [orders, setOrders] = useState<any[]>([]);

  // 🎨 status colors
  function getStatusColor(status: string) {

    switch (status) {

      case "new":
        return "bg-yellow-100 text-yellow-700";

      case "confirmed":
        return "bg-blue-100 text-blue-700";

      case "preparing":
        return "bg-orange-100 text-orange-700";

      case "delivery":
        return "bg-purple-100 text-purple-700";

      case "done":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  // 📦 load orders
  async function loadOrders() {

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    console.log("ORDERS:", data);
    console.log("ERROR:", error);

    setOrders(data || []);
  }

  // 🔄 update status
  async function updateStatus(
    id: string,
    status: string
  ) {

    await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    // live local update
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? { ...order, status }
          : order
      )
    );
  }

  // ⚡ realtime
  useEffect(() => {

    loadOrders();

    const channel = supabase

      .channel("orders-realtime")

      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },

        (payload) => {

  console.log("NEW ORDER:", payload);

  // 🔔 звук
  audio?.play();

  // ✨ новый заказ сверху
  setOrders((prev) => [
    {
      ...payload.new,
      isNew: true,
    },
    ...prev,
  ]);

  // убрать подсветку через 10 сек
  setTimeout(() => {

    setOrders((prev) =>
      prev.map((o) =>
        o.id === payload.new.id
          ? { ...o, isNew: false }
          : o
      )
    );

  }, 10000);

}
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, []);

  return (

    <main className="min-h-screen bg-[#f8f4ee] p-6 pt-32">

      <h1 className="text-3xl font-semibold mb-8">
        Orders
      </h1>

      <div className="grid gap-4">

        {orders.map((order) => (

          <div
            key={order.id}
            className={`
  rounded-2xl
  p-5
  shadow
  transition-all

  ${
    order.isNew
      ? "bg-green-100 ring-4 ring-green-300 animate-pulse"
      : "bg-white"
  }
`}
          >

            <div className="flex justify-between mb-4">

              {/* LEFT */}
              <div>

                <div className="flex items-center gap-2">

                  <h2 className="font-semibold text-lg">
                    {order.customer_name}
                  </h2>

                  <span className="text-sm text-gray-500">
                    #{order.order_number}
                  </span>

                </div>

                <p>{order.phone}</p>

                <p className="text-sm text-gray-500">
                  {new Date(
                    order.created_at
                  ).toLocaleString("de-DE")}
                </p>

                <p>{order.address}</p>

                {order.comment && (

                  <p>
                    💬 {order.comment}
                  </p>

                )}

                {order.time_type === "scheduled" && (

                  <p>
                    🕒 {order.schedule_date}
                    {" — "}
                    {order.schedule_time}
                  </p>

                )}

                {order.time_type === "asap" && (

                  <p>
                    ⚡ So schnell wie möglich
                  </p>

                )}

              </div>

              {/* RIGHT */}
              <div className="text-right">

                <p>{order.total} €</p>

                <p>{order.payment_method}</p>

                <p>{order.order_type}</p>

                {/* STATUS */}
                <div
                  className={`
                    mt-2
                    inline-flex
                    px-3
                    py-1
                    rounded-full
                    text-sm
                    font-medium
                    ${getStatusColor(order.status)}
                  `}
                >
                  {order.status}
                </div>

                {/* BUTTONS */}
                <div className="flex gap-2 mt-4 flex-wrap justify-end">

                  <button
                    onClick={() =>
                      updateStatus(
                        order.id,
                        "confirmed"
                      )
                    }
                    className="
                      px-3 py-1 rounded-lg
                      bg-blue-500
                      text-white
                      text-sm
                    "
                  >
                    Confirm
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        order.id,
                        "preparing"
                      )
                    }
                    className="
                      px-3 py-1 rounded-lg
                      bg-orange-500
                      text-white
                      text-sm
                    "
                  >
                    Preparing
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        order.id,
                        "delivery"
                      )
                    }
                    className="
                      px-3 py-1 rounded-lg
                      bg-purple-500
                      text-white
                      text-sm
                    "
                  >
                    Delivery
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        order.id,
                        "done"
                      )
                    }
                    className="
                      px-3 py-1 rounded-lg
                      bg-green-500
                      text-white
                      text-sm
                    "
                  >
                    Done
                  </button>

                </div>

              </div>

            </div>

            {/* ITEMS */}
            <div className="space-y-1">

              {order.items?.map(
                (
                  item: any,
                  index: number
                ) => (

                  <div key={index}>
                    {item.qty}x {item.name}
                  </div>

                )
              )}

            </div>

          </div>

        ))}

      </div>

    </main>
  );
}