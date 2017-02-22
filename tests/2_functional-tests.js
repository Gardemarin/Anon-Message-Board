/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var server = require('../server');

var testThread, wrongThreadId, wrongDeletePassword, testThreadPassword = 'password1234',
    testReplyThread, testReplyPassword = 'reply_password1234';

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/threads/test')
        .send({
          text: 'test text',
          delete_password: testThreadPassword
        })
        .end(function(err, res){
         assert.equal(res.status, 200);
         assert.equal(res.type, 'text/html');
         assert.equal(res.text, 'SAVE succeeded');
          done();
        });
      });
      
      test('"Text" field is empty', function(done) {
       chai.request(server)
        .post('/api/threads/test')
        .send({
          delete_password: testThreadPassword
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.isArray(res.redirects);
          expect(res.redirects[0]).to.be.empty;
          assert.equal(res.text, 'Error(s): [ Text field is empty ]');
          done();
        });
      });
      
      test('"Delete password" field is empty', function(done) {
       chai.request(server)
        .post('/api/threads/test')
        .send({
          text: 'test text'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.isArray(res.redirects);
          expect(res.redirects[0]).to.be.empty;
          assert.equal(res.text, 'Error(s): [ Delete password field is empty ]');
          done();
        });
      });
      
      test('Both fields are empty', function(done) {
       chai.request(server)
        .post('/api/threads/test')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.isArray(res.redirects);
          expect(res.redirects[0]).to.be.empty;
          assert.equal(res.text, 'Error(s): [ Text field is empty, Delete password field is empty ]');
          
          done();
        });
      });
      
    });
    
    suite('GET', function() {
      test('Get all test threads', function(done) {
       chai.request(server)
        .get('/api/threads/test')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
         
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'text');
          assert.property(res.body[0], 'replies');
          assert.property(res.body[0], 'bumped_on');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'replycount');
         
          assert.notProperty(res.body[0], 'delete_password');
          assert.notProperty(res.body[0], 'reported');
          
          assert.isBelow(res.body.length, '11');
          assert.isBelow(res.body[0].replies.length, '4');
         
          testThread = res.body[0];
          testReplyThread = res.body[1];
          done();
        });
      });
      
    });
    
    suite('PUT', function() {
      
      test('Change reported to true (return \'success\')', function(done) {
       chai.request(server)
        .put('/api/threads/test')
        .send({
           thread_id: testThread._id
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.equal(res.text, 'UPDATE succeeded');
          done();
        });
      });
      
      test('Send empty thread_id (thread_id don\'t exist)', function(done) {
        chai.request(server)//
        .put('/api/threads/test')
        .send({
           thread_id: wrongThreadId
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
          
          // assert.equal(res.text, 'Error: [could not update report: _id {${wrongThreadId}}]');
          assert.equal(res.text, 'Error(s): [ Wrong _id ]')
          done();
        });
      });
    });

    suite('DELETE', function() {
//       test('Deletes test thread (return \'DELETE succeeded\')', function(done) {
        
//        chai.request(server)
//         .delete('/api/threads/test')
//         .send({
//            thread_id: testThread._id,
//            delete_password: testThreadPassword
//          })
//         .end(function(err, res){
//           assert.equal(res.status, 200);
//           assert.equal(res.type, 'text/html');
      
//           assert.equal(res.text, 'DELETE succeeded');
//           done();
//        });
//       });
      
      test('Send empty password (return "wrong password")', function(done) {

       chai.request(server)
        .delete('/api/threads/test')
        .send({
           thread_id: testThread._id
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
          assert.equal(res.text, 'Error(s): [ Wrong id or password ]');
          done();
        });
      });
      
      test('Send empty id (return "wrong password")', function(done) {

       chai.request(server)
        .delete('/api/threads/test')
        .send({
           delete_password: testThreadPassword
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.equal(res.text, 'Error(s): [ Wrong id or password ]');
          done();
         });
        });
      
      test('Send empty _id & delete_password (return "wrong passowrd")', function(done) {

       chai.request(server)
        .delete('/api/threads/test')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.equal(res.text, 'Error(s): [ Wrong id or password ]');
          done();
        });
      });
    });
  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/replies/test')
        .send({
          thread_id: testReplyThread._id,
          text: 'reply text',
          delete_password: testReplyPassword
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
         
          assert.property(res.body, 'thread_id');
          done();
        });
      });
      
      test('Wrong "Thread id"', function(done) {
       chai.request(server)
        .post('/api/replies/test')
        .send({
          thread_id: 'anyID',
          text: 'reply text',
          delete_password: testReplyPassword
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
          
         assert.isArray(res.redirects);
          expect(res.redirects[0]).to.be.empty;
          assert.equal(res.text, 'Error(s): [ Wrong Id ]');
          done();
        });
      });
      
      test('"Thread id" field is empty', function(done) {
       chai.request(server)
        .post('/api/replies/test')
        .send({
          text: 'reply text',
          delete_password: testReplyPassword
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
          
          assert.isArray(res.redirects);
          expect(res.redirects[0]).to.be.empty;
          assert.equal(res.text, 'Error(s): [ Wrong Id ]');
          done();
        });
      });
      
      test('"Text" field is empty', function(done) {
       chai.request(server)
        .post('/api/replies/test')
        .send({
          thread_id: testReplyThread._id,
          text: '',
          delete_password: testReplyPassword
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.isArray(res.redirects);
          expect(res.redirects[0]).to.be.empty;
          assert.equal(res.text, 'Error(s): [ Text field is empty ]');
          done();
        });
      });
      
      test('"Delete password" field is empty', function(done) {
       chai.request(server)
        .post('/api/replies/test')
        .send({
          thread_id: testReplyThread._id,
          text: 'reply text'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
          assert.isArray(res.redirects);
         
          expect(res.redirects[0]).to.be.empty;
          assert.equal(res.text, 'Error(s): [ Delete password field is empty ]');
          done();
        });
      });
      
      test('All fields are empty', function(done) {
       chai.request(server)
        .post('/api/replies/test')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.isArray(res.redirects);
          expect(res.redirects[0]).to.be.empty;
          assert.equal(res.text, 'Error(s): [ Wrong Id, Text field is empty, Delete password field is empty ]');
          
          done();
        });
      });
      
      test('Wrong Id and empty "Delete password" field', function(done) {
       chai.request(server)
        .post('/api/replies/test')
        .send({
          thread_id: 'any id',
          text: 'reply text'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.isArray(res.redirects);
          expect(res.redirects[0]).to.be.empty;
          assert.equal(res.text, 'Error(s): [ Delete password field is empty ]');
          
          done();
        });
      });
      
    });
    
    suite('GET', function() {
      test('Get full thread', function(done) {
       chai.request(server)
        .get('/api/replies/test')
        .query({
          thread_id: testReplyThread._id
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
         
          assert.property(res.body, '_id');
          assert.property(res.body, 'text');
          assert.property(res.body, 'replies');
          assert.property(res.body, 'bumped_on');
          assert.property(res.body, 'created_on');
         
          assert.notProperty(res.body, 'delete_password');
          assert.notProperty(res.body, 'reported');
          
          assert.property(res.body.replies[0], '_id');
          assert.property(res.body.replies[0], 'text');
          assert.property(res.body.replies[0], 'created_on');
         
          assert.notProperty(res.body.replies[0], 'delete_password');
          assert.notProperty(res.body.replies[0], 'reported');
                   
          testReplyThread = res.body;
          done();
        });
      });
      
      test('Request without  thread Id', function(done) {
       chai.request(server)
        .get('/api/replies/test')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.equal(res.text, 'Error(s): [ Wrong Id ]');
          done();
        });
      });
      
      test('Request with wrong thread Id', function(done) {
       chai.request(server)
        .get('/api/replies/test')
        .query({
          thread_id: 'any id'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.equal(res.text, 'Error(s): [ Wrong Id ]');
          done();
        });
      });
    });
    
    suite('PUT', function() {
      test('Change reported to true (return \'success\')', function(done) {
       chai.request(server)
        .put('/api/replies/test')
        .send({
           thread_id: testReplyThread._id,
           reply_id: testReplyThread.replies[0]._id
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.equal(res.text, 'UPDATE succeeded');
          done();
        });
      });
      
      test('Empty thread id', function(done) {
       chai.request(server)
        .put('/api/replies/test')
        .send({
           // thread_id: testReplyThread._id,
           reply_id: testReplyThread.replies[0]._id
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');

          assert.equal(res.text, 'Error(s): [ Incorrect thread or report id ]');
          done();
        });
      });
      
      test('Empty reply id', function(done) {
       chai.request(server)
        .put('/api/replies/test')
        .send({
           thread_id: testReplyThread._id
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');

          assert.equal(res.text, 'Error(s): [ Incorrect thread or report id ]');
          done();
        });
      });
      
      test('Empty reply and thread id', function(done) {
       chai.request(server)
        .put('/api/replies/test')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.equal(res.text, 'Error(s): [ Incorrect thread or report id ]');
          done();
        });
      });
      
      test('Wrong thread id', function(done) {
       chai.request(server)
        .put('/api/replies/test')
        .send({
           thread_id: 'any id',
           reply_id: testReplyThread.replies[0]._id
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.equal(res.text, 'Error(s): [ Wrong Id ]');
          done();
        });
      });
      
      test('Wrong reply id', function(done) {
       chai.request(server)
        .put('/api/replies/test')
        .send({
           thread_id: testReplyThread._id,
           reply_id: 'any id'
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.equal(res.text, 'Error(s): [ Incorrect thread or report id ]');
          done();
        });
      });
      
      test('Wrong reply and thread id', function(done) {
       chai.request(server)
        .put('/api/replies/test')
        .send({
           thread_id: 'any id',
           reply_id: 'any id'
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');

          assert.equal(res.text, 'Error(s): [ Wrong Id ]');
          done();
        });
      });
    });
    
    suite('DELETE', function() {
      test('Deletes test thread reply (return \'DELETE success\')', function(done) {
       chai.request(server)
        .delete('/api/replies/test')
        .send({
           thread_id: testReplyThread._id,
           delete_password: testReplyPassword,
           reply_id: testReplyThread.replies[0]._id
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
      
          assert.equal(res.text, 'DELETE succeeded');
          done();
        });
      });
      
      test('Thread id is empty', function(done) {
       chai.request(server)
        .delete('/api/replies/test')
        .send({
           delete_password: testReplyPassword,
           reply_id: testReplyThread.replies[0]._id
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.equal(res.text, 'Error(s): [ Wrong input data ]');
          done();
        });
      });
      
      test('Delete password is empty', function(done) {
       chai.request(server)
        .delete('/api/replies/test')
        .send({
           thread_id: testReplyThread._id,
           reply_id: testReplyThread.replies[0]._id
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.equal(res.text, 'Error(s): [ Wrong input data ]');
          done();
        });
      });
      
     test('Reply id is empty', function(done) {
       chai.request(server)
        .delete('/api/replies/test')
        .send({
           thread_id: testReplyThread._id,
           delete_password: testReplyPassword
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.equal(res.text, 'Error(s): [ Wrong input data ]');
          done();
        });
      });
      
      test('Empty fields', function(done) {
       chai.request(server)
        .delete('/api/replies/test')
        .end(function(err, res){
          assert.equal(res.status, 200);
         
          assert.equal(res.type, 'text/html');
          assert.equal(res.text, 'Error(s): [ Wrong input data ]');
          done();
        });
      });
      
      test('Wrong thread id', function(done) {
       chai.request(server)
        .delete('/api/replies/test')
        .send({
           thread_id: 'any ID',
           delete_password: testReplyPassword,
           reply_id: testReplyThread.replies[0]._id
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.equal(res.text, 'Error(s): [ Wrong input data ]');
          done();
        });
      });
      
      test('Wrong reply id', function(done) {
       chai.request(server)
        .delete('/api/replies/test')
        .send({
           thread_id: testReplyThread._id,
           delete_password: testReplyPassword,
           reply_id: 'any ID'
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.equal(res.text, 'Error(s): [ Wrong input data ]');
          done();
        });
      });
      
      test('Wrong reply password', function(done) {
       chai.request(server)
        .delete('/api/replies/test')
        .send({
           thread_id: testReplyThread._id,
           delete_password: 'any password',
           reply_id: testReplyThread.replies[0]._id
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
         
          assert.equal(res.text, 'Error(s): [ Wrong input data ]');
          done();
        });
      });
    });
  });

});
