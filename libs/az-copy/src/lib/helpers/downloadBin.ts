import { execSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, rmdirSync, unlinkSync } from "fs";
import { DownloaderHelper } from "node-downloader-helper";
import { join, relative, resolve } from "path";
import { cwd } from "process";
import { azCopyLog, DownloadBinError } from "./errorsAndMessages";
import { DownloadLinks, downloadPath, getDownloadLink } from "./links";

function removeRecursive(path: string) {
  if (existsSync(path)) {
    readdirSync(path).map((name) => {
      unlinkSync(join(path, name));
    });
    rmdirSync(path);
  }
}

function prepareDir() {
  removeRecursive(downloadPath);
  mkdirSync(downloadPath);
}

function processFile(path: string) {
  let result: string;
  let extractedPath: string;

  switch (getDownloadLink()) {
    case DownloadLinks.darwin:
    case DownloadLinks.linux:
      result = execSync(`tar -xf ${path}`, { encoding: "utf8" });
      extractedPath = path.replace(".tar", "").replace(".gz", "");
      // Copy azcopy exec file into bin
      break;
    case DownloadLinks.win32:
    case DownloadLinks.win32x64:
      result = execSync(
        `powershell -command "Expand-Archive -Path '${path}' -DestinationPath '${downloadPath}'"`,
        { encoding: "utf8" }
      );
      extractedPath = path.replace(".zip", "");
      if (existsSync(resolve(`${extractedPath}`, "azcopy.exe"))) {
        execSync(
          `powershell -command "cp '${resolve(
            `${extractedPath}`,
            "azcopy.exe"
          )}' '${downloadPath}'"`
        );
      }
  }

  if (existsSync(path)) {
    unlinkSync(path);
  }

  if (existsSync(resolve(`${extractedPath}`, "azcopy.exe"))) {
    execSync(
      `powershell -command "cp '${resolve(
        `${extractedPath}`,
        "azcopy.exe"
      )}' '${downloadPath}'"`
    );
  }

  removeRecursive(extractedPath);

  return result;
}

export function downloadBinaries(url: string) {
  return new Promise((resolve, reject) => {
    prepareDir();
    const dl = new DownloaderHelper(url, downloadPath);

    dl.on("end", (info) => {
      const filePath = relative(cwd(), info.filePath);
      console.log(azCopyLog(`${filePath} - download complete`));

      processFile(filePath);

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
