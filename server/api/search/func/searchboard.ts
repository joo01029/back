import {Request, Response, NextFunction} from 'express';
import db from '../../../model/dbcon';

import {Op, Sequelize} from 'sequelize';

export default async(req:Request, res:Response, next:NextFunction)=>{
  const { userId,boardIds } = req.body;
  let board = req.params.board;
  if(!board||!userId){
    console.log('you send null');
    res.status(401).json({
      result:0,
      message:'you send null'
    })
  }

  let valueArray = board.split(' ');
  let value = '';
  for(let i = 0; i < valueArray.length; i++){
    value += valueArray[i]+"|";
  }
  console.log(valueArray);
  
  try{
    const User = await db.user.findOne({raw:true, attributes:['user_Id'], where:{userId:userId}})

    let findBoard = await db.board.findAll({raw:true, where:{boardId:{[Op.notIn]:boardIds},
      [Op.or]:[{showId:'all'}, {showId:'me', user_id:User.user_Id}, {showId:'friend', user_Id:{[Op.in]:[
        Sequelize.literal('select user_Id from friend where friend =:user_Id and user_Id = ANY(select friend from friend where user_Id =:user_Id)')]
      }}],[Op.or]:[{contents:{[Op.regexp]:value}}, {title:{[Op.regexp]:value}}]
    }, replacements:{user_Id:User.user_Id},order:[["boardId","desc"]], limit:20})

    for(let i = 0; i < findBoard.length; i++){
      const user = await db.user.findOne({raw:true, attributes:["name"], where:{user_Id:findBoard[i].user_Id}})
      let profile = await db.image.findOne({raw:true, attributes:["filename"], where:{user_Id:findBoard[i].user_Id, profile:1}})

      if(profile === null){
          profile = {};
          profile.filename = 0;
      }

      findBoard[i].user = {userName: user.name, profile:profile.filename};

      const boardImage = await db.image.findAll({raw:true, attributes:['filename'], where:{boardId:findBoard[i].boardId}})
      findBoard[i].images = boardImage;

      let likeNum = await db.like.findOne({raw:true, attributes:[[Sequelize.fn('COUNT', Sequelize.col('*')), 'number']], where:{boardId: findBoard[i].boardId}})
			findBoard[i].likeNum = likeNum.number;


			const like = await db.like.findOne({raw:true, where:{user_Id:User.user_Id, boardId:findBoard[i].boardId}})
			findBoard[i].like = !!like;
    }

    res.json({
      findBoard
    })
  }catch(err){
    console.log(err);
    res.status(500).json({
      message: 'server has error now'
    })
  }
  
}