import { execFile } from "child_process";
import { getBinaryPath } from "./helpers/checkBin";
import { downloadBinaries } from "./helpers/downloadBin";
import { AzcopyError, DownloadBinError } from "./helpers/errorsAndMessages";
import { getDownloadLink } from "./helpers/links";

export function azCopy(): string {
  return "az-copy";
}

export async function azcopy() {
  const binPath = getBinaryPath();
  if (binPath) {
    return new Promise((resolve, reject) => {
      execFile(
        binPath,
        process.argv,
        {
          encoding: "utf8",
        },
        (error, stdout, stderr) => {
          process.stdout.write(stdout);
          process.stderr.write(stderr);
          reject(new AzcopyError(error.message));
        }
      );
    });
  } else {
    try {
      const url = getDownloadLink();
      await downloadBinaries(url);
    } catch (error) {
      if (error instanceof DownloadBinError) {
        console.error(error.message);
      }
    }
  }
}
