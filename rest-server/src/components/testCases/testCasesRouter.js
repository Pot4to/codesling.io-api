import express from 'express';

import { testCaseController, fetchTestCaseController } from './testCasesControllers';

const router = express.Router();

router.route('/')
  .post(testCaseController);

router.route("/:challenge_id")
  .get(fetchTestCaseController);

export default router;
