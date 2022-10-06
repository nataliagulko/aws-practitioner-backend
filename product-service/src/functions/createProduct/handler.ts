import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import * as AWS from "aws-sdk";
import Product from "@models/product";
import Stock from "@models/stock";
import { APIGatewayProxyEvent } from "aws-lambda";
import { v4 } from "uuid";
import { log } from "@utils/log";
import { isValidJSON } from "@utils/parse";

const db = new AWS.DynamoDB.DocumentClient();

const putProduct = async (product: Product) =>
  await db
    .put({
      TableName: process.env.PRODUCTS_TABLE_NAME,
      Item: product,
    })
    .promise();

const putStockProduct = async (stockProduct: Stock) =>
  await db
    .put({
      TableName: process.env.STOCKS_TABLE_NAME,
      Item: stockProduct,
    })
    .promise();

const createProduct = async (event: APIGatewayProxyEvent) => {
  log(event);

  try {
    const productId = v4();
    const body: any = isValidJSON(event.body)
      ? event.body
      : JSON.stringify(event.body);

    const product: Product = {
      id: productId,
      title: body.title,
      description: body.description,
      price: body.price,
    };
    const stockProduct: Stock = {
      product_id: productId,
      count: body.count || 1,
    };

    await putProduct(product);
    await putStockProduct(stockProduct);

    return formatJSONResponse({ id: productId });
  } catch (error) {
    return formatJSONResponse(
      {
        message: error,
      },
      500
    );
  }
};

export const main = middyfy(createProduct);
