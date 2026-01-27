import express from "express";
import {db} from "../db/index.js";
import {classes, subjects, user, departments} from "../db/schema/index.js";
import {and, desc, eq, getTableColumns, ilike, or, sql} from "drizzle-orm";
import {authMiddleware, roleMiddleware} from "../middleware/auth.js";



const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const { search, subject, teacher, page = 1, limit= 10 } = req.query;

        const currentPage= Math.max(1, parseInt(String(page), 10) || 1);
        const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 100);

        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        if(search){
            filterConditions.push(
                ilike(classes.name, `%${search}%`)
            )
        }

        if(subject){
            filterConditions.push(eq(classes.subjectId, parseInt(subject as string, 10)))
        }

        if(teacher){
            filterConditions.push(eq(classes.teacherId, teacher as string))
        }

        const whereClause = filterConditions.length > 0 ? and (...filterConditions) : undefined;

        const countResult = await db
            .select({count: sql<number>`count(*)`})
            .from(classes)
            .leftJoin(subjects, eq(classes.subjectId, subjects.id))
            .leftJoin(user, eq(classes.teacherId, user.id))
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const classesList = await db
            .select({
                ...getTableColumns(classes),
                subject: {...getTableColumns(subjects)},
                teacher: {
                    ...getTableColumns(user),
                },
            })
            .from(classes)
            .leftJoin(subjects, eq(classes.subjectId, subjects.id))
            .leftJoin(user, eq(classes.teacherId, user.id))
            .where(whereClause)
            .orderBy(desc(classes.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: classesList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage)
            }
        })

    }catch (error) {
        console.error(`GET /classes error: ${error}`);
        res.status(500).json({error: 'Failed to get classes'})
    }
})

router.get('/:id', async (req, res) => {
    const classId = Number(req.params.id);
    if(!Number.isFinite(classId)) return res.status(400).json({error: 'No Class Found.'});

    const [classDetails] = await db
        .select({
            ...getTableColumns(classes),
            subject: {...getTableColumns(subjects)},
            department: {...getTableColumns(departments)},
            teacher: {
                ...getTableColumns(user),
            },
        })
        .from(classes)
        .leftJoin(subjects, eq(classes.subjectId, subjects.id))
        .leftJoin(user, eq(classes.teacherId, user.id))
        .leftJoin(departments, eq(subjects.departmentId, departments.id))
        .where(eq(classes.id, classId))

    if(!classDetails) return res.status(404).json({error: 'No Class Found.'});

    res.status(200).json({data: classDetails});

})

router.post('/', authMiddleware, roleMiddleware(['teacher', 'admin']), async (req, res) => {
    try {
        const {name, teacherId, subjectId, capacity, description, status, bannerUrl, bannerCldPubId} = req.body;
        const [createdClass] = await db
            .insert(classes)
            .values({...req.body, inviteCode: Math.random().toString(36).substring(2, 9), schedules: []})
            .returning({id: classes.id});

        if(!createdClass) throw Error;

        res.status(201).json({data: createdClass});
    }catch (error) {
        console.error(`POST /classes error: ${error}`);
        res.status(500).json({error: error});
    }
})

export default router;