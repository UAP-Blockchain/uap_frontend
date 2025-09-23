import { combineReducers } from "@reduxjs/toolkit";
import cartSlice from "./features/cartSlice";
const rootReducer = combineReducers({
  cart: cartSlice,
});
export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
