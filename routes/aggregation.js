import express from 'express';
import {connectDB} from '../config/database.js';
import { ObjectId } from 'mongodb';
const router = express.Router();

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

router.get('/appointments/:id/details',async(req,res)=>{
    try{
        const db=await connectDB()
        const result=await db.collection('appointments').aggregate([
            {
                $match:{
                    _id:new ObjectId(req.params.id)
                }                
            },
            {
                $lookup:{
                    from:'doctors',
                    localField:'doctor_id',
                    foreignField:'_id',
                    as:'doctor_info'
                }
            },
            {
                $unwind:{
                    path:'$doctor_info'
                }
            },
            {
                $lookup:{
                    from:'patients',
                    localField:'patient_id',
                    foreignField:'_id',
                    as:'patient_info'
                }
            },
            {
                $unwind:{
                    path:'$patient_info'
                }
            },
            {
                $project:{
                    _id:0,
                    patient_id:0,
                    doctor_id:0,
                    'doctor_info._id':0,
                    'patient_info._id':0
                }
            }
        ]).toArray()
        res.json(result)
    }catch(error){
        res.status(500).json({message:'failed to get appointment',error})
    }
})

router.get('/doctors/:id/patients',async(req,res)=>{
    try{
        const db=await connectDB()
        const result=await db.collection('appointments').aggregate([
            {
                $match:{
                    doctor_id:new ObjectId(req.params.id)
                }
            },
            {
                $lookup:{
                    from:'patients',
                    localField:'patient_id',
                    foreignField:'_id',
                    as:'patients'
                }
            },
            {
                $unwind:{
                    path:'$patients'
                }
            },
            {
                $addFields:{
                    fullName:{
                        $concat:[
                            '$patients.first_name',' ','$patients.last_name'
                        ]
                    }
                }
            },
            {
                $group:{
                    _id:null,
                    patientNames:{$addToSet:'$fullName'}
                }
            },
            {
                $project:{
                    _id:0
                }
            }
        ]).toArray()
        res.json(result)
    }catch(error){
        res.status(500).json({message:'failed to get doctor\'s patients',error})
    }
})

export default router;