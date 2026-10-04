import { getToken } from "../auth/tokenStore";

let unauthorizedHandler = null;

// AuthContext registers a function here that logs the user out
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

export class ApiError extends Error {
  constructor(message, status = 0, fieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function jsonBody(method, body) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

// auth: false is used by login and register, which must not send (or react to) a token
export async function request(url, options = {}, { auth = true } = {}) {
  const headers = { ...(options.headers ?? {}) };
  const token = auth ? getToken() : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch {
    throw new ApiError("Cannot reach the server. Is the backend running?");
  }

  let body = null;
  if (res.status !== 204) {
    try {
      body = await res.json();
    } catch {
      // empty or non-JSON body
    }
  }

  if (!res.ok) {
    // We sent a token and the server rejected it: it expired or is invalid, so log out
    if (res.status === 401 && token && unauthorizedHandler) {
      unauthorizedHandler();
    }
    throw new ApiError(
      body?.message || `Request failed with status ${res.status}`,
      res.status,
      body?.fieldErrors ?? {}
    );
  }
  return body;
}