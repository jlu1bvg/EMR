import express from 'express';
import { connectDB } from '../config/database.js';
const router = express.Router();

router.get('/all-patients', async (req, res) => {
    try {
        const db = await connectDB();
        const patients = await db.collection('patients').find().toArray();
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: "Error displaying patients", error });
    }
});

router.get('/all-doctors', async (req, res) => {
    try {
        const db = await connectDB();
        const doctors = await db.collection('doctors').find().toArray();
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Error displaying doctors", error });
    }
});

router.get('/all-appointments', async (req, res) => {
    try {
        const db = await connectDB();
        const appointments = await db.collection('appointments').find().toArray();
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Error displaying appointments", error });
    }
});

router.post('/new-appointment', async (req, res) => {
    try {
        const db = await connectDB();
        const appointment = {
            patient_id: req.body.patient_id,
            doctor_id: req.body.doctor_id,
            appointment_date: req.body.appointment_date,
            reason: req.body.reason,
            status: req.body.status,
            notes: req.body.notes
        };

        const result = await db.collection('appointments').insertOne(appointment);
        res.json({ message: "Appointment created.", appointmentId: result.insertedId });
    } catch {
        res.status(500).json({ message: "Error creating appointment", error });
    }
})

export default router;