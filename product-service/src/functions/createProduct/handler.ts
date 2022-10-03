import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import * as AWS from "aws-sdk";
import Product from "@models/product";
import { APIGatewayProxyEvent } from "aws-lambda";
import { v4 } from "uuid";

const db = new AWS.DynamoDB.DocumentClient();

const putProducts = async (product: Product) =>
  await db
    .put({
      TableName: process.env.PRODUCTS_TABLE_NAME,
      Item: product,
    })
    .promise();

const createProduct = async (event: APIGatewayProxyEvent) => {
  const body = event.body as any;
  const product: Product = {
    id: v4(),
    title: body.title,
    description: body.description,
    price: body.price,
  };
  const output = await putProducts(product);
  return formatJSONResponse({ output });
};

export const main = middyfy(createProduct);
