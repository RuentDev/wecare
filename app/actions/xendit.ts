"use server";

export async function createXenditInvoice(data: {
  externalId: string;
  amount: number;
  description: string;
}) {
  console.log("Mock Xendit Invoice Created:", data);
  
  // Return a mock response
  return {
    id: "mock_invoice_" + Math.random().toString(36).substring(7),
    invoiceUrl: "https://checkout.xendit.co/v2/mock",
    status: "PENDING"
  };
}
