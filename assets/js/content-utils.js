const SITE_PATH_PREFIX = window.location.pathname.includes("/projects/")
  || window.location.pathname.includes("/journal/")
  ? "../"
  : "";

async function fetchJson(path) {
  try {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("JSON load error:", error);
    return [];
  }
}

async function fetchHtml(path) {
  try {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error("HTML load error:", error);
    return "";
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeAssetPath(path, fallback = "") {
  if (!path) return fallback;

  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }

  if (path.startsWith("assets/")) {
    return `${SITE_PATH_PREFIX}${path}`;
  }

  return path;
}
