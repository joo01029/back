import {Request, Response, NextFunction, } from 'express';
import db from '../../../model/dbcon';
import {QueryTypes, Sequelize, Op} from 'sequelize';

export default async(req:Request, res:Response, next:NextFunction)=>{
    const {userId, boardIds} = req.body;
    const board_Ids = "("+boardIds.join()+")";
    const selectuser:any = +req.params.user_Id;
    console.log(userId, selectuser)
    if(!userId||!selectuser){
        console.log('you send null');
        res.status(400).json({
            result:1,
            message:"you send null"
        })
    }
    try{
        const user = await db.user.findOne({raw:true, where:{userId:userId}});

        let selectUser = await db.user.findOne({raw:true,attributes:["user_Id","name","birthday"], where:{user_Id:selectuser}})
        console.log(selectUser);
        let profile = await db.image.findOne({raw:true, attributes:["filename"], where:{user_Id:selectuser, profile:1}})

        if(profile === null){
            profile = {};
            profile.filename = 0;
        }
        selectUser.profile = profile.filename;

        if(user.user_Id == selectuser){
            let findboard = await db.board.findAll({raw:true, where:{user_Id:selectUser.user_Id, boarId:{[Op.notIn]:boardIds}},order:[["boardId","desc"]], limit:20});
            for(let i = 0; i < findboard.length; i++){
                const user = await db.user.findOne({raw:true, attributes:["user_Id","name"], where:{user_Id:findboard[i].user_Id}})
                let profile = await db.image.findOne({raw:true, attributes:["filename"], where:{user_Id:findboard[i].user_Id, profile:1}})
                if(profile === null){
                    profile = {};
                    profile.filename = 0;
                }
                findboard[i].user = {user_id:user.user_Id,userName: user.name, profile:profile.filename};
                const boardImage = await db.image.findAll({raw:true, attributes:['filename'], where:{boardId:findboard[i].boardId}})
                findboard[i].images = boardImage;

                let likeNum = await db.like.findOne({raw:true, attributes:[[Sequelize.fn('COUNT', Sequelize.col('*')), 'number']], where:{boardId: findboard[i].boardId}})
                findboard[i].likeNum = likeNum.number;


                const like = await db.like.findOne({raw:true, where:{user_Id:user.user_Id, boardId:findboard[i].boardId}})
                findboard[i].like = !!like;
            }
            res.json({
                result:1,
                user:selectUser,
                myProfile:true,
                board:findboard
            })
            return;
        }
        
        
        //공계범위가 전체인 글과 친구의 글 내가쓴 글에서 이미 로드된 글을 제외한 20글들  
        const query = "select * from board where boardId not in"+board_Ids+"and (`showId` = 'all' or (`showId` = 'me' and user_Id = :user_Id) or (`showId` = 'friend' and (user_Id = ANY(select user_Id from friend where friend =:user_Id and user_Id = ANY(select friend from friend where user_Id =:user_Id)) or user_Id = :user_Id)))desc limit 20"
        let findboard:any;
        await db.sequelize.query(query, {replacements: {user_Id:user.user_Id,selectuser_id:selectuser}}, { type: QueryTypes.SELECT }).then(
            function (result:any){
                console.log(result)
                result = result[0]
                // for(let i = 0; i < result.length; i++){
                    
                //     result[i] = result[i][0];
                //     console.log(i);
                // }
                findboard = result;
            }
        )
        console.log(findboard)
        for(let i = 0; i < findboard.length; i++){
            const user = await db.user.findOne({raw:true, attributes:["name"], where:{user_Id:findboard[i].user_Id}})
            let profile = await db.image.findOne({raw:true, attributes:["filename"], where:{user_Id:findboard[i].user_Id, profile:1}})

            if(profile === null){
                profile = {};
                profile.filename = 0;
            }

            findboard[i].user = {userName: user.name, profile:profile.filename};

            const boardImage = await db.image.findAll({raw:true, attributes:['filename'], where:{boardId:findboard[i].boardId}})
            findboard[i].images = boardImage;

            let likeNum = await db.like.findOne({raw:true, attributes:[[Sequelize.fn('COUNT', Sequelize.col('*')), 'number']], where:{boardId: findboard[i].boardId}})
			findboard[i].likeNum = likeNum.number;


			const like = await db.like.findOne({raw:true, where:{user_Id:user.user_Id, boardId:findboard[i].boardId}})
			findboard[i].like = !!like;
        }

        let relation;
        const findFriendUserId = await db.friend.findOne({raw:true, where:{user_Id:user.user_Id, friend:selectuser}})
        const findFriendFriend = await db.friend.findOne({raw:true, where:{user_Id:selectuser, friend:user.user_Id}})
        console.log(findFriendUserId, findFriendFriend)
        if(!findFriendUserId&&!findFriendFriend){
            relation = "nobody";
        }
        else if(findFriendUserId&&!findFriendFriend){
            relation = "me send";
        }
        else if(!findFriendUserId&&findFriendFriend){
            relation = "other send"
        }
        else{
            relation = "both"
        }

        res.json({
            result:1,
            user:selectUser,
            relation:relation,
            board:findboard
        })
        return;
    }catch(err){
        console.log(err);
        res.status(500).json({
            resuit:0,
            message:'server has error now'
        })
    }

}