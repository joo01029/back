import { Sequelize } from 'sequelize';
import config from './config.json';



const sequelize = new Sequelize(
    config.db_server.database,
    config.db_server.user,
    config.db_server.password,
    {
        host:'localhost',
        dialect:'mysql'
    }
)

let db:{[k:string]:any} = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.queryInterface = sequelize.getQueryInterface();
//table
import User from './table/user';
import Friend from './table/friend';
import Like from './table/like';
import Image from './table/image';
import Comments from './table/comments';
import Board from './table/board';
import Show from './table/show';

db.user = User(db.sequelize,db.Sequelize);
db.friend = Friend(db.sequelize, db.Sequelize);
db.board = Board(db.sequelize, db.Sequelize);
db.comments = Comments(db.sequelize, db.Sequelize);
db.show = Show(db.sequelize, db.Sequelize);
db.like = Like(db.sequelize, db.Sequelize);
db.image = Image(db.sequelize, db.Sequelize);


//relationship
db.user.hasMany(db.friend);
db.friend.belongsTo(db.user,{
    foreignKey:'user_Id',
    onDeleted:'cascade',
    onUpdate:'cascade',
})
db.user.hasMany(db.friend,{
    foreignKey:'friend',
    onDeleted:'cascade',
    onUpdate:'cascade',
});
db.friend.belongsTo(db.user,{
    foreignKey:'friend'
})

db.user.hasMany(db.board)
db.board.belongsTo(db.user,{
    foreignKey:'user_Id',
    onDeleted:'cascade',
    onUpdate:'cascade',
})
db.show.hasMany(db.board)
db.board.belongsTo(db.show,{
    foreignKey:'showId',
    onDeleted:'cascade',
    onUpdate:'cascade',
})

db.user.hasMany(db.image)
db.image.belongsTo(db.user,{
    foreignKey:'user_Id',
    onDeleted:'cascade',
    onUpdate:'cascade',
})
db.board.hasMany(db.image)
db.image.belongsTo(db.board,{
    foreignKey:'boardId',
    onDeleted:'cascade',
    onUpdate:'cascade',
})

db.user.hasMany(db.comments)
db.comments.belongsTo(db.user,{
    foreignKey:'user_Id',
    onDeleted:'cascade',
    onUpdate:'cascade',
})
db.board.hasMany(db.comments)
db.comments.belongsTo(db.board,{
    foreignKey:'boardId',
    onDeleted:'cascade',
    onUpdate:'cascade',
})
db.comments.hasMany(db.comments,{
    foreignKey:'FcommentsId',
    onDeleted:'cascade',
    onUpdate:'cascade',
})

db.user.hasMany(db.like)
db.like.belongsTo(db.user,{
    foreignKey:'user_Id',
    onDeleted:'cascade',
    onUpdate:'cascade',
})
db.board.hasMany(db.like)
db.like.belongsTo(db.board,{
    foreignKey:'boardId',
    onDeleted:'cascade',
    onUpdate:'cascade',
})
db.comments.hasMany(db.like)
db.like.belongsTo(db.comments,{
    foreignKey:'commentsId',
    onDeleted:'cascade',
    onUpdate:'cascade',
})
//

export default db;

sequelize.sync()
    .then(()=>{
        console.log('database sync');
    })
    .catch((err:any)=>{
        console.log(err);
    })