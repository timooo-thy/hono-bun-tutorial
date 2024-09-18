import { Hono } from "hono";
import instruments from "./instruments";
import limits from "./limits";
import { prettyJSON } from "hono/pretty-json";

const app = new Hono();

app
  .get("/", (c) => {
    return c.text("Hello Hono!", 200);
  })
  .notFound((c) => {
    return c.text("404: Not Found", 404);
  })
  .use(prettyJSON());

app.route("/instruments", instruments);
app.route("/limits", limits);

export default app;
