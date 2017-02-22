/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect       = require('chai').expect;
var mongoose     = require('mongoose');
var bluebird     = require('bluebird');
var Schema       = mongoose.Schema;
var Messages     = require('../messages.js');

var {ID}         = require('../helpers');

const CONNECTION_STRING = process.env.DB;

var options, db, TestTable;

options = { promiseLibrary: bluebird };
db = mongoose.createConnection(CONNECTION_STRING, options);

module.exports = function (app) {
  
  app.route('/api/threads/:board')
  
    .post(function(req, res){
      if (!req.body) return res.sendStatus(400);
      // Reikia message Table
      const board = req.params.board;
      if (board) {
        if (/^([A-Za-z_0-9])+$/.test(board)){
      // if (board && board.length > 0 && /^([A-Za-z_0-9])+$/.test(board)){
        let MessagesTable = new Messages(db, board);
        let message = new MessagesTable();
        message.text = req.body.text;
        message.delete_password = req.body.delete_password;

        message.save(function(err, savedMessage){
          if (!err){
            res.send('SAVE succeeded');
            // res.json(savedMessage);
          } else {
            res.send(`Error(s): [${err.message} ]`);
          }
        });
        }else {
          res.send(`You can use only letters and _ (dash) for the board name`);
        }
      } else {
        res.send('Error(s): [ Board field is empty ]');
      }
    })
    .get(function(req, res){
      if (!req.body) return res.sendStatus(400);
      const board = req.params.board;
      let MessagesTable = new Messages(db, board);
      if (board && board.length > 0){
        
        MessagesTable.aggregate(
        [
          {
            $match:{ _id: { $type: 7 }}
          },
          {
            $project: {
              text: 1,
              created_on: 1,
              replycount: { $size: "$replies" },
              replies: { $slice: [ "$replies", -3 ] } ,
              bumped_on: 1
            }
          },
          { $sort: { bumped_on: -1 }},
          { $limit: 10 }//
        ],
        function(err, messages){
          if (!err){
             res.json(messages);
          } else {
            res.send(`Error(s): [${err.message} ]`);
          }
        });
      }
    })
    .put(function(req, res){
      if (!req.body) return res.sendStatus(400);
      const board = req.params.board;

      if (board && board.length > 0){
        let MessagesTable = new Messages(db, board);
        let updates = { reported: true };
        MessagesTable.findOneAndUpdate({ _id: req.body.thread_id }, { $set: updates }, function(err, newMessage){
              if (!err){
                if (newMessage){
                  res.send('UPDATE succeeded');
                } else {
                  // res.send(`Error: [could not update report: _id {${req.body.thread_id}}]`);
                  // res.send('Error(s): [ UPDATE failed ]');
                  res.send('Error(s): [ Wrong _id ]');
                }
              } else {
                res.send(`Error(s): [${err.message} ]`);
                // res.send('Error(s): [ UPDATE failed ]');
                // res.send(`Error: [could not update report: _id {${req.body.thread_id}}]`);
              }
            });
      }
    })
    .delete(function(req, res){
      if (!req.body) return res.sendStatus(400);
      const board = req.params.board;

      if (board && board.length > 0){

        let MessagesTable = new Messages(db, board);
        MessagesTable.findOneAndRemove({ _id: req.body.thread_id, delete_password: req.body.delete_password }, function(err, removedMessage){
          if (!err){
            if (removedMessage){
              res.send('DELETE succeeded');
            } else {
              res.send('Error(s): [ Wrong id or password ]');
            }
          } else {
            res.send(`Error(s): [${err.message} ]`);
            // res.send('Error(s): [ DELETE failed ]');
          }
        });
      }
    })
  ;
    
  app.route('/api/replies/:board')
    .post(function(req, res){
      if (!req.body) return res.sendStatus(400);
      const data = req.body;
      const board = req.params.board;
      if (board && board.length > 0){
        if (data.thread_id && data.thread_id.length > 0 && typeof(data.thread_id) === 'string' && data.text && data.text.length > 0 && data.delete_password && data.delete_password.length > 0){
            const MessagesTable = new Messages(db, board);
            const date = new Date();
          
            let updates = { $push: { replies: { _id:  ID(), text: data.text, created_on: date, delete_password: data.delete_password, reported: false  } },
                            $set: { bumped_on: date }};
          
            MessagesTable.findOneAndUpdate({ _id: data.thread_id }, updates, function(err, thread){
              if (!err){
                if (thread){
                  // res.redirect(`/b/${board}/${data.thread_id}`);
                  res.json({ thread_id: data.thread_id });
                } else {
                  res.send(`Error(s): [ Wrong _id ]`);
                }
              } else {
                res.send(`Error(s): [${err.message} ]`);
              }
            });

          
        } else {
          var errors = [];
          if (!data.thread_id)
            errors.push(' Wrong Id');
          if (!data.text)
            errors.push(' Text field is empty');
          if (!data.delete_password)
            errors.push(' Delete password field is empty');
            
          res.send(`Error(s): [${errors} ]`);
        }

      }
    })
    .put(function(req, res){
      if (!req.body) return res.sendStatus(400);
      const data = req.body;
      const board = req.params.board;
      if (board && board.length > 0){
        const MessagesTable = new Messages(db, board);
        MessagesTable.findOne({ $and: [ { _id: data.thread_id},   { "replies._id": data.reply_id } ]}, function(err, thread){
          if (!err){
            if (thread){
            thread.replies.map( reply => {
              if (reply._id === data.reply_id){
                reply.reported = true;
              }
              return reply;
            });
            thread.update(thread, function(err, updatedThread){
              if (!err){
                res.send('UPDATE succeeded');
              } else {
                res.send(`Error(s): [${err.message} ]`);
              }
            });
            } else {
              res.send('Error(s): [ Incorrect thread or report id ]');
              // res.send('Error(s): [ UPDATE failed ]');
            }
          } else {
            res.send(`Error(s): [${err.message} ]`);
          }
        });
      }
    })
    .get(function(req, res){
      if (!req.body) return res.sendStatus(400);
      const data = req.query;
      const board = req.params.board;
      if (board && board.length > 0){
        const MessagesTable = new Messages(db, board);
        MessagesTable.findOne({ $and: [ { _id: data.thread_id} ]}, { delete_password: 0, reported: 0, "replies.delete_password": 0, "replies.reported": 0 }, function(err, thread){
          if (!err){
            if (thread){
              res.json(thread);
            } else {
              res.send('Error(s): [ Wrong Id ]');
            }
          } else {
             res.send(`Error(s): [${err.message} ]`);
          }
        })
      }
    })
    .delete(function(req, res){
      if (!req.body) return res.sendStatus(400);
      const data = req.body;
      const board = req.params.board;
      if (board && board.length > 0){
        const MessagesTable = new Messages(db, board);
        MessagesTable.findOne({ $and: [ { _id: data.thread_id},   { "replies._id": data.reply_id }, { "replies.delete_password": data.delete_password } ]}, function(err, thread){
          if (!err){
            if (thread){
              thread.replies = thread.replies.filter(function(reply){
                if (reply._id === data.reply_id){
                  return false;
                }
                return true;
              });
              thread.update(thread, function(err, updatedThread){
                if (!err){
                  res.send('DELETE succeeded');
                } else {
                  res.send('Error(s): [ Wrong input data ]');
                }
              });
            } else {
              res.send('Error(s): [ Wrong input data ]');
            }
          } else {
            res.send('Error(s): [ Wrong input data ]');
            // res.send('Error(s): [ DELETE failed ]');
          }
        });
      }
    })
};