
import express from 'express';

import db from '../../config/database';

export const addPlayerController = async (req, res) => {
    let challengeId = req.body.challenge;
    try {
        await db.query(`
            UPDATE 
                challenges 
            SET 
                numPlayers = numPlayers + 1
            WHERE 
                id = 2;
        `)
        res.status(200).send();
    } catch (err) { 
        throw new Error(err);
    }
}