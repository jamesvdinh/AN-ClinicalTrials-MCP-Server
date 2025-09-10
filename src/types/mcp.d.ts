declare module '@modelcontextprotocol/sdk/server/streamable-http.js' {
    export class StreamableHTTPServerTransport {
      constructor(opts?: any);
      handleRequest(req: any, res: any, body?: any): Promise<void>;
      close(): void;
    }
  }