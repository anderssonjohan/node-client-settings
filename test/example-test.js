var request = require('supertest');
var app = require('../lib/app');
const db = require('../lib/database');
const configkeys = db.get('configkeys')

describe('sample use case', () => {
  before( done => {
    configkeys.remove({}).then( () => done() );
  });
  describe('POST one value for client ios v267 to /config', () => {
    it('responds with 201 Created', done => {
      request(app)
      .post('/config')
      .send({"client": "ios", "version": "267", "key": "ads_endpoint", "value": "/devads"})
      .expect(201)
      .end((err) => {
        if (err) throw err;
        done();
      });
    });
  });
  describe('GET /config/ios/267', () => {
    it('responds with changed config', done => {
      request(app)
      .get('/config/ios/267')
      .expect(200)
      .expect('ETag', 'W/"1"')
      .expect({ads_endpoint: '/devads'})
      .end((err) => {
        if (err) throw err;
        done();
      });
    });
  });
  describe('GET /config/ios/266', () => {
    it('responds with 304 Not Modified', done => {
      request(app)
      .get('/config/ios/266')
      .expect(304)
      .end((err) => {
        if (err) throw err;
        done();
      });
    });
  });
  describe('GET /config/ios/268', () => {
    it('responds with 304 Not Modified', done => {
      request(app)
      .get('/config/ios/268')
      .expect(304)
      .end((err) => {
        if (err) throw err;
        done();
      });
    });
  });
  describe('GET /config/ios/267 with If-None-Match set to current revision', () => {
    it('responds with 304 Not Modified', done => {
      request(app)
      .get('/config/ios/267')
      .set('If-None-Match', 'W/"1"')
      .expect(304)
      .end((err) => {
        if (err) throw err;
        done();
      });
    });
  });
  describe('GET /config/android/267', () => {
    it('responds with 304 Not Modified', done => {
      request(app)
      .get('/config/ios/268')
      .expect(304)
      .end((err) => {
        if (err) throw err;
        done();
      });
    });
  });
  describe('POST another value for client ios v267 to /config', () => {
    it('responds with 201 Created', done => {
      request(app)
      .post('/config')
      .send({"client": "ios", "version": "267", "key": "background_color", "value": "#000"})
      .expect(201)
      .end((err) => {
        if (err) throw err;
        done();
      });
    });
  });
  describe('GET /config/ios/267', () => {
    it('responds with changed config', done => {
      request(app)
      .get('/config/ios/267')
      .expect(200)
      .expect('ETag', 'W/"2"')
      .expect({ads_endpoint: '/devads', background_color: '#000'})
      .end((err) => {
        if (err) throw err;
        done();
      });
    });
  });
});
