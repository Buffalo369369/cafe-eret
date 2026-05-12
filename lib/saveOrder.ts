import { supabase } from "./supabase";

export async function saveOrder(order: any) {
  const { data, error } = await supabase
    .from("orders")
    .insert([order]);

  if (error) {
    console.error("SUPABASE ERROR:", error);
    return;
  }

  return data;
}