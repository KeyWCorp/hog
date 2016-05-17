'use strict';
var expect = require('chai').expect;
var Pig = require('./pig.model');
var pig = JSON.stringify({
  "name":"Test", "data":"load0 = LOAD '/Users/sdemmer/test.data' USING PigStorage(' ') AS (x:int, y:int);\nDUMP load0;", "args":[{"arg":"-x","input":"local"}],
});
describe('Api: Pig',
  function ()
  {
    describe('#Create()',
      function ()
      {
        var id;
        it('should add a pig to the DB',
          function(done)
          {
            Pig.create(pig,
              function(err, doc)
              {
                expect(err).to.not.exist;
                expect(doc).to.exist.and.have.property('_id');
                id = doc._id;
                done(err);
              });
          });
        after(
          function(done)
          {
            //onsole.log('id ', id)
            Pig.delete(id, done)
          });
      });
    describe('#Update()',
      function()
      {
        var id;
        before(
          function(done)
          {
            Pig.create(pig,
              function(err, doc)
              {
               
                if(!err)
                  id = doc._id;
                done(err);
              });
          });
        it('should update a pig in the db',
          function(done)
          {
            var p = JSON.parse(pig);
            p.name = 'updated test';
            p = JSON.stringify(p);
            Pig.update(id, p,
              function(err, doc)
              {
                expect(err).to.not.exist;
                expect(doc).to.exist.and.have.property('name', 'updated test');
                done();
              });
          });
        after(
          function(done)
          {
            Pig.delete(id, done);
          });
      });
    describe('#Delete()',
      function()
      {
        var id;
        before(
          function(done)
          {
            Pig.create(pig,
              function(err, doc)
              {
                if(!err)
                  id = doc._id;
                done(err);
              });
          });
        it('should delete a pig in the db',
          function(done)
          {
            Pig.delete(id,
              function(err, numRemoved)
              {
                expect(err).to.not.exist;
                expect(numRemoved).to.exist.and.equal(1);
                done(err);
              });
          });
      });
    describe('#Find()',
      function()
      {
        var id;
        before(
          function(done)
          {
            Pig.create(pig,
              function(err, doc)
              {
                if(!err)
                  id = doc._id;
                done(err);
              });
          });
        it('should find a pig in the db',
          function(done)
          {
            
            Pig.find(id,
              function(err, doc)
              {
                expect(err).to.not.exist;
                expect(doc).to.exist.and.have.property('_id', id);
                done(err);
              });
          });
        after(
          function(done)
          {
            Pig.delete(id, done);
          });
      });
    describe('#List()',
      function ()
      {
        it('should return a list of pigs',
          function(done)
          {
            Pig.list(
              function(err, data)
              {
                expect(err).to.not.exist;
                expect(data).to.exist.and.to.not.be.empty;
                done(err);
              });
          });
      });
  });