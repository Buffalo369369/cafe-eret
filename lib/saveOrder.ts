import { supabaseAdmin } from "./supabase-admin";
import type { OrderItem } from "@/lib/order-pricing";

type NewOrder = {
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  order_type: string;
  payment_method: "cash" | "card";
  items: OrderItem[];
  total: number;
  status: string;
  comment: string;
  time_type: string;
  schedule_time: string;
};

export async function saveOrder(
  order: NewOrder
) {

  const { data, error } =
    await supabaseAdmin
      .from("orders")
      .insert([order])
      .select()
      .single();

  if (error) {
    console.error("SUPABASE ORDER INSERT FAILED", { code: error.code });
  }

  return data;
}
