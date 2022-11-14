import { middyfy } from "@libs/lambda";
import { APIGatewayEvent } from "aws-lambda";
import { formatJSONResponse } from "../../libs/api-gateway";
import * as AWS from "aws-sdk";
import { log } from "@utils/log";
import { parseStream } from "@fast-csv/parse";
import Product from "@models/product";

const s3Client = new AWS.S3();

const sendDataToQueue = async (product: Product) => {
  const sqs = new AWS.SQS();

  try {
    await sqs
      .sendMessage(
        {
          QueueUrl: process.env.SQS_URL,
          MessageBody: JSON.stringify(product),
        },
        (error) => {
          if (error) {
            throw error;
          }
        }
      )
      .promise();
  } catch (error) {
    return formatJSONResponse({ messages: error });
  }
};

const readCsvFile = async (stream) =>
  new Promise(() => {
    parseStream(stream, { headers: true })
      .on("data-invalid", (_, rowNumber, error) => {
        console.error(`Invalid batch row ${rowNumber}:`, error);
      })
      .on("data", async (line: Product) => {
        if (line) {
          console.info("Data: " + JSON.stringify(line));
          await sendDataToQueue(line);
        }
      })
      .on("end", () => {
        console.info("End of Stream");
      })
      .on("error", (error) => {
        throw error;
      });
  });

const readFile = async (bucket: string, key: string) => {
  try {
    const stream = await s3Client
      .getObject({
        Bucket: bucket,
        Key: key,
      })
      .createReadStream();

    await readCsvFile(stream);
  } catch (error) {
    return formatJSONResponse({ error });
  }
};

const deleteFile = async (bucket: string, key: string) => {
  try {
    await s3Client
      .deleteObject(
        {
          Bucket: bucket,
          Key: key,
        },
        (error) => {
          if (error) {
            console.error("On delete error:\n");
            throw error;
          }
        }
      )
      .promise();
  } catch (error) {
    return formatJSONResponse({ error });
  }
};

const copyFile = async (bucket: string, key: string, newKey: string) => {
  try {
    await s3Client
      .copyObject(
        {
          Bucket: bucket,
          CopySource: `${bucket}/${key}`,
          Key: newKey,
        },
        (error) => {
          if (error) {
            console.error("On copy error:\n");
            throw error;
          }
        }
      )
      .promise();
  } catch (error) {
    return formatJSONResponse({ error });
  }
};

const importFileParser = async (event: APIGatewayEvent) => {
  log(event);
  const records = (event as any).Records;

  for (const record of records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
    const newKey = key.replace(
      process.env.CATALOG_PREFIX,
      process.env.PARSED_CATALOG_PREFIX
    );

    await copyFile(bucket, key, newKey);
    await deleteFile(bucket, key);
    await readFile(bucket, newKey);
  }

  return formatJSONResponse({ message: "Files were moved successfully" });
};

export const main = middyfy(importFileParser);
