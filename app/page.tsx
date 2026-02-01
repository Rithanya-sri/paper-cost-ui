"use client";
import { useState } from "react";

export default function Home() {
  const [paperUsed, setPaperUsed] = useState("");
  const [output, setOutput] = useState("");
  const [cost, setCost] = useState<number | null>(null);

  const calculateCost = async () => {
    const res = await fetch("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paperUsed,
        output,
      }),
    });

    const data = await res.json();
    setCost(data.paperCost);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Paper Cost Calculator</h2>

      <input
        placeholder="Paper used (kg)"
        value={paperUsed}
        onChange={(e) => setPaperUsed(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Production output"
        value={output}
        onChange={(e) => setOutput(e.target.value)}
      />
      <br /><br />

      <button onClick={calculateCost}>Calculate</button>

      {cost !== null && <h3>Paper Cost: ₹{cost}</h3>}
    </div>
  );
}
