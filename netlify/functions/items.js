// Read-only proxy to the Items table.
// Keeps the Airtable PAT server-side and strips it out of the response;
// explicitly whitelists fields so buyer info can never leak regardless of
// which records or views get queried.

const BASE_ID = "appSbGaMkszJYiyPF";
const TABLE_ID = "tbl4YoocxyXmYPjlS";
const FIELDS = [
  "Item Name",
  "Photo",
  "Description",
  "Category",
  "Price",
  "Condition",
  "Item ID",
  "Public URL",
  "Gender",
  "Status",
  "Quantity",
];

function toPhoto(attachment) {
  // Prefer generated thumbnails over the original: iPhone uploads land as
  // .heic, which Airtable's original-file url serves as-is and most browsers
  // (non-Safari) can't decode inline. Thumbnails are always re-encoded to a
  // raster format regardless of source type.
  const thumbs = attachment.thumbnails;
  const thumb = (thumbs && thumbs.large && thumbs.large.url) || attachment.url;
  const full = (thumbs && thumbs.full && thumbs.full.url) || thumb;
  return { thumb, full };
}

function toItem(record) {
  const f = record.fields;
  const photos = Array.isArray(f["Photo"]) ? f["Photo"].map(toPhoto) : [];
  return {
    id: f["Item ID"] ?? null,
    name: f["Item Name"] ?? null,
    photos,
    description: f["Description"] ?? null,
    category: f["Category"] ?? null,
    price: f["Price"] ?? null,
    condition: f["Condition"] ?? null,
    publicUrl: f["Public URL"] ?? null,
    gender: f["Gender"] ?? null,
    status: f["Status"] ?? null,
    quantity: f["Quantity"] ?? null,
  };
}

exports.handler = async (event) => {
  const pat = process.env.AIRTABLE_PAT;
  if (!pat) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server misconfigured" }) };
  }

  const id = event.queryStringParameters && event.queryStringParameters.id;

  const params = new URLSearchParams();
  FIELDS.forEach((f) => params.append("fields[]", f));
  if (id) {
    const numericId = Number(id);
    if (!Number.isInteger(numericId)) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid id" }) };
    }
    params.set("filterByFormula", `{Item ID} = ${numericId}`);
  }

  try {
    const resp = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?${params.toString()}`,
      { headers: { Authorization: `Bearer ${pat}` } }
    );
    if (!resp.ok) {
      return { statusCode: resp.status, body: JSON.stringify({ error: "Airtable request failed" }) };
    }
    const data = await resp.json();
    const items = data.records.map(toItem);

    if (id) {
      const item = items[0] || null;
      return {
        statusCode: item ? 200 : 404,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify(item),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify(items),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: "Upstream error" }) };
  }
};
