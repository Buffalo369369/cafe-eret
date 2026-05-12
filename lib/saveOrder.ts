import { supabase } from "./supabase";

export async function saveOrder(order: any) {

  console.log("SAVING ORDER:", order);

  const { data, error } = await supabase
  .from("orders")
  .insert([order])
  .select()
  .single();

return data;

  console.log("SUPABASE DATA:", data);

  console.log("SUPABASE ERROR:", error);

  if (error) {
    console.error(
      "SUPABASE ERROR:",
      error
    );
  }

  return data;
}