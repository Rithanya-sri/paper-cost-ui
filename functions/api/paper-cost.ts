export const onRequestGet = async () => {
  return new Response(
    JSON.stringify({
      success: true,
      message: "Paper cost API working ✅"
    }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
};
