import { middyfy } from "@libs/lambda";
import { APIGatewayEvent } from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";
import * as AWS from "aws-sdk";
import { log } from "@utils/log";

const s3Client = new AWS.S3();

const getSignedURL = async (
  bucket: string,
  fileName: string,
  expirySeconds: number
) => {
  return s3Client.getSignedUrl("putObject", {
    Bucket: bucket,
    Key: `${process.env.CATALOG_PREFIX}${fileName}`,
    Expires: expirySeconds,
    ContentType: "text/csv",
  });
};

const importProductsFile = async (event: APIGatewayEvent) => {
  log(event);
  const name: string | undefined = event.queryStringParameters?.name;
  if (name) {
    const url = await getSignedURL(process.env.IMPORT_BUCKET, name, 60);
    return formatJSONResponse({ url });
  }

  return formatJSONResponse({ message: "File name was not provided" });
};

export const main = middyfy(importProductsFile);
