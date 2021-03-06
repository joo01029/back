import {Request, Response, NextFunction} from 'express';
import db from '../../../model/dbcon';
import path from 'path';

export default async(req:Request, res:Response, next:NextFunction)=>{
    const {userId, comment, boardId, commentsId} = req.body;
    const file = req.file;

    if(!userId||!comment||!boardId){
        console.log("client send null");
        res.status(401).json({
            message:"client send null",
            result:0
        })
        return;
    }
    try{
        const user = await db.user.findOne({raw:true, where:{userId:userId}});
        const writeComments = await db.comments.create({user_Id:user.user_Id, comment:comment, boardId:boardId, commentsId:commentsId});
        if(file){
            await db.image.create({
                filename:path.join(__dirname, '..','..','..','upload',file.filename),
                user_Id:user.user_Id,
                profile:0,
                commentsId:writeComments.dataValues.boardId,
            })
        }
        res.json({
            result:1
        })
    } catch(err){
        console.log(err);
        res.status(500).json({
            message:"server has error now"
        })
    }
}