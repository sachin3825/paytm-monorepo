"use client";
import { SendCard } from "../../../components/SendCard";
import { getP2PTransactions, p2pTransfer } from "../../lib/actions/p2pTransfer";
import { useState, useEffect } from "react";
import { P2PTransactions } from "../../../components/P2PTransactions";
export default function P2PTransferPage() {
  const [transactions, setTransactions] = useState<{
    sent: any[];
    received: any[];
  }>({
    sent: [],
    received: [],
  });

  const fetchTransactions = async () => {
    const newTransactions = await getP2PTransactions();
    setTransactions(newTransactions);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="w-screen p-5 flex flex-col gap-10  ">
      <SendCard refreshTransactions={fetchTransactions} />
      <div className="w-10/12 mx-auto">
        {" "}
        <P2PTransactions transactions={transactions} />
      </div>
    </div>
  );
}
