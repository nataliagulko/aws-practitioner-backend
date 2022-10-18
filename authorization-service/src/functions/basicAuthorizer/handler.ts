import { middyfy } from "@libs/lambda";
import { log } from "@utils/log";
import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerHandler,
} from "aws-lambda";

const basicAuthorizer: APIGatewayTokenAuthorizerHandler = (
  event,
  _,
  callback
) => {
  log(event);
  console.log("callback", callback);

  if (event.type !== "TOKEN") {
    callback("Unauthorized");
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

    callback(null, policy);
  } catch (error) {
    callback("Unauthorized");
  }
};

export const main = middyfy(basicAuthorizer);
