export function successResponse<T>(data: T) {
  return Response.json({ success: true, data });
}

export function errorResponse(error: string, status = 400) {
  return Response.json({ success: false, error }, { status });
}
