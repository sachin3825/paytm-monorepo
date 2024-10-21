"use client";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Center } from "@repo/ui/center";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";
import { p2pTransfer } from "../app/lib/actions/p2pTransfer";

export function SendCard({
  refreshTransactions,
}: {
  refreshTransactions: () => Promise<void>;
}) {
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleSend = async () => {
    const result = await p2pTransfer(number, Number(amount) * 100);
    setMessage(result.message); // Display success/failure message
    if (result.success) {
      await refreshTransactions(); // Refresh the transaction history on success
    }
  };

  return (
    <div className="w-maxContent mx-auto">
      <Card title="Send">
        <div className="min-w-72 pt-2">
          <TextInput
            placeholder={"Number"}
            label="Number"
            onChange={(value) => setNumber(value)}
          />
          <TextInput
            placeholder={"Amount"}
            label="Amount"
            onChange={(value) => setAmount(value)}
          />
          <div className="pt-4 flex justify-center">
            <Button onClick={handleSend}>Send</Button>
          </div>
          {message && <div className="pt-4 text-center">{message}</div>}
        </div>
      </Card>
    </div>
  );
}
