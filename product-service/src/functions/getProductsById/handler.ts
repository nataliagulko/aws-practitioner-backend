import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { APIGatewayEvent } from "aws-lambda";
import { Client, ClientConfig } from "pg";
import { log } from "@utils/log";

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;

const dbOptions: ClientConfig = {
  host: PG_HOST,
  port: Number(PG_PORT),
  database: PG_DATABASE,
  user: PG_USERNAME,
  password: PG_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 5000,
};

const getProductsById = async (event: APIGatewayEvent) => {
  log(event);
  const id = String(event.pathParameters.productId);
  const productsTableName = process.env.PRODUCTS_TABLE_NAME;
  const stocksTableName = process.env.STOCKS_TABLE_NAME;
  const client = new Client(dbOptions);

  await client.connect();

  try {
    const {
      rows: [product],
    } = await client.query(`
      select p.id, p.title, p.description, p.price, s.count
      from ${productsTableName} p
      join ${stocksTableName} s
      on p.id = s.product_id
      where p.id = '${id}'
    `);
    return formatJSONResponse({ ...product });
  } catch (error) {
    return formatJSONResponse({ message: error });
  }
};

export const main = middyfy(getProductsById);
