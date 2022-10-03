import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { APIGatewayEvent } from "aws-lambda";
import * as AWS from "aws-sdk";

const db = new AWS.DynamoDB.DocumentClient();

const getProduct = async (id: string) =>
  await db
    .get({
      TableName: process.env.PRODUCTS_TABLE_NAME,
      Key: {
        id,
      },
    })
    .promise();

const getStockProduct = async (id: string) =>
  await db
    .get({
      TableName: process.env.STOCKS_TABLE_NAME,
      Key: {
        product_id: id,
      },
    })
    .promise();

const getProductsById = async (event: APIGatewayEvent) => {
  const id = String(event.pathParameters.productId);
  const { Item: product = {} } = await getProduct(id);
  const { Item: stockProduct = {} } = await getStockProduct(id);
  return formatJSONResponse({ ...product, count: stockProduct.count });
};

export const main = middyfy(getProductsById);
