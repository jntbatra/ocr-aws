import {
  TextractClient,
  AnalyzeExpenseCommand,
} from "@aws-sdk/client-textract";
import config from "../config.js";

const client = new TextractClient({ region: config.region });

export const analyzeReceipt = async (bucket, key) => {
  const command = new AnalyzeExpenseCommand({
    Document: {
      S3Object: {
        Bucket: bucket,
        Name: key,
      },
    },
  });

  const response = await client.send(command);
  return response;
};
