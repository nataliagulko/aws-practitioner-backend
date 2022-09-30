import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { PRODUCTS_MOCK } from "./mock";

import schema from "./schema";

const getProductList: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async () => {
  return formatJSONResponse({
    products: PRODUCTS_MOCK,
  });
};

export const main = middyfy(getProductList);
