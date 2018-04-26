import express from 'express';

import { addPlayerController } from './addPlayerController';

const router = express.Router();

router.route('/')
    .put(addPlayerController)

export default router;