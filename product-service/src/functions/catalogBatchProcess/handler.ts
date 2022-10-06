import { middyfy } from "@libs/lambda";
import { SQSEvent } from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";
import { log } from "@utils/log";
import { isValidJSON } from "@utils/parse";
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
        (error) => {
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

const catalogBatchProcess = async (event: SQSEvent) => {
  log(event);

  const lambda = new AWS.Lambda();
  const records = event.Records;

  try {
    for (const record of records) {
      const params: InvocationRequest = {
        FunctionName: `${process.env.FUNCTION_PREFIX}-createProduct`,
        InvocationType: "Event",
        LogType: "Tail",
        Payload: isValidJSON(record) ? record : JSON.stringify(record),
      };

      await lambda
        .invoke(params, async (error) => {
          if (error) {
            throw error;
          }

          await sendNotification(records.length);
        })
        .promise();
    }
  } catch (error) {
    return formatJSONResponse({ error });
  }

  return formatJSONResponse({ message: "Completed successfully" });
};

export const main = middyfy(catalogBatchProcess);
