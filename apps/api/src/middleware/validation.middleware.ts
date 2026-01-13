import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const validate =
  (schema: z.ZodSchema, source: "body" | "query" = "body") =>
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = source === "query" ? req.query : req.body;
        const parsed = schema.parse(data);

        // Update the request object with parsed data
        if (source === "query") {
          req.query = parsed as any;
        } else {
          req.body = parsed;
        }

        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const errors = error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          }));

          return res.status(400).json({
            success: false,
            error: "Validation failed",
            details: errors,
          });
        }

        return res.status(400).json({
          success: false,
          error: "Invalid request data",
        });
      }
    };
