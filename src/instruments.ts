import { Hono } from "hono";
import { db } from "./db";
import { instruments } from "./db/schema";
import { eq, sql } from "drizzle-orm";

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
      const allInstruments = await db.select().from(instruments);
      return c.json({ instruments: allInstruments }, 200);
    } catch (error) {
      return c.json(catchError(error), 500);
    }
  })
  .get("/:id", async (c) => {
    try {
      const instrument = await db
        .select()
        .from(instruments)
        .where(eq(instruments.id, Number(c.req.param("id"))))
        .then((res) => res[0]);

      return c.json({ instrument }, 200);
    } catch (error) {
      return c.json(catchError(error), 500);
    }
  })
  .get("/groups/:group", async (c) => {
    try {
      const instrumentsByGroup = await db
        .select()
        .from(instruments)
        .where(
          sql`lower(${instruments.group}) = lower(${c.req.param("group")})`
        );
      return c.json({ instruments: instrumentsByGroup }, 200);
    } catch (error) {
      return c.json(catchError(error), 500);
    }
  });

export default app;
