import express from 'express';
import { connectDB } from '../config/db.js';
const router = express.Router();
import { ObjectId } from 'mongodb';

router.put('/appointments/change/:id', async (req, res) => {
    try {
        const db = await connectDB();
        const {status} = req.body;

        if(!status){
            return res.status(500).json({ message: "Required field was not met" });
        }
        const appointmentId = req.params.id;
        const appointmentObjectId = new ObjectId(appointmentId);

        const appointment = await db.collection('appointments').updateOne(
            { _id: appointmentObjectId },
            { $set:  { status } }
        );

        return res.json({ message: "Appointment status updated successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error modifying appointment: ", error});
    }
});


router.get('/appointments/list', async (req, res) => {
    try {
        const db = await connectDB();

        const appointments = await db.collection('appointments').find({}).toArray();

        res.json(appointments);  
    } catch (error) {
        console.error('Error fetching appointment:', error);
        res.status(500).json({ message: "Error fetching appointment: ", error });
    }
});



router.delete('/appointments/delete/:id', async (req, res) => {
    try {
    const db = await connectDB();
    const appointmentId = req.params.id;
    const appointmentObjectId = new ObjectId(appointmentId);

    const result = await db.collection('appointments').deleteOne({ _id: appointmentObjectId });

    return res.json({ message: "Appointment deleted successfully"})

} catch (error) {
    res.status(500).json({ message: "Error deleting appointment: ", error});
}
});



router.put('/appointments/cancel/:id', async (req, res) => {
    try {
        const db = await connectDB();

        const appointmentId = req.params.id;
        const appointmentObjectId = new ObjectId(appointmentId);

        const appointment = await db.collection('appointments').updateOne(
            { _id: appointmentObjectId },
            { $set: { status :"Cancelled" } }
        );

        return res.json({ message: "Appointment cancelled successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error cancelling appointment: ", error});
    }
});



export default router;