import type { AWS } from "@serverless/typescript";

import products from "@functions/getProductsList";
import productsById from "@functions/getProductsById";
import createProduct from "@functions/createProduct";
import catalogBatchProcess from "@functions/catalogBatchProcess";

const serverlessConfiguration: AWS = {
  service: "product-service",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    stage: "dev",
    region: "eu-west-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      PRODUCTS_TABLE_NAME: "products",
      STOCKS_TABLE_NAME: "stocks",
      FUNCTION_PREFIX: "${self:service}-${self:provider.stage}",
      SNS_ARN: {
        Ref: "SNSTopic",
      },
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["lambda:InvokeFunction", "lambda:InvokeAsync"],
            Resource: "*",
          },
          {
            Effect: "Allow",
            Action: ["sns:*"],
            Resource: {
              Ref: "SNSTopic",
            },
          },
        ],
      },
    },
  },
  resources: {
    Resources: {
      SNSTopic: {
        Type: "AWS::SNS::Topic",
        Properties: { TopicName: "createProductTopic" },
      },
      SNSSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Endpoint: "natalia_gulko1@epam.com",
          Protocol: "email",
          TopicArn: {
            Ref: "SNSTopic",
          },
        },
      },
    },
  },
  // import the function via paths
  functions: { products, productsById, createProduct, catalogBatchProcess },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
