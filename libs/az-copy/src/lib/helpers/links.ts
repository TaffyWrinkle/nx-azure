import { join, sep } from "path";

enum DownloadLinks {
  win32x64 = "https://aka.ms/downloadazcopy-v10-windows",
  win32 = "https://aka.ms/downloadazcopy-v10-windows-32bit",
  linux = "https://aka.ms/downloadazcopy-v10-linux",
  darwin = "https://aka.ms/downloadazcopy-v10-mac",
}

export const downloadPath = join(...__filename.split(sep).slice(0, -1), "bin/");

export function getDownloadLink() {
  switch (process.platform) {
    case "darwin":
      return DownloadLinks.darwin;
    case "linux":
    case "freebsd":
    case "openbsd":
      return DownloadLinks.linux;
    case "win32":
      switch (process.arch) {
        case "x64":
          return DownloadLinks.win32x64;
        case "x32":
          return DownloadLinks.win32;
        default:
          return undefined;
      }
    default:
      return undefined;
  }
}
