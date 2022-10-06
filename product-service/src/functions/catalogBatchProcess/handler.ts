import { middyfy } from "@libs/lambda";
import { APIGatewayProxyHandler } from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";
import * as AWS from "aws-sdk";
import { log } from "@utils/log";

const catalogBatchProcess: APIGatewayProxyHandler = async (event) => {
  log(event);
  const sqs = new AWS.SQS();
  const messages = event.body;

  console.log(messages);

  try {
    // sqs.sendMessage(
    //   {
    //     QueueUrl: process.env.SQS_URL,
    //     MessageBody: messages,
    //   },
    //   (error) => {
    //     if (error) {
    //       throw error;
    //     }
    //   }
    // );
  } catch (error) {
    return formatJSONResponse({ messages: error });
  }

  return formatJSONResponse({ messages: "Done" });
};

export const main = middyfy(catalogBatchProcess);
