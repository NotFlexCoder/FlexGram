const dbUrl = () => {
  const url = process.env.FIREBASE_URL?.replace(/\$/, "");
  if (!url) throw new Error("FIREBASE_URL is not set");
  return url;
};

const dbSecret = () => {
  const url = process.env.FIREBASE_SECRET;
  if (!url) throw new Error("FIREBASE_SECRET is not set");
  return url;
};

function clearURL(path) {
  return path
    .split("/")
    .map((seg) => seg.replace(/[.#$[\]]/g, "_"))
    .join("/");
}

function endPoint(path) {
  return `${dbUrl()}/${clearURL(path)}.json?auth=${dbSecret()}`;
}

export async function setDB(path, value) {
  const res = await fetch(endPoint(path), {
    method: "PUT",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(value),
  });

  if (!res.ok)
    throw new Error(`FIREBASE SETDB ${res.status} : ${await res.text()}`);
}

export async function getDB(path) {
  const res = await fetch(endPoint(path));
  if (!res.ok)
    throw new Error(`FIREBASE GETDB ${res.status} : ${await res.text()}`);
  return await res.json();
}

export async function updateDB(path, value) {
  const res = await fetch(endPoint(path), {
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(value),
  });
  if (!res.ok)
    throw Error(`FIREBASE UPDATE ${res.status} : ${await res.text()}`);
}

export async function deleteDB(path, value) {
  const res = await fetch(endPoint(path), {
    method: "DELETE",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(value),
  });
  if (!res.ok)
    throw new Error(`FIREBASE DELETE ${res.status} : ${await res.text()}`);
}

export async function pushDB(path, value) {
  const res = await fetch(endPoint(path), {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(value),
  });
  if (!res.ok)
    throw new Error(`FIREBASE DELETE ${res.status} : ${await res.text()}`);
  return res.json();
}
