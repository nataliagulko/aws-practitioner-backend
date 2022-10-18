import { middyfy } from "@libs/lambda";
import { log } from "@utils/log";
import {
  APIGatewayAuthorizerHandler,
  APIGatewayAuthorizerResult,
} from "aws-lambda";

const basicAuthorizer: APIGatewayAuthorizerHandler = async (event) => {
  log(event);

  if (event.type !== "TOKEN") {
    throw new Error("Unauthorized");
  }

  try {
    var credentials = event.authorizationToken.split(" ")[1];
    var [username, password] = Buffer.from(credentials, "base64")
      .toString("utf-8")
      .split(":");

    const storedPassword = process.env[username];
    const effect =
      storedPassword && storedPassword === password ? "Allow" : "Deny";
    const policy: APIGatewayAuthorizerResult = {
      principalId: credentials,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: effect,
            Action: "execute-api:Invoke",
            Resource: [event.methodArn],
          },
        ],
      },
    };

    return policy;
  } catch (error) {
    throw new Error("Unauthorized");
  }
};

export const main = middyfy(basicAuthorizer);
