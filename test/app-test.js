var request = require('supertest');
var app = require('../lib/app');
const db = require('../lib/database');
const configkeys = db.get('configkeys')

describe('route ', () => {

  describe('POST /config', () => {
    beforeEach( done => {
      configkeys.remove({}).then( () => done() );
    });

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

  describe('GET /config/:client/:version', () => {
    beforeEach( done => {
      configkeys.remove( { } ).then(
      configkeys.insert(
        {
          client: 'ios',
          version: '267',
          revision: 2,
          keys: [
            { key: 'ads_endpoint', value: '/devads', revision: 1 },
            { key: 'background_color', value: '#000', revision: 2 }
          ]
        })
      .then( () => done() ));
    });

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

    it('responds with 304 Not Modified', done => {
      request(app)
      .get('/config/ios/267')
      .set('If-None-Match', 'W/"2"')
      .expect(304)
      .end((err) => {
        if (err) throw err;
        done();
      });
    });

    it('responds with only changed', done => {
      request(app)
      .get('/config/ios/267')
      .set('If-None-Match', 'W/"1"')
      .expect(200)
      .expect('ETag', 'W/"2"')
      .expect({background_color: '#000'})
      .end((err) => {
        if (err) throw err;
        done();
      });
    });
  });
});

