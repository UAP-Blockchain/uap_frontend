import api from "../../../config/axios";

export const getProducts = () => {
  return api.get("Product");
};

export const getProductsMain = (limit: number, offset: number) => {
  return api.get(`/api/product?limit=${limit}&offset=${offset}`);
};
