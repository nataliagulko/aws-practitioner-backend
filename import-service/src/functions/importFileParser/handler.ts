import { middyfy } from "@libs/lambda";
import { APIGatewayEvent } from "aws-lambda";
import { formatJSONResponse } from "../../libs/api-gateway";

const importFileParser = async (event: APIGatewayEvent) => {
  console.log("importFileParser event", event);

  return formatJSONResponse({ message: "File name was not provided" });
};

export const main = middyfy(importFileParser);
