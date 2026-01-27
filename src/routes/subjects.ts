import express from "express";
import {departments, subjects} from "../db/schema/index.js";
import {and, desc, eq, getTableColumns, ilike, or, sql} from "drizzle-orm";
import { db } from "../db/index.js";
import {authMiddleware, roleMiddleware} from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { search, department, page = 1, limit= 10 } = req.query;

        const currentPage= Math.max(1, parseInt(String(page), 10) || 1);
        const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 100);

        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        if(search){
            filterConditions.push(
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`)
                )
            )
        }

        if(department){
            filterConditions.push(eq(subjects.departmentId, parseInt(department as string, 10)))
        }

        const whereClause = filterConditions.length > 0 ? and (...filterConditions) : undefined;

        const countResult = await db
            .select({count: sql<number>`count(*)`})
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const subjectsList = await db
            .select({
                ...getTableColumns(subjects),
                department: {
                    ...getTableColumns(departments),

                },
            })
        .from(subjects)
        .leftJoin(departments, eq(subjects.departmentId, departments.id))
        .where(whereClause)
        .orderBy(desc(subjects.createdAt))
        .limit(limitPerPage)
        .offset(offset);

        res.status(200).json({
            data: subjectsList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage)
            }
        })

    }catch (error){
        console.error(`GET /subjects error: ${error}`);
        res.status(500).json({error: 'Failed to get subjects'})
    }
})

router.post("/", authMiddleware, roleMiddleware(['teacher', 'admin']), async (req, res) => {
    try {
        const {name, code, description, departmentId} = req.body;
        const [createdSubject] = await db
            .insert(subjects)
            .values({name, code, description, departmentId})
            .returning({id: subjects.id});

        if(!createdSubject) throw Error;

        res.status(201).json({data: createdSubject});
    }catch (error){
        console.error(`POST /subjects error: ${error}`);
        res.status(500).json({error: 'Failed to create subject'})
    }
})

export default router;