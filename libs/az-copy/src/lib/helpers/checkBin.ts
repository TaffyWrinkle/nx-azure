import { existsSync, readdirSync } from "fs";
import { downloadPath } from "./links";

export function getBinaryPath() {
  if (existsSync(downloadPath)) {
    const contents = readdirSync(downloadPath, { encoding: "utf8" });
    for (const item of contents) {
      if (/azcopy/.test(item)) {
        return item;
      }
    }
    return undefined;
  } else {
    return undefined;
  }
}
