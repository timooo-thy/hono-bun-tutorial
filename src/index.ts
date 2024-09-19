import { Hono } from "hono";
import instruments from "./instruments";
import limits from "./limits";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";

const app = new Hono();
app.use("/api/*", cors());

app
  .get("/", (c) => {
    return c.text("Hello GIC!", 200);
  })
  .notFound((c) => {
    return c.text("404: Not Found", 404);
  })
  .use(prettyJSON());

app.route("/instruments", instruments);
app.route("/limits", limits);

export default app;
