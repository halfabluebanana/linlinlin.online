// Read-only proxy to the "Public Listing" Airtable view.
// Keeps the Airtable PAT server-side and strips it out of the response;
// explicitly whitelists fields so buyer info can never leak even if the
// view's hidden-fields config changes.

const BASE_ID = "appSbGaMkszJYiyPF";
const TABLE_ID = "tbl4YoocxyXmYPjlS";
const VIEW_ID = "viwYWCNk9uoTBAsfR"; // Public Listing
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
];

function toItem(record) {
  const f = record.fields;
  const photo = Array.isArray(f["Photo"]) && f["Photo"][0] ? f["Photo"][0].url : null;
  return {
    id: f["Item ID"] ?? null,
    name: f["Item Name"] ?? null,
    photo,
    description: f["Description"] ?? null,
    category: f["Category"] ?? null,
    price: f["Price"] ?? null,
    condition: f["Condition"] ?? null,
    publicUrl: f["Public URL"] ?? null,
    gender: f["Gender"] ?? null,
  };
}

exports.handler = async (event) => {
  const pat = process.env.AIRTABLE_PAT;
  if (!pat) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server misconfigured" }) };
  }

  const id = event.queryStringParameters && event.queryStringParameters.id;

  const params = new URLSearchParams();
  params.set("view", VIEW_ID);
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
