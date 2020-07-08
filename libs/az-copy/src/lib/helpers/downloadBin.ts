import { execSync } from "child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
} from "fs";
import { DownloaderHelper } from "node-downloader-helper";
import { join, relative, resolve } from "path";
import { cwd } from "process";
import { azCopyLog, DownloadBinError } from "./errorsAndMessages";
import { DownloadLinks, downloadPath, getDownloadLink } from "./links";

function prepareDir() {
  if (existsSync(downloadPath)) {
    readdirSync(downloadPath).map((name) => {
      unlinkSync(join(downloadPath, name));
    });
    rmdirSync(downloadPath);
  }

  mkdirSync(downloadPath);
}

function extractFile(path: string) {
  let result;
  let extractedPath;
  switch (getDownloadLink()) {
    case DownloadLinks.darwin:
    case DownloadLinks.linux:
      result = execSync(`tar -xf ${path}`, { encoding: "utf8" });
      extractedPath = path.replace(".tar", "").replace(".gz", "");
      break;
    case DownloadLinks.win32:
    case DownloadLinks.win32x64:
      result = execSync(
        `powershell -command "Expand-Archive -Path '${path}' -DestinationPath '${downloadPath}'"`,
        { encoding: "utf8" }
      );
      extractedPath = path.replace(".zip", "");
  }

  if (existsSync(path)) {
    unlinkSync(path);
  }

  if (existsSync(resolve(`${extractedPath}`, "azcopy.exe"))) {
    copyFileSync(resolve(`${extractedPath}`, "azcopy.exe"), downloadPath);
  }

  rmdirSync(extractedPath);

  return result;
}

export function downloadBinaries(url: string) {
  return new Promise((resolve, reject) => {
    prepareDir();
    const dl = new DownloaderHelper(url, downloadPath);

    dl.on("end", (info) => {
      const filePath = relative(cwd(), info.filePath);
      console.log(azCopyLog(`${filePath} - download complete`));

      extractFile(filePath);

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
