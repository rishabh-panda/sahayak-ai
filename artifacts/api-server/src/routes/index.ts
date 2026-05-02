import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";
import remindersRouter from "./reminders";
import healthRecordsRouter from "./health_records";
import medicationsRouter from "./medications";
import contactsRouter from "./contacts";
import checkinsRouter from "./checkins";
import tipsRouter from "./tips";
import aiRouter from "./ai";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profileRouter);
router.use(remindersRouter);
router.use(healthRecordsRouter);
router.use(medicationsRouter);
router.use(contactsRouter);
router.use(checkinsRouter);
router.use(tipsRouter);
router.use(aiRouter);
router.use(dashboardRouter);

export default router;
