import { supabaseAdmin } from "./supabase-admin";

export async function saveOrder(
  order: any
) {

  console.log(
    "SAVING ORDER:",
    order
  );

  const { data, error } =
    await supabaseAdmin
      .from("orders")
      .insert([order])
      .select()
      .single();

  console.log(
    "SUPABASE DATA:",
    data
  );

  console.log(
    "SUPABASE ERROR:",
    error
  );

  if (error) {

    console.error(
      "SUPABASE ERROR:",
      error
    );

  }

  return data;
}