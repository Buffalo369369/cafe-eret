import { create } from "zustand";

import { persist } from "zustand/middleware";

type CheckoutForm = {

  name: string;

  phone: string;

  email: string;

  street: string;

  zip: string;

  city: string;

  comment: string;

};

type CheckoutStore = {

  form: CheckoutForm;

  setForm: (

    form: Partial<CheckoutForm>

  ) => void;

  clearForm: () => void;

};

export const useCheckout =

  create<CheckoutStore>()(

    persist(

      (set) => ({

        form: {

          name: "",

          phone: "",

          email: "",

          street: "",

          zip: "",

          city: "",

          comment: "",

        },

        setForm: (values) =>

          set((state) => ({

            form: {

              ...state.form,

              ...values,

            },

          })),

        clearForm: () =>

          set({

            form: {

              name: "",

              phone: "",

              email: "",

              street: "",

              zip: "",

              city: "",

              comment: "",

            },

          }),

      }),

      {

        name: "checkout-storage",

      }

    )

  );