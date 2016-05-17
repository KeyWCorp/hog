'use strict';
var expect = require('chai').expect;
var Settings = require('./settings.model');
var settings = JSON.stringify({"name":"test","displayName":"Test:","data":"testing","inputType":"string"
});
describe('Api: Settings',
  function ()
  {
    describe('#Create()',
      function ()
      {
        var id;
        it('should add a settings to the DB',
          function(done)
          {
            Settings.create(settings,
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
            Settings.delete(id, done)
          });
      });
    describe('#Update()',
      function()
      {
        var id;
        before(
          function(done)
          {
            Settings.create(settings,
              function(err, doc)
              {
               
                if(!err)
                  id = doc._id;
                done(err);
              });
          });
        it('should update a settings in the db',
          function(done)
          {
            var p = JSON.parse(settings);
            p.name = 'updated test';
            p = JSON.stringify(p);
            Settings.update(id, p,
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
            Settings.delete(id, done);
          });
      });
    describe('#Delete()',
      function()
      {
        var id;
        before(
          function(done)
          {
            Settings.create(settings,
              function(err, doc)
              {
                if(!err)
                  id = doc._id;
                done(err);
              });
          });
        it('should delete a settings in the db',
          function(done)
          {
            Settings.delete(id,
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
        var name;
        var id;
        before(
          function(done)
          {
            Settings.create(settings,
              function(err, doc)
              {
                if(!err)
                {
                  name = doc.name;
                  id = doc.id;
                }
                done(err);
              });
          });
        it('should find a settings in the db',
          function(done)
          {
            
            Settings.find(name,
              function(err, doc)
              {
                expect(err).to.not.exist;
                expect(doc).to.exist.and.have.property('name', name);
                done(err);
              });
          });
        after(
          function(done)
          {
            Settings.delete(id, done);
          });
      });
    describe('#List()',
      function ()
      {
        it('should return a list of settingss',
          function(done)
          {
            Settings.list(
              function(err, data)
              {
                expect(err).to.not.exist;
                expect(data).to.exist.and.to.not.be.empty;
                done(err);
              });
          });
      });
  });