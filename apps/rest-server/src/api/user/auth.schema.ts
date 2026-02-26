import { z } from "zod";
import { userSchema } from "./users.schema";

export const authSchema = z.object({
  user: userSchema,
  token: z.string(),
  retoken: z.string()
});
