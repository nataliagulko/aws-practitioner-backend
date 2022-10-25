import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { PRODUCTS_MOCK } from "@mocks/products";

const getProductList = async () => formatJSONResponse({
  products: PRODUCTS_MOCK,
});

export const main = middyfy(getProductList);
