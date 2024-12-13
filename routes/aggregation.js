import {express} from 'express';
import {connectDB} from '../config/database.js';
const router = express.router();

router.get('/patients/aggregated-diagnosis', async(req,res) => {
    //most common diagnosis
    const db =await connectDB();
    const patients = db.collection('patients');
    const result = await patients.aggregate([
        {
            $group: {
                _id:'$diagnosis',
                count:{$sum:1}
            }
        },
        {
            $sort:{count:-1}
        },
        {
            $limit: 1
        }
        ]
    ).toArray();
    res.json(result);
});

router.get("/doctors/appointment-count", async(req,res) => {
    const db = await connectDB();
    const doctors = db.collection('doctors');
    //count #of appointments per doc 
    const result = await doctors.aggregate([
        {
            $group:{
                _id:'$doctor_id',
                count:{$sum:1}
            }
        },
        {
            $lookup:{
                from:'patients',
                localField:'_id',
                foreignField:'doctor_id',
                as:'doctor_info'
            }
        },
        {
            $unwind:'$doctor_info'//flatten it
        },
        {
            $project:{
                _id:0,
                doctor_id:'$_id',
                doctor_name:'$doctor_info.doctor_name',
                appointment_count:'$count'
            }
        }
    ]).toArray();
    res.json(result);
});

router.get("/patients/prescribed-meds", async(req,res) => {
    const db = await connectDB();
    const patients = db.collection('patients');
    //list of prescribed meds
    const result = await patients.aggregate([
        {
            $lookup:{
                from:'medications',
                localField:'medication_id',
                foreignField:'_id',
                as:'medication_info'
            }
        },
        {
            $unwind:'$medication_info'
        },
        {
            $project:{
                _id:0,
                patient_id:'$_id',
                patient_name:'$patient_name',
                medication_name:'$medication_info.medication_name',
                dosage:'$medication_info.dosage'
            }
        }
    ]).toArray();
    res.json(result);
});

export default router;