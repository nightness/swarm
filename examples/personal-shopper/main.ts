import { Agent, AgentFunction, runLoop } from 'swarm-ai';
import * as db from './database';

interface PurchaseRow {
  amount: number;
}

interface UserRow {
  email: string;
  phone: string;
}

interface ProductRow {
  product_name: string;
  price: number;
}

function refundItem({ user_id, item_id }: { user_id: number, item_id: number }): string {
  const conn = db.getConnection();
  conn.get<PurchaseRow>(`SELECT amount FROM PurchaseHistory WHERE user_id = ? AND item_id = ?`, [user_id, item_id], (err, row) => {
    if (row) {
      console.log(`Refunding $${row.amount} to user ID ${user_id} for item ID ${item_id}.`);
      return `Refunding $${row.amount} to user ID ${user_id} for item ID ${item_id}.`;
    } else {
      console.log(`No purchase found for user ID ${user_id} and item ID ${item_id}.`);
      return `No purchase found for user ID ${user_id} and item ID ${item_id}.`;
    }
  });
  return 'Refund process started.';
}

function notifyCustomer({ user_id, method }: { user_id: number, method: string }): string {
  const conn = db.getConnection();
  conn.get<UserRow>(`SELECT email, phone FROM Users WHERE user_id = ?`, [user_id], (err, row) => {
    if (row) {
      const { email, phone } = row;
      if (method === 'email' && email) {
        console.log(`Emailed customer ${email} a notification.`);
        return `Emailed customer ${email}.`;
      } else if (method === 'phone' && phone) {
        console.log(`Texted customer ${phone} a notification.`);
        return `Texted customer ${phone}.`;
      } else {
        console.log(`No ${method} contact available for user ID ${user_id}.`);
        return `No ${method} contact available for user ID ${user_id}.`;
      }
    } else {
      console.log(`User ID ${user_id} not found.`);
      return `User ID ${user_id} not found.`;
    }
  });
  return 'Notification process started.';
}

function orderItem({ user_id, product_id }: { user_id: number, product_id: number }): string {
  const date_of_purchase = new Date().toISOString();
  const conn = db.getConnection();
  conn.get<ProductRow>(`SELECT product_name, price FROM Products WHERE product_id = ?`, [product_id], (err, row) => {
    if (row) {
      console.log(`Ordering product ${row.product_name} for user ID ${user_id}. The price is ${row.price}.`);
      db.addPurchase(user_id, date_of_purchase, product_id, row.price);
      return `Ordered ${row.product_name} for user ID ${user_id} at $${row.price}.`;
    } else {
      console.log(`Product ${product_id} not found.`);
      return `Product ${product_id} not found.`;
    }
  });
  return 'Order process started.';
}

// Initialize the database
db.initializeDatabase();
db.previewTable("Users");
db.previewTable("PurchaseHistory");
db.previewTable("Products");

// Define the agents

const refundsAgent = new Agent({
  name: "Refunds Agent",
  instructions: `You are a refund agent that handles all actions related to refunds after a return has been processed. You must ask for both the user ID and item ID to initiate a refund. Ask for both user_id and item_id in one message.`,
  functions: [
    {
      name: "refundItem",
      func: refundItem,
      parameters: {
        user_id: { type: "number" },
        item_id: { type: "number" },
      },
    } as AgentFunction,
    {
      name: "notifyCustomer",
      func: notifyCustomer,
      parameters: {
        user_id: { type: "number" },
        method: { type: "string" },
      },
    } as AgentFunction,
  ],
});

const salesAgent = new Agent({
  name: "Sales Agent",
  instructions: `You are a sales agent that handles all actions related to placing an order to purchase an item. You must ask for BOTH the user ID and product ID to place an order. Ask for both user_id and product_id in one message.`,
  functions: [
    {
      name: "orderItem",
      func: orderItem,
      parameters: {
        user_id: { type: "number" },
        product_id: { type: "number" },
      },
    } as AgentFunction,
    {
      name: "notifyCustomer",
      func: notifyCustomer,
      parameters: {
        user_id: { type: "number" },
        method: { type: "string" },
      },
    } as AgentFunction,
  ],
});

const triageAgent = new Agent({
  name: "Triage Agent",
  instructions: `You are to triage a user's request and transfer to the appropriate agent.`,
  functions: [
    {
      name: "transferToSalesAgent",
      func: () => salesAgent,
      parameters: {},
    } as AgentFunction,
    {
      name: "transferToRefundsAgent",
      func: () => refundsAgent,
      parameters: {},
    } as AgentFunction,
  ],
});

if (require.main === module) {
  runLoop(triageAgent, {}, false);
}
