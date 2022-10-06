import { middyfy } from "@libs/lambda";
import { SQSEvent } from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";
import { log } from "@utils/log";
import * as AWS from "aws-sdk";
import { InvocationRequest } from "aws-sdk/clients/lambda";

const catalogBatchProcess = async (event: SQSEvent) => {
  log(event);
  const records = event.Records;

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

  return formatJSONResponse({ messages: "Done" });
};

export const main = middyfy(catalogBatchProcess);
