import type { FastifyInstance } from "fastify";
import type { DatabaseInstance } from "@admission-engine/database";
import { AnalyticsService } from "./analytics.service";
import { MistakeBookService } from "./mistake-book.service";
import { AnalyticsController } from "./analytics.controller";

export interface AnalyticsRoutesOptions {
  db: DatabaseInstance;
  analyticsService?: AnalyticsService;
  mistakeBookService?: MistakeBookService;
}

export async function analyticsRoutes(app: FastifyInstance, opts: AnalyticsRoutesOptions) {
  const analyticsService = opts.analyticsService || new AnalyticsService(opts.db);
  const mistakeBookService =
    opts.mistakeBookService || new MistakeBookService(opts.db, analyticsService);
  const controller = new AnalyticsController(analyticsService, mistakeBookService);

  // 1. Pre-calculated Dynamic Dashboard Metrics (< 20ms)
  app.get("/analytics/dashboard", async (req, rep) => controller.getDashboard(req, rep));

  // 2. Student Mistake Book Repository
  app.get("/analytics/mistake-book", async (req, rep) => controller.getMistakes(req, rep));

  // 3. Dynamic Retest Generation (20-30 unmastered questions, prioritizing highest failure counts)
  app.get("/analytics/mistake-book/retest", async (req, rep) => controller.generateRetest(req, rep));
  app.post("/analytics/mistake-book/retest", async (req, rep) => controller.generateRetest(req, rep));

  // 4. Retest Evaluation enforcing Two-Strike Mastery Rule
  app.post("/analytics/mistake-book/retest/evaluate", async (req, rep) =>
    controller.evaluateRetest(req, rep)
  );
}
