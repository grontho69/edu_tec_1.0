import type { FastifyRequest, FastifyReply } from "fastify";
import type { DatabaseInstance } from "@admission-engine/database";
import { taxonomyService } from "./taxonomy.service";

export class TaxonomyController {
  async getTaxonomy(request: FastifyRequest, reply: FastifyReply, db: DatabaseInstance) {
    const query = request.query as { refresh?: string } | undefined;
    const forceRefresh = query?.refresh === "true";
    const tree = await taxonomyService.getTaxonomyTree(db, forceRefresh);
    return reply.status(200).send({
      success: true,
      data: tree,
      meta: {
        isCached: taxonomyService.isCached(),
      },
    });
  }

  async invalidateCache(_request: FastifyRequest, reply: FastifyReply) {
    taxonomyService.invalidateCache();
    return reply.status(200).send({
      success: true,
      message: "Taxonomy in-memory cache invalidated successfully",
    });
  }
}

export const taxonomyController = new TaxonomyController();
