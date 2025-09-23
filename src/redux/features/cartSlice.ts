import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "../../models/CartItem";
import type { RootState } from "../RootReducer";
import type { Product } from "../../models/Product";
const cartSlice = createSlice({
  name: "cart",
  initialState: [],
  reducers: {
    addToCart: (state: CartItem[], action: PayloadAction<Product>) => {
      const index = state.findIndex((item) => item.id === action.payload.id);
      if (index === -1) {
        state.push({
          ...action.payload,
          quantity: 1,
        });
      } else {
        state[index].quantity++;
      }
    },
    changeQuantity: (
      state: CartItem[],
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const index = state.findIndex((item) => item.id === id);
      if (index !== -1) {
        state[index].quantity = quantity;
      }
    },
    remove: (state: CartItem[], action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      const index = state.findIndex((item) => item.id === id);
      if (index !== -1) {
        state.splice(index, 1);
      }
    },
    clearCart: () => [],
  },
});

export const { addToCart, clearCart, remove, changeQuantity } =
  cartSlice.actions;
export const selectCart = (store: RootState) => store.cart;
export default cartSlice.reducer;
