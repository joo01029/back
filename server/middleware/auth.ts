import {Request, Response, NextFunction} from 'express';
import jsonwebtoken from 'jsonwebtoken';
import secret from './hashS.json';

const checkTokenForSignin = async (req:Request, res:Response, next:NextFunction)=>{
    console.log(req.body);
    const token = req.headers['authorization']
    
    if(!token){
        return res.status(403).json({
            err:"notoken"
        })
    }
    try{
        await jsonwebtoken.verify(JSON.parse(token), secret.secret, (err:any,DecodedToken:any)=>{
            
            if(err){
                console.log("err = \n", err);
                res.status(400).json({
                    message:"your token is wrong"
                })
                return;
            }
            req.body.userId = DecodedToken.sub;
            req.body.long = DecodedToken.long;
        })
        next();
    } catch(err){
        console.log(err);
        res.status(500).json({
            message:"server can't decode token"
        })
    }
    
}

const makeTokenForSignin = async (req:Request, res:Response, next:NextFunction)=>{
    const {userId,long} = req.body;
    let day:number = 1;
    if(long == 1){
        day = 30;
    }
    try{
        let extime = Math.floor(Date.now() / 1000) + (day * 24 * 60 * 60);
        jsonwebtoken.sign({
            sub:userId,
            long:long,
            iat: Math.floor(Date.now() / 1000),
            exp: extime
        }, secret.secret, (err:any,token:any)=>{
            if(err){
                console.log(err);
                res.status(500).json({
                    message:"server can't make token"
                })
                return;
            }
            console.log('server make token');
            res.json({
                token,
                result:1
            })
        })
    } catch(err){
        console.log(err);
        res.status(500).json({
            message:"server can't make token"
        })
    }
}

const makeTokenForDataUpdate = async (req:Request, res:Response, next:NextFunction)=>{
    const {userId} = req.body;
    try{
        let extime = Math.floor(Date.now() / 1000) + (10 * 60);
        jsonwebtoken.sign({
            sub:userId,
            iat: Math.floor(Date.now() / 1000),
            exp: extime
        }, secret.userauth, (err:any,token:any)=>{
            if(err){
                console.log(err);
                res.status(500).json({
                    message:"server can't make token"
                })
                return;
            }
            console.log('server make token');
            res.json({
                tokenForUpdate:token,
                result:1
            })
        })
    } catch(err){
        console.log(err);
        res.status(500).json({
            message:"server can't make token"
        })
    }
}
const checkTokenForDataUpdate = async (req:Request, res:Response, next:NextFunction)=>{
    console.log(req.headers['authorization']);
    const token = req.headers['authorization']
    if(!token){
        return res.status(403).json({
            err:"notoken"
        })
    }
    try{
        await jsonwebtoken.verify(JSON.parse(token), secret.userauth, (err:any,DecodedToken:any)=>{
            
            if(err){
                console.log("err = \n", err);
                res.status(400).json({
                    message:"your token is wrong"
                })
                return
            }
        })
        next();
    } catch(err){
        console.log(err);
        res.status(500).json({
            message:"server can't decode token"
        })
    }
    
}

export default {checkTokenForSignin, makeTokenForSignin, makeTokenForDataUpdate, checkTokenForDataUpdate};
