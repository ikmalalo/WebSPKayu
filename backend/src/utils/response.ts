import {
  Response,
} from 'express'


// ============================================================
// SUCCESS RESPONSE
// ============================================================

export function success(
  res: Response,
  message: string,
  data: Record<string, any> = {},
  statusCode: number = 200
) {
  return res.status(
    statusCode
  ).json({
    success: true,

    message,

    data,
  })
}


// ============================================================
// FAIL RESPONSE
// ============================================================

export function fail(
  res: Response,
  message: string,
  statusCode: number = 400,
  errors: any = null
) {
  return res.status(
    statusCode
  ).json({
    success: false,

    message,

    ...(errors
      ? {
          errors,
        }
      : {}),
  })
}