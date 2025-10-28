"use client";

import { usePrice } from "@/context/ChonkPrice";
import TransactionData from "./TransactionsData";

export default function TransactionDataWrapper({ docId }: { docId: string }) {
  const prices = usePrice();

  return (
    <TransactionData
      docId={docId}
      prices={prices}
    />
  );
}