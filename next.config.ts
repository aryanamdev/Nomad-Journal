import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The OpenAPI route reads this file at runtime, so ship it with the function.
  outputFileTracingIncludes: {
    "/api/v2/openapi": ["./openapi.yaml"],
  },
};

export default nextConfig;
