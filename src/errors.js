// @flow
import type { ErrorCode } from "./types.flow";

export function getErrorCode(error: Error): ErrorCode {
  if (typeof error.constructor.ERROR_CODE === "string") {
    return (error.constructor.ERROR_CODE: any);
  }
  return "UNKNOWN_ERROR";
}
