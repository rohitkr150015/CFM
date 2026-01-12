const BASE_URL = "http://localhost:8080";

export const authFetch = async (
  url: string,
  options: RequestInit = {}
) => {
  const authStr = localStorage.getItem("courseflow_auth");

  if (!authStr) {
    throw new Error("AUTH_MISSING");
  }

  const auth = JSON.parse(authStr);

  if (!auth.token) {
    throw new Error("TOKEN_MISSING");
  }

  const finalUrl = url.startsWith("http")
    ? url
    : `${BASE_URL}${url}`;

  return fetch(finalUrl, {
    ...options,
    headers: {
      "Authorization": `Bearer ${auth.token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
};
