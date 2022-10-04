import { middyfy } from "@libs/lambda";
import { APIGatewayEvent } from "aws-lambda";
import * as AWS from "aws-sdk";

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
  });
};

const importProductsFile = async (event: APIGatewayEvent) => {
  const name = String(event.pathParameters.name);
  console.log("importProductsFile name", name);
  const url = await getSignedURL(process.env.IMPORT_BUCKET, name, 3600);
  console.log("importProductsFile url", url);
  return url;
};

export const main = middyfy(importProductsFile);
