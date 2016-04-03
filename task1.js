var http = require('http');
var url = require('url');
var qstring = require('querystring');
var personArray = [];
var personId = 0;
function displayPage(res){
  res.write('<form method = "POST" action = "post_coder">');
  res.write('<table>');
  res.write('<tr><td>First Name</td><td><input type = "text" id = "fName" name = "fName" ' +
    'placeholder = "Enter your First Name"></td></tr>');
  res.write('<tr><td>Last Name</td><td><input type = "text" id = "lName" name = "lName" '+
    'placeholder = "Enter your Last Name"></td></tr>');
  res.write('<tr><td>E-mail</td><td><input type="email" name="usremail" '+
    'placeholder="user@mydomain.com"></td></tr>');
  res.write('<tr><td>Languages known</td><td><select multiple name="langKnown">'+
    '<option value="C">C</option>'+
    '<option value="java">Java</option>'+
    '<option value="Python">Python</option>'+
    '<option value="Javascript">Javascript</option>'+
    '<option value="Pascal">Pascal</option>'+
    '<option value="Ruby">Ruby</option>'+
    '<option value="Python">Python</option>'+
    '</select><p>Hold down the Ctrl (windows) / Command (Mac) button to	select multiple options.</p></td></tr>');
  res.write('<tr><td>Days of week you can meet</td><td><select multiple name="daysToMeet">'+
    '<optgroup label="Weekdays">'+
    '<option value="Monday">Monday</option>'+
    '<option value="Tuesday">Tuesday</option>'+
    '<option value="Wednesday">Wednesday</option>'+
    '<option value="Thursday">Thursday</option>'+
    '<option value="Friday">Friday</option>'+
    '</optgroup>'+
    '<optgroup label="Weekend">'+
    '<option value="Saturday">Saturday</option>'+
    '<option value="Sunday">Sunday</option>'+
    '</optgroup>'+
    '</select><p>Hold down the Ctrl (windows) / Command (Mac) button to	select multiple options.</p></td></tr>');
  res.write('<tr><td align="right"><input type="submit" value="Submit"></td><td>'+
    '<input type="reset" value="Clear"></td></tr>');
  res.write('</table></form>');
}
function methodError(res){
  res.setHeader("Content-Type", "text/html");
  res.writeHead(405);
  res.write('Method not supported');
}
function pageNotFoundError(res){
  res.setHeader("Content-Type", "text/html");
  res.writeHead(404);
  res.write('Requested URL not found');
}
function endRequest(res){
  res.end('\n</body></html>');
}
function addtoArray(parameterlist){
    var person = {};
    personId++;
    person.pid = personId;
    person.firstName = parameterlist.fName;
    person.lastName = parameterlist.lName;
    person.email = parameterlist.usremail;
    person.langKnown = parameterlist.langKnown;
    person.daysToMeet = parameterlist.daysToMeet;
    personArray.push(person);
    console.log('push done');
    // console.log(person.firstName);
    // console.log(person.lastName);
    // console.log(person.email);
    // console.log(person.langKnown);
    // console.log(person.daysToMeet);

}
function printArray(res){
  for(index =0; index < personArray.length; index++){
    res.write('<tr><td>'+ personArray[index].firstName +'</td>'+
              '<td>'+ personArray[index].lastName +'</td>'+
              '<td>'+ personArray[index].email +'</td>'+
              '<td>'+ personArray[index].langKnown +'</td>'+
              '<td>'+ personArray[index].daysToMeet +'</td></tr>');
  }
  res.write('</table>');
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

    filteredList.forEach(function (person) {
      res.write(
        '<tr><td>'+ person.firstName +'</td>'+
        '<td>'+ person.lastName +'</td>'+
        '<td>'+ person.email +'</td>'+
        '<td>'+ person.langKnown +'</td>'+
        '<td>'+ person.daysToMeet +'</td></tr>'
      );

    })

    res.write('</table>');

}
http.createServer(function (req, res){
  var urlDetails = url.parse(req.url, true, false);
  console.log("URL is : "+req.url);
    if(req.url === '/'){
      if(req.method === 'GET'){
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        console.log("Found");
        res.write('<html><head></head><body>');
        displayPage(res);
        endRequest(res);
      }else{
        console.log("Method not found");
        methodError(res);
        endRequest(res);
      }
    }else if (req.url === '/post_coder') {
      console.log("method", req.method);
      if(req.method === 'POST'){
        var reqData = '';
        req.on('data', function (requestData) {
          reqData += requestData;
        });
        req.on('end', function() {
          var postParams = qstring.parse(reqData);
          res.write('<html><head></head><body>');

          try {
              addtoArray(postParams);
              res.write('<h2>The action is successful</h2>\n');
              console.log("length : "+personArray.length);
              res.write('<h3>1 new person details added to person arrray. '+
                'Total no of entries in array is : '+personArray.length +'</h3>');
          } catch (e) {
              console.log(e);
              res.write('The action is unsuccessful');
          } finally {

          }

          displayPage(res);
          endRequest(res);
        });
      }else{
        console.log("Method not found");
        methodError(res);
        endRequest(res);
      }
    }else if(req.url.toString().startsWith('/coders')){
      var browser = req.headers['user-agent'];
      console.log("browser "+ browser);
      if(browser.toString().includes('Chrome')){
        res.write('<html><head></head><body bgcolor="pink"><table border="1"><tr>');
        res.write('<td>First Name</td>'+
                  '<td>Last Name</td>'+
                  '<td>Email</td>'+
                  '<td>Languages Known</td>'+
                  '<td>Days Can Meet</td>');
        res.write('</tr>');
      }
      console.log("Match Found");
      if(req.method === 'GET'){
        var queryStr = urlDetails.query;
        if(queryStr.fName === undefined && queryStr.lName === undefined
          && queryStr.email === undefined && queryStr.languages === undefined
          && queryStr.days === undefined){
            printArray(res);
          }else{
            displayQueryResult(res, queryStr);
          }
        endRequest(res);
      }else{
        console.log("Method not found");
        methodError(res);
        endRequest(res);
      }
    }else{
      console.log('Page not found');
      pageNotFoundError(res);
      endRequest(res);
    }

}).listen(8081);
