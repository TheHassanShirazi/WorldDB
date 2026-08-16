import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json in the home directory makes Turbopack infer the
  // wrong workspace root. Pin it to this project so module resolution stays put.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // The dev indicator sits bottom-left, on top of the relationship legend.
  // Every corner of the graph surface is spoken for, so moving it only picks a
  // different thing to cover. Compile and runtime errors still surface.
  // Set to { position: "bottom-right" } instead if you want it back.
  devIndicators: false,
};

export default nextConfig;
