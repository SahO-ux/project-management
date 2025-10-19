import NodeCache from "node-cache";

// TTL in seconds: e.g., 300s = 5 minutes
export const summarizeCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
