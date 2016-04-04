var express = require('express'),
    jade = require('jade'),
    bodyParser = require('body-parser'),
    url = require('url');
var app = express();
var personArray = [];
var personId = 0;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('views', './views');
app.set('view engine', 'jade');
app.engine('jade', jade.__express);
app.listen(8081);
app.locals.message = '';
app.locals.bodyColor = '';
app.locals.displayArray = [];
function addtoArray(req){
    var person = {};
    personId++;
    person.pid = personId;
    person.firstName = req.body.fName;
    person.lastName = req.body.lName;
    person.email = req.body.usremail;
    person.langKnown = req.body.langKnown;
    person.daysToMeet = req.body.daysToMeet;
    personArray.push(person);
    console.log('push done');
}
function displayQueryResult(res, queryStr){
    if (queryStr.fName === undefined) {
      queryStr.fName = '';
    }
    if (queryStr.lName === undefined) {
      queryStr.lName = '';
    }
    if (queryStr.email === undefined) {
      queryStr.email = '';
    }
    if (queryStr.languages === undefined) {
      queryStr.languages = '';
    }
    if (queryStr.days === undefined) {
      queryStr.days = '';
    }

    var filteredList = personArray.filter(function (person) {
      console.log(person)
      var containsLanguage = (queryStr.languages === '') ? true : false
      var containsDays = (queryStr.days === '') ? true : false

      queryStr.languages.split(' ').every(function(lang) {
        if (person.langKnown.indexOf(lang) > -1) {
          containsLanguage = true;
          return false;
        }
        return true;
      })

      console.log(queryStr.days.split(' '))
      queryStr.days.split(' ').every(function(day) {
        if (person.daysToMeet.indexOf(day) > -1) {
          containsDays = true;
          return false;
        }
        return true;
      })

      return (
        person.firstName.includes(queryStr.fName) &&
        person.lastName.includes(queryStr.lName) &&
        person.email.includes(queryStr.email) &&
        containsLanguage && containsDays
      )
    })

    app.locals.displayArray = filteredList;
    res.render('CodersDisplay');
  }
function getByFirstName(fName, res){
  var filteredList = personArray.filter(function (person) {
    return (
      person.firstName.includes(fName)
    )
  });
  app.locals.displayArray = filteredList;
  res.render('CodersDisplay');
}
app.get('/', function (req, res) {
  res.render('Landing');
});
app.post('/post_coder', function(req, res){
  console.log(req.body.fName);
  console.log(req.body.lName);
  console.log(req.body.usremail);
  console.log(req.body.langKnown);
  console.log(req.body.daysToMeet);
  try {
      addtoArray(req);
      app.locals.message = '1 new person details added to person arrray. '+
        'Total no of entries in array is : '+personArray.length ;
  } catch (e) {
      console.log(e);
      app.locals.message = 'The action is unsuccessful';
  } finally {
      res.render('PostCoder');
  }
  res.send();
});
app.get(/^\/coders?$/, function(req, res){
  console.log('Inside Coders');
  var browser = req.headers['user-agent'];
  console.log("browser "+ browser);
  if(browser.toString().includes('Chrome')){
    app.locals.bodyColor = '#FFC0CB';
    //res.render('CodersDisplay');
  }
  var urlDetails = url.parse(req.url, true, false);
  var queryStr = urlDetails.query;
  if(queryStr.fName === undefined && queryStr.lName === undefined
    && queryStr.email === undefined && queryStr.languages === undefined
    && queryStr.days === undefined){
      app.locals.displayArray = personArray;
      // console.log('size '+app.locals.displayArray.length);
      res.render('CodersDisplay')
    }else{
      displayQueryResult(res, queryStr);
    }
  res.send();
});
app.get('/get_coder/firstname/:name', function (req, res) {
  var response = 'Get User: ' + req.param('name');
  getByFirstName(req.param('name'), res);
  res.send();
});
app.param('name', function(req, res, next, value){
  console.log("\nRequest received with userid: " + value);
  next();
});
