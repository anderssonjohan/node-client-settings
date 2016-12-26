# Client Settings Service

## Setup

### Clone the repository

```
git clone git@github.com:anderssonjohan/node-client-settings.git
cd node-client-settings
```

### Install dependencies

```
npm install
```


### Local environment requirements

The service depends on MongoDB and connects to the database `clientsettings` by
default. This name can be overriden by the `MONGODB_URI` environment variable.

### Run tests

```
npm test
```

**- or -**

```
npm run test-watch
```

### Start local service connecting to local mongod

```
npm start
```

**- or -**

```
npm run watch
```

## Deploy to Heroku

The following instruction expects [heroku toolbelt](https://devcenter.heroku.com/articles/heroku-cli)
to be around.

### Create an application and deploy

```
heroku apps:create --region eu --addons mongolab:sandbox,papertrail:choklad
git push heroku master

```

### Run some tests

**Grab the url to the application**

```
appurl=https://`heroku domains | tail -2 | head -1`
```

**Post some configuration values**

```
curl -v -d '{"client":"test","version":"1","key":"api_url","value":"/api/v1"}' \
 -H 'Content-Type: application/json' $appurl/config
< HTTP/1.1 201 Created
```

```
curl -v -d '{"client":"test","version":"1","key":"api_url","value":"/api/v2"}' \
 -H 'Content-Type: application/json' $appurl/config
< HTTP/1.1 201 Created
```

```
curl -v -d '{"client":"test","version":"1","key":"icon_url","value":"favicon.ico"}' \
 -H 'Content-Type: application/json' $appurl/config
< HTTP/1.1 201 Created
```

**Get the current configuration**

```
curl -v $appurl/config/test/1
< HTTP/1.1 200 OK
< Etag: W/"3"
{"api_url":"/api/v2","icon_url":"favicon.ico"}
```

**Get the last configuration change**

```
curl -v -H 'If-None-Match: W/"2"' $appurl/config/test/1
< HTTP/1.1 200 OK
< Etag: W/"3"
{"icon_url":"favicon.ico"}
```
