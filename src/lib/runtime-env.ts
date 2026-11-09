import { getRuntimeBindings } from "@/lib/db";

export function runtimeEnv(name: string): string | undefined {
  const binding = getRuntimeBindings()[name];
  return typeof binding === "string" && binding ? binding : process.env[name];
}
