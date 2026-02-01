export async function onRequest() {
  return new Response(
    JSON.stringify({ message: "Functions working ✅" }),
    { headers: { "Content-Type": "application/json" } }
  );
}
