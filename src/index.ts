import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';


import authRoutes from './auth/auth.routes';
import usersRoutes from './users/users.routes';
import moodsRoutes from './moods/moods.routes';
import prisma from './prisma';


dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());


app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/moods', moodsRoutes);


app.get('/', (req, res) => res.json({ ok: true }));


const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
console.log(`Server running on ${PORT}`);
try {
await prisma.$connect();
console.log('Connected to database');
} catch (err) {
console.error('Database connection error:', err);
process.exit(1);
}
});