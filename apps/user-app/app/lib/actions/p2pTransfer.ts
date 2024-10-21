"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

interface P2PTransferResult {
  success: boolean;
  message: string;
}

export async function p2pTransfer(
  to: string,
  amount: number
): Promise<P2PTransferResult> {
  const session = await getServerSession(authOptions);
  const from = session?.user?.id;

  if (!from) {
    return { success: false, message: "Error while sending: not logged in" };
  }

  const toUser = await prisma.user.findFirst({
    where: { number: to },
  });

  if (!toUser) {
    return { success: false, message: "User not found" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(from)} FOR UPDATE`;

      const fromBalance = await tx.balance.findUnique({
        where: { userId: Number(from) },
      });

      if (!fromBalance || fromBalance.amount < amount) {
        throw new Error("Insufficient funds");
      }

      await tx.balance.update({
        where: { userId: Number(from) },
        data: { amount: { decrement: amount } },
      });

      await tx.balance.update({
        where: { userId: toUser.id },
        data: { amount: { increment: amount } },
      });

      await tx.p2pTransfer.create({
        data: {
          fromUserId: Number(from),
          toUserId: toUser.id,
          amount,
          timestamp: new Date(),
        },
      });
    });
    return { success: true, message: "Transaction successful" };
  } catch (error) {
    let errorMessage = "Unknown error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.log(errorMessage);

    return {
      success: false,
      message: "Transaction failed",
    };
  }
}

export async function getP2PTransactions() {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  const sentTransactions = await prisma.p2pTransfer.findMany({
    where: { fromUserId: userId },
    include: { toUser: true },
  });

  const receivedTransactions = await prisma.p2pTransfer.findMany({
    where: { toUserId: userId },
    include: { fromUser: true },
  });

  return {
    sent: sentTransactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      timestamp: t.timestamp,
      user: t.toUser?.name || t.toUser?.email || "Unknown User",
      type: "Debit" as const,
    })),
    received: receivedTransactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      timestamp: t.timestamp,
      user: t.fromUser?.name || t.fromUser?.email || "Unknown User",
      type: "Credit" as const,
    })),
  };
}
