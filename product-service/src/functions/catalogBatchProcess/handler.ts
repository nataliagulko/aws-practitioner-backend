import { middyfy } from "@libs/lambda";
import { SQSEvent, SQSRecord } from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";
import { log } from "@utils/log";
import * as AWS from "aws-sdk";
import { InvocationRequest } from "aws-sdk/clients/lambda";

const sendNotification = async (count: number) => {
  const sns = new AWS.SNS();

  try {
    await sns
      .publish(
        {
          Subject: "Product creation succeed",
          Message: ` ${count} products were created`,
          TopicArn: process.env.SNS_ARN,
        },
        (error, data) => {
          if (error) {
            throw error;
          }
        }
      )
      .promise();
  } catch (error) {
    return formatJSONResponse({ error });
  }
};

const createProducts = async (records: SQSRecord[]) => {
  const lambda = new AWS.Lambda();

  try {
    for (const record of records) {
      var params: InvocationRequest = {
        FunctionName: `${process.env.FUNCTION_PREFIX}-createProduct`,
        InvocationType: "Event",
        LogType: "Tail",
        Payload: JSON.stringify(record),
      };

      await lambda
        .invoke(params, function (error) {
          if (error) {
            throw error;
          }
        })
        .promise();
    }
  } catch (error) {
    return formatJSONResponse({ error });
  }
};

const catalogBatchProcess = async (event: SQSEvent) => {
  log(event);

  const records = event.Records;

  await createProducts(records);
  await sendNotification(records.length);

  return formatJSONResponse({ message: "Completed successfully" });
};

export const main = middyfy(catalogBatchProcess);
