import type { FastifyInstance } from "fastify";
import type { DatabaseInstance } from "@admission-engine/database";
import { taxonomyController } from "./taxonomy.controller";

export async function taxonomyRoutes(app: FastifyInstance, opts: { db: DatabaseInstance }) {
  const { db } = opts;

  app.get("/taxonomy", async (req, rep) => {
    return taxonomyController.getTaxonomy(req, rep, db);
  });

  app.post("/taxonomy/invalidate", async (req, rep) => {
    return taxonomyController.invalidateCache(req, rep);
  });
}
