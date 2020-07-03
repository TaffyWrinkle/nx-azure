import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmdirSync,
  unlinkSync,
} from "fs";
import { DownloaderHelper } from "node-downloader-helper";
import { join, relative } from "path";
import { cwd } from "process";
import { unzipSync } from "zlib";
import { azCopyLog, DownloadBinError } from "./errorsAndMessages";
import { downloadPath } from "./links";

function prepareDir() {
  readdirSync(downloadPath).map((name) => {
    unlinkSync(join(downloadPath, name));
  });
  rmdirSync(downloadPath);

  mkdirSync(downloadPath);
}

export function downloadBinaries(url: string) {
  return new Promise((resolve, reject) => {
    prepareDir();
    const dl = new DownloaderHelper(url, downloadPath);

    dl.on("end", (info) => {
      const filePath = relative(cwd(), info.filePath);
      console.log(azCopyLog(`${filePath} - download complete`));

      unzipSync(readFileSync(filePath));
      resolve(filePath);
    });

    dl.on("error", (error) => {
      const errorObject = new DownloadBinError(error.message);
      console.error(errorObject);
      reject(errorObject);
    });
    dl.start();
  });
}
