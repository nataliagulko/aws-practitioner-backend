import type { AWS } from "@serverless/typescript";

import products from "@functions/getProductsList";
import productsById from "@functions/getProductsById";
import createProduct from "@functions/createProduct";
import catalogBatchProcess from "@functions/catalogBatchProcess";
import * as dotenv from "dotenv";

dotenv.config();

const serverlessConfiguration: AWS = {
  service: "product-service",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild", "serverless-offline"],
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
      PG_HOST: "made-in-abyss.cozgbuzuobfe.eu-west-1.rds.amazonaws.com",
      PG_PORT: "5432",
      PG_DATABASE: "shop",
      PG_USERNAME: process.env.DB_USERNAME,
      PG_PASSWORD: process.env.DB_PASSWORD,
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
  useDotenv: true,
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
      exclude: ["aws-sdk", "pg-native"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
