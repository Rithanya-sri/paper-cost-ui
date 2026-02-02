export const onRequestGet = async () => {
  return new Response(
    JSON.stringify({ message: "Paper cost API working" }),
    {
      headers: { "Content-Type": "application/json" }
    }
  );
};
