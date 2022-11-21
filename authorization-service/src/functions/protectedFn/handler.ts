import { middyfy } from "@libs/lambda";
import { log } from "@utils/log";
import { formatJSONResponse } from "@libs/api-gateway";

const protectedFn = (event) => {
  console.log(`***** PROTECTED FUNCTION *****`);
  log(event);

  return formatJSONResponse({ event });
};

export const main = middyfy(protectedFn);
