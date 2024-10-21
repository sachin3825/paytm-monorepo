import React from "react";
import { Card } from "@repo/ui/card";
interface P2PTransaction {
  id: number;
  amount: number;
  timestamp: Date;
  type: "Credit" | "Debit";
  user: string;
}

interface P2PTransactionsProps {
  transactions: { sent: P2PTransaction[]; received: P2PTransaction[] };
}

export const P2PTransactions: React.FC<P2PTransactionsProps> = ({
  transactions,
}) => {
  const allTransactions = [...transactions.sent, ...transactions.received].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card title="P2P Transactions">
      <div className="flex flex-col gap-2 overflow-auto w-full  mt-2">
        {allTransactions.map((txn) => (
          <div key={txn.id} className="border p-4 rounded-lg">
            <div>
              <span
                className={`font-bold ${txn.type === "Credit" ? "text-red-700" : "text-green-800"}`}
              >
                {txn.type}
              </span>{" "}
              - {txn.user}
            </div>
            <div>Amount: ₹{txn.amount / 100}</div>
            <div>Date: {new Date(txn.timestamp).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};
