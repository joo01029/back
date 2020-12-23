import {Router} from 'express';
import makeboard from './func/make board';
import authmiddleware from '../../middleware/auth';
import upload from '../../middleware/multer';
import showBoard from './func/show board';
const board = Router();

board.post('/board', authmiddleware.checkToken, upload.array('files'), makeboard)
board.get('/board', authmiddleware.checkToken, showBoard);
export default board;