import { z } from "zod";

export const transactSchema = z.object({
  amount: z.number().min(1),
});
