import { RequestHandler } from "express";

export interface DemoResponse {
  message: string;
  timestamp: string;
}

export const handleDemo: RequestHandler = (req, res) => {
  const response: DemoResponse = {
    message: "Hello from the fuel dashboard API!",
    timestamp: new Date().toISOString(),
  };
  res.json(response);
};
