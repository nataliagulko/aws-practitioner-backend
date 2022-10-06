import { middyfy } from "@libs/lambda";
import { SQSEvent } from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";
import { log } from "@utils/log";
import * as AWS from "aws-sdk";

const catalogBatchProcess = async (event: SQSEvent) => {
  log(event);
  const records = event.Records;

  const lambda = new AWS.Lambda();

  try {
    for (const record of records) {
      var params = {
        FunctionName: `${process.env.FUNCTION_PREFIX}-createProduct`,
        InvocationType: "Event",
        LogType: "Tail",
        Payload: record,
      };

      // TODO: product creation not working 
      // console.log("BATCH", params);
      const result = await lambda
        .invoke(params)
        .promise();

      // console.log("RESULT", result);
    }
  } catch (error) {
    return formatJSONResponse({ error });
  }

  return formatJSONResponse({ messages: "Done" });
};

export const main = middyfy(catalogBatchProcess);
