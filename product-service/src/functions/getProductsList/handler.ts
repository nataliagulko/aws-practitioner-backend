import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import * as AWS from "aws-sdk";

const db = new AWS.DynamoDB.DocumentClient();

const scanProducts = async () =>
  await db
    .scan({
      TableName: process.env.PRODUCTS_TABLE_NAME,
    })
    .promise();

const scanStocks = async () =>
  await db
    .scan({
      TableName: process.env.STOCKS_TABLE_NAME,
    })
    .promise();

const getProductList = async () => {
  const { Items: products = [] } = await scanProducts();
  const { Items: stocks = [] } = await scanStocks();
  const result = products?.map((p) => ({
    ...p,
    count: stocks?.find((s) => s.product_id === p.id)?.count || 0,
  }));

  return formatJSONResponse({
    products: result,
  });
};

export const main = middyfy(getProductList);
