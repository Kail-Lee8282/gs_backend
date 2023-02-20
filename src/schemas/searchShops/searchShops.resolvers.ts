import { State } from "../common.resolvers";

export type ProductShop = {
  isAd?: boolean;
  productTitle: string;
  productId: string;
  imgUrl: string;
  productUrl: string;
  reviewCount: number;
  purchaseCount: number;
  price: number;
  mallName: string;
  selseStart: string;
  id: string;
};

export type SearchShopsParam = {
  keyword: string;
  page?: number;
};

export type SearchShopsResult = {
  state: State;
  result?: ProductShop[];
};
