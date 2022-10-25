import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { PRODUCTS_MOCK } from "@mocks/products";
import { APIGatewayEvent } from "aws-lambda";

const getProductsById = async (event: APIGatewayEvent) =>
  formatJSONResponse({
    product: PRODUCTS_MOCK.find(
      (product) => product.id === Number(event.pathParameters.productId)
    ),
  });

export const main = middyfy(getProductsById);
