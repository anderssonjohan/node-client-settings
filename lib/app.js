'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./database')
const configkeys = db.get('configkeys')
let debug = require('debug')('client-settings:server');

app.use(bodyParser.json());

let createDocument = payload => {
  return configkeys.insert( {
    client: payload.client,
    version: payload.version,
    revision: 1,
    keys: [
      { key: payload.key, value: payload.value, revision: 1 }
    ] } )
  .then( () => {
    debug( `Document: ${payload.client}/${payload.version} (revision: 1) ` +
           `Key: "${payload.key}" = "${payload.value}"` );
  });
};

let updateDocument = (payload, doc) => {
  doc.revision = doc.revision + 1;
  let configKey = doc.keys.filter( k => k.key === payload.key );
  if( configKey.length === 0 ) {
    doc.keys.push( { key: payload.key, value: payload.value, revision: doc.revision } );
  } else {
    configKey[0].revision = doc.revision;
    configKey[0].value = payload.value;
  }

  return configkeys.update( { _id: doc._id }, doc )
  .then( () => {
    debug( `Document: ${payload.client}/${payload.version} (revision: ${doc.revision}) ` +
           `Key: "${payload.key}" = "${payload.value}"` );
  });
};

app.route('/config').post( (req, res) => {
  let created = () => res.status(201).end();
  let payload = req.body;
  configkeys
  .findOne( { client: payload.client, version: payload.version })
  .then( doc => null === doc ? createDocument(payload) : updateDocument(payload, doc) )
  .then(created);
});
app.route('/config/:client/:version').get( (req, res) => {
  let query = { client: req.params.client, version: req.params.version };
  configkeys.findOne( query ).then( doc => {
    let exists = null !== doc && null !== doc.keys;
    let ifNoneMatch = req.get('If-None-Match');
    let revisionPredicate = () => true;
    let documentRevision = doc && doc.revision;
    if( ifNoneMatch ) {
      // Grab the revision number from the (weak) etag predicate
      let revision = parseInt(ifNoneMatch.replace(/(W\/)?\"(\d+)\"/, '$2'));
      revisionPredicate = docOrConfigKey => docOrConfigKey.revision > revision;
    }

    debug(`Query: ${query.client}/${query.version} Exists: ${exists} Revision: ${documentRevision|'N/A'} If-None-Match: ${ifNoneMatch||'N/A'}` );

    if( !exists || !revisionPredicate(doc) ) {
      res.status(304).end();
      return;
    }

    // Only include changes with greater revision than the revision
    // given in the If-None-Match header
    let result = {};
    doc.keys.filter( revisionPredicate ).forEach( k => {
      result[k.key] = k.value;
    });

    res
    .set('ETag', 'W/"' + doc.revision + '"')
    .send(result)
    .end();
  });
});

module.exports = app;
