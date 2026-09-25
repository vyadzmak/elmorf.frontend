import type { ElmorfApiErrorBody } from "@elmorf/domain";

export class ElmorfApiError extends Error {
  readonly code: string;
  readonly status: number | undefined;
  readonly details: unknown;
  readonly requestId: string | undefined;
  readonly retryable: boolean;

  constructor(body: ElmorfApiErrorBody) {
    super(body.message ?? body.code);
    this.name = "ElmorfApiError";
    this.code = body.code;
    this.status = body.status;
    this.details = body.details;
    this.requestId = body.requestId;
    this.retryable = body.retryable;
  }
}

const retryableStatuses = new Set([408, 429, 500, 502, 503, 504]);

export function isRetryableStatus(status: number): boolean {
  return retryableStatuses.has(status);
}
