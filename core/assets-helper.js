export function AssetGlobal() {
  const baseUrl = (process.env.BASE_URL || "").replace(/\/$/, "");

  global.asset = (filePath) => {
    const clean = filePath.replace(/^\/+/, "").replace(/^assets\//, "");
    return `${baseUrl}/assets/${clean}`;
  };
}
