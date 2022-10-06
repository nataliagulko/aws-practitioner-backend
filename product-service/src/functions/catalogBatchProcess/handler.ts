import { middyfy } from "@libs/lambda";
import { SQSEvent } from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";
import { log } from "@utils/log";

const catalogBatchProcess = async (event: SQSEvent) => {
  log(event);

  const records = event.Records;

  try {
    for (const record of records) {
      console.log("Message Body -->  ", record.body);
    }
  } catch (error) {
    return formatJSONResponse({ error });
  }

  return formatJSONResponse({ messages: "Done" });
};

export const main = middyfy(catalogBatchProcess);
