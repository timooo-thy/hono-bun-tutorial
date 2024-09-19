import { Hono } from "hono";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { limits } from "./db/schema";
import { transactSchema } from "./validators/limits.schema";
import { zValidator } from "@hono/zod-validator";

const app = new Hono();

const catchError = (error: unknown) => {
  if (error instanceof Error) {
    return { error: error.message };
  } else {
    return { error: "An error occurred" };
  }
};

app
  .get("/", async (c) => {
    try {
      const allLimits = await db.select().from(limits);
      return c.json({ limits: allLimits }, 200);
    } catch (error) {
      return c.json(catchError(error), 500);
    }
  })
  .get("/groups/sum", async (c) => {
    try {
      const limitsByGroup = await db
        .select({
          group: limits.group,
          sum: sql<number>`sum(${limits.available_limit})`,
        })
        .from(limits)
        .groupBy(limits.group);
      return c.json({ limits: limitsByGroup }, 200);
    } catch (error) {
      return c.json(catchError(error), 500);
    }
  })
  .get("/groups/:group", async (c) => {
    try {
      const limitsByGroup = await db
        .select()
        .from(limits)
        .where(sql`lower(${limits.group}) = lower(${c.req.param("group")})`);
      return c.json({ limits: limitsByGroup }, 200);
    } catch (error) {
      return c.json(catchError(error), 500);
    }
  })
  .get("/groups/:group/counterparties", async (c) => {
    try {
      const counterPartiesByGroup = await db
        .select()
        .from(limits)
        .where(sql`lower(${limits.group}) = lower(${c.req.param("group")})`)
        .then((res) => res.map((limit) => limit.counterparty));

      return c.json({ counterparties: counterPartiesByGroup }, 200);
    } catch (error) {
      return c.json(catchError(error), 500);
    }
  })
  .get("/counterparties/:id/limit", async (c) => {
    try {
      const counterPartyLimit = await db
        .select()
        .from(limits)
        .where(eq(limits.id, Number(c.req.param("id"))))
        .limit(1)
        .then((res) => res[0].available_limit);

      return c.json({ availableLimit: counterPartyLimit }, 200);
    } catch (error) {
      return c.json(catchError(error), 500);
    }
  })
  .get("/counterparty/:id", async (c) => {
    try {
      const counterParty = await db
        .select()
        .from(limits)
        .where(eq(limits.id, Number(c.req.param("id"))))
        .limit(1)
        .then((res) => res[0]);

      return c.json({ counterParty }, 200);
    } catch (error) {
      return c.json(catchError(error), 500);
    }
  })
  .post("/transact/:id", zValidator("json", transactSchema), async (c) => {
    try {
      const body = c.req.valid("json");
      const transactionAmount = Number(body.amount);

      const counterParty = await db
        .select()
        .from(limits)
        .where(eq(limits.id, Number(c.req.param("id"))))
        .limit(1)
        .then((res) => res[0]);

      if (!counterParty) {
        return c.notFound();
      } else if (counterParty.available_limit < transactionAmount) {
        return c.json({ error: "Insufficient funds" }, 400);
      } else {
        const updatedCounterParty = await db
          .update(limits)
          .set({
            available_limit: counterParty.available_limit - transactionAmount,
          })
          .where(eq(limits.id, Number(c.req.param("id"))))
          .returning();

        return c.json({ counterParty: updatedCounterParty }, 200);
      }
    } catch (error) {
      return c.json(catchError(error), 500);
    }
  });

export default app;
