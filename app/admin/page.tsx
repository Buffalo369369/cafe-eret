"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {

  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {

  const { data, error } = await supabase.from("orders")

    .select("*")

    .order("created_at", {

      ascending: false,

    });

  console.log("ORDERS:", data);

  console.log("ERROR:", error);

  setOrders(data || []);

}

  return (
    <main className="min-h-screen bg-[#f8f4ee] p-6 pt-32">

      <h1 className="text-3xl font-semibold mb-8">
        Orders
      </h1>

      <div className="grid gap-4">

        {orders.map((order) => (

          <div
            key={order.id}
            className="
              bg-white
              rounded-2xl
              p-5
              shadow
            "
          >

            <div className="flex justify-between mb-4">

              <div>
                <h2 className="font-semibold text-lg">
                  {order.customer_name}
                </h2>

                <p>{order.phone}</p>

                <p>{order.address}</p>
              </div>

              <div className="text-right">
                <p>{order.total} €</p>

                <p>{order.payment_method}</p>

                <p>{order.order_type}</p>
              </div>

            </div>

            <div className="space-y-1">

              {order.items?.map(
                (item: any, index: number) => (

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
