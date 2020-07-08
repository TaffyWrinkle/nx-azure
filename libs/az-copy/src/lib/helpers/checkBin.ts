import { existsSync, readdirSync } from "fs";
import { resolve } from "path";
import { downloadPath } from "./links";

export function getBinaryPath() {
  if (existsSync(downloadPath)) {
    const contents = readdirSync(downloadPath, { encoding: "utf8" });
    for (const item of contents) {
      if (/azcopy/.test(item)) {
        return resolve(downloadPath, item);
      }
    }
    return undefined;
  } else {
    return undefined;
  }
}
