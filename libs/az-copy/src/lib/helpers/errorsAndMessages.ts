export const APP_ERROR = "[azCopy]";

export function azCopyLog(logMessage: string) {
  return `${APP_ERROR}: ${logMessage}`;
}

enum Errors {
  DownloadBinError = "DownloadBinError",
}

export class AzcopyError extends Error {
  constructor(message: string) {
    super(azCopyLog(message));
  }
}

export class DownloadBinError extends AzcopyError {
  constructor(message: string) {
    super(`[${Errors.DownloadBinError}]${message}`);
  }
}
