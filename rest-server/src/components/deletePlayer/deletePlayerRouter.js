import express from 'express';

import { deletePlayerController } from './deletePlayerController';

const router = express.Router();

router.route('/')
    .put(deletePlayerController)

export default router;