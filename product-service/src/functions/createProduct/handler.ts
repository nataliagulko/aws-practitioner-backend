import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { APIGatewayProxyEvent } from "aws-lambda";
import { log } from "@utils/log";
import { isValidJSON } from "@utils/parse";
import { Client, ClientConfig } from "pg";

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

const createProduct = async (event: APIGatewayProxyEvent) => {
  log(event);
  const productsTableName = process.env.PRODUCTS_TABLE_NAME;
  const stocksTableName = process.env.STOCKS_TABLE_NAME;
  const client = new Client(dbOptions);

  const body: any = isValidJSON(event.body)
    ? JSON.parse(event.body)
    : event.body;

  const { title, description, price, count = 1 } = body || {};

  await client.connect();

  try {
    const {
      rows: [newProduct],
    } = await client.query(`
      INSERT INTO ${productsTableName} (title, description, price)
      VALUES ('${title}', '${description}', '${price}')
      RETURNING id
    `);

    const productId = newProduct.id;

    await client.query(`
      INSERT INTO ${stocksTableName} (product_id, count )
      VALUES ('${productId}', ${count})
    `);

    return formatJSONResponse({ id: productId });
  } catch (error) {
    return formatJSONResponse({ message: error }, 500);
  } finally {
    await client.end();
  }
};

export const main = middyfy(createProduct);
