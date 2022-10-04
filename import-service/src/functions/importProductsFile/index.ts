import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "import",
        cors: true,
        request: { parameters: { paths: { name: true } } },
      },
    },
    // {
    //   s3: {
    //     bucket: "${self:custom.bucketName}",
    //     event: "s3:ObjectCreated:*",
    //     rules: [
    //       {
    //         prefix: process.env.CATALOG_PREFIX,
    //       },
    //     ],
    //     existing: true,
    //   },
    // },
  ],
};
