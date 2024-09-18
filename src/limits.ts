import { Hono } from "hono";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { limits } from "./db/schema";
import { validator } from "hono/validator";
import { transactSchema } from "./validators/limits.schema";

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
  .get("/:id", async (c) => {
    try {
      const counterParty = await db
        .select()
        .from(limits)
        .where(eq(limits.id, Number(c.req.param("id"))))
        .limit(1);

      return c.json({ counterParty }, 200);
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
  .post(
    "/transact/:id",
    validator("json", (value, c) => {
      const parsed = transactSchema.safeParse(value);
      if (!parsed.success) {
        return c.json({ error: parsed.error.errors[0].message }, 400);
      }
      return parsed.data;
    }),
    async (c) => {
      try {
        const body = c.req.valid("json");
        const transactionAmount = Number(body.amount);

        const counterParty = await db
          .select()
          .from(limits)
          .where(eq(limits.id, Number(c.req.param("id"))))
          .limit(1);

        if (!counterParty[0]) {
          return c.json({ error: "Counter party not found" }, 404);
        } else if (
          (counterParty[0].available_limit as number) < transactionAmount
        ) {
          return c.json({ error: "Insufficient funds" }, 400);
        } else {
          const updatedCounterParty = await db
            .update(limits)
            .set({
              available_limit:
                (counterParty[0].available_limit as number) - transactionAmount,
            })
            .where(eq(limits.id, Number(c.req.param("id"))))
            .returning();

          return c.json({ counterParty: updatedCounterParty }, 200);
        }
      } catch (error) {
        return c.json(catchError(error), 500);
      }
    }
  );

export default app;
