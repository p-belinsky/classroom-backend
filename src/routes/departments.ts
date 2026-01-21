import express from "express";
import {desc, getTableColumns} from "drizzle-orm";
import {departments} from "../db/schema/index.js";
import {db} from "../db";

const router = express.Router();

router.get('/', async (req, res) => {
    try {

        const departmentsList = await db
            .select({
                ...getTableColumns(departments),
            })
            .from(departments)
            .orderBy(desc(departments.createdAt));

        res.status(200).json({
            data: departmentsList,
        })
    }catch (error) {
        console.error(`GET /departments error: ${error}`);
        res.status(500).json({error: 'Failed to get departments'})
    }
})


export default router;