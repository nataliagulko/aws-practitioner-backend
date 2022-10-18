import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { log } from "@utils/log";
import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";

const basicAuthorizer = async (
  event: APIGatewayTokenAuthorizerEvent,
  _,
  cb
) => {
  log(event);

  if (event.type !== "TOKEN") {
    cb("Unauthorized");
  }

  try {
    var credentials = event.authorizationToken.split(" ")[1];
    var [username, password] = Buffer.from(credentials, "base64")
      .toString("utf-8")
      .split(":");

    console.log("USERNAME", username);

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

    cb(null, policy);
  } catch (error) {
    cb("Unauthorized");
  }
};

export const main = middyfy(basicAuthorizer);
