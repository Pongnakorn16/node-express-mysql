import express from "express";
import { conn, queryAsync } from "../db.connect";
import { json } from "body-parser";
import { TripPostRequest } from "./model/trip_post_req";

export const router = express.Router(); // Router คือตัวจัดการเส้นทาง

//  /trip 
router.get("/", (req, res)=>{
    if(req.query.id){//ถ้า query ที่ส่งมามีตัวแปล id จะเข้า if
        //trip?id=xxxxxxxxxx
        const id = req.query.id;
        const name = req.query.name;
        // res.send("Method GET in trip.ts with : " + id +" "+name);             //แบบต่อ String
        res.send(`Method GET in trip.ts with ${id} ${name}`);                    //แบบตัวหนอน alt+9+6 (เลขใน numpad)
    }else{
        // //trip
        // res.send("Method GET in trip.ts")

        const sql = "select * from trip";
        conn.query(sql, (err, result)=>{
            if(err){
                res.status(400).json(err);
            }else{
                res.json(result);
            }
        });
    }
    
});

// /trip/xxxx ดูว่าเป็น path parameter ดูจาก : ด้านหน้า
router.get("/:id",(req, res)=>{
    const id = req.params.id;
    //Bad code
    // const sql = "select * from trip where idx = " + id;

    //Good code
    const sql = "select * from trip where idx = ?"

    conn.query(sql, [id], (err, result)=>{ //sql มีตัวแปล 1 ตัวแปล จึงนำตัวแปล id ไปผูก
        if(err){
            res.status(400).json(err);
        }else{
            res.json(result);
        }
    })

    // res.send("Method GET in trip.ts with : " + id);
});

//POST /trip
// router.post("/", (req, res)=>{
//     const body = req.body;
//     res.status(201);
//     // res.send("Method POST in trip.ts with : " + JSON.stringify(body)); //text 
//     res.json({
//         text : "Method POST in trip.ts with : " + JSON.stringify(body)
//     });
// });


// //การส่งแบบ path parameter จำเป็นต้องส่งตัวแปลครบทุกตัวตามที่กำหนดไว้แบบเป๊ะๆ
// //การส่งแบบ query parameter ไม่จำเป็นต้องส่งตัวแปลครบทุกตัวก็ได้ส่งบ้างไม่ส่งบ้าง

// //trip?id =3
// //trip?name = ฟูจิ
// //เติม price เข้าไปเลยก็ได้
// router.get("/search/fields", (req, res)=>{
//     const id = req.query.id;
//     const name = req.query.name;
//     const sql = "select * from trip where" + 
//     "(idx IS NULL OR idx = ?) OR (name IS NULL OR name like ?)"
//     // if(id){
//     //     sql = "select * from trip where idx = ?";
//     // }else if(name){
//     //     sql =
//     // }
//     conn.query(sql, [id,"%" + name + "%"], (err, result)=>{
//         if(err){
//             res.status(400).json(err);
//         }else{
//             res.json(result);
//         }
//     });
// });

// //search from price
// // /trip/search/price?price=20000
// router.get("/search/price", (req, res)=>{
//     const price = req.query.price;
//     const sql = "select * from trip where" + 
//     "(price IS NULL or price < ?)"
//     // if(id){
//     //     sql = "select * from trip where idx = ?";
//     // }else if(name){
//     //     sql =
//     // }
//     conn.query(sql, [price], (err, result)=>{
//         if(err){
//             res.status(400).json(err);
//         }else{
//             res.json(result);
//         }
//     });
// });


// // /trip/search/20000
// router.get("/search/:price", (req, res)=>{
//     const price = req.query.price;
//     const sql = "select * from trip where" + 
//     "(price IS NULL or price < ?)"
//     // if(id){
//     //     sql = "select * from trip where idx = ?";
//     // }else if(name){
//     //     sql =
//     // }
//     conn.query(sql, [price], (err, result)=>{
//         if(err){
//             res.status(400).json(err);
//         }else{
//             res.json(result);
//         }
//     });
// });

import mysql from "mysql";
    //Post /trip + Data
    router.post("/",(req,res)=>{
        const trip : TripPostRequest = req.body;
        let sql = "INSERT INTO `trip`(`name`, `country`, `destinationid`, `coverimage`, `detail`, `price`, `duration`) VALUES (?,?,?,?,?,?,?)";
        sql = mysql.format(sql, [
            trip.name,
            trip.country,
            trip.destinationid,
            trip.coverimage,
            trip.detail,
            trip.price,
            trip.duration
        ]);
        conn.query(sql,(err,result)=>{
            if(err) throw err;
            res.status(201).json({
                affected_row: result.affected_rowRows,
                last_index : result.insertId
            });
        });
    });

    router.delete("/:id",(req,res)=>{
        const id = req.params.id;
        let sql = "Delete from trip where idx = ?"
        conn.query(sql,[id],(err,result)=>{
            if(err) throw err;
            res.status(200).json({
                affected_row : result.affectedRows
            });
        });
    });

    //NEED ALL FIELDS FOR UPDATE

    // router.put("/:id",(req,res)=>{
    //     const id = req.params.id;
    //     const trip : TripPostRequest = req.body;

    //     let sql =  "update  `trip` set `name`=?, `country`=?, `destinationid`=?, `coverimage`=?, `detail`=?, `price`=?, `duration`=? where `idx`=?";
    //     sql = mysql.format(sql,[
    //         trip.name,
    //         trip.country,
    //         trip.destinationid,
    //         trip.coverimage,
    //         trip.detail,
    //         trip.price,
    //         trip.duration,
    //         id
    //     ]);
    //     conn.query(sql, (err,result)=>{
    //         if(err) throw err;
    //         res.status(200).json({
    //             affected_row : result.affectedRows
    //         });
    //     });
    // });

    //NEED SOME FIELD FOR UPDATE
    //Dynamic fields update
    //Update put / trip /xxxxx + Data
    router.put("/:id",async (req,res)=>{
        //Receive data
        const id = req.params.id;
        const trip : TripPostRequest = req.body;

        //Get Original data and wait util finish
        let sql = "select * from trip where idx = ?";
        sql = mysql.format(sql, [id]);
        const result = await queryAsync(sql);
        const jsonStr = JSON.stringify(result);
        const jsonObj = JSON.parse(jsonStr);
        const tripOriginal : TripPostRequest =jsonObj[0];

        //Merge data
        const updateTrip  = {...tripOriginal,...trip};
        console.log(trip);
        console.log(updateTrip);

        //Update to database
        sql =  "update  `trip` set `name`=?, `country`=?, `destinationid`=?, `coverimage`=?, `detail`=?, `price`=?, `duration`=? where `idx`=?";
        sql = mysql.format(sql,[
            updateTrip.name,
            updateTrip.country,
            updateTrip.destinationid,
            updateTrip.coverimage,
            updateTrip.detail,
            updateTrip.price,
            updateTrip.duration,
            id
        ]);
        conn.query(sql, (err,result)=>{
            if(err) throw err;
            res.status(200).json({
                affected_row : result.affectedRows
            });
        });
    });