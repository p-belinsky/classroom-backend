import express from "express";
import {and, desc, eq, getTableColumns, ilike, or, sql} from "drizzle-orm";
import {departments, subjects} from "../db/schema";
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