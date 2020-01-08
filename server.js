const express = require('express');
var cors = require('cors')
var bodyParser = require('body-parser');
var fs = require('fs');
var standard_input = process.stdin;
standard_input.setEncoding('utf-8');



const app = express();
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded
var cmd_data = '';
var text = '';
app.use(cors());
app.set('view engine', 'pug');
console.log("Enter HTML element tag.");


standard_input.on('data', function (data) {

    cmd_data = data.toString();
    cmd_data = cmd_data.replace(/\r?\n|\r/g, "");
 
    if(cmd_data === 'exit'){
        // Program exit.
        console.log("User input complete, program exit.");
        process.exit();
    }

    if(cmd_data === 'h1' || cmd_data === 'h2' || cmd_data === 'h3' || cmd_data === 'h4' || cmd_data === 'h5' || cmd_data === 'h6' || cmd_data === 'p') {
        tag = '\n  ' + `${cmd_data}`;
        fs.appendFile('./views/index.pug', tag , function (err) {
            if (err) throw err;
            //console.log('Updated!');
            console.log("Enter html element value.");
            
          });
    }
    else if(cmd_data === 'ul') {
        tag = '\n  ' + `${cmd_data}`;
        fs.appendFile('./views/index.pug', tag , function (err) {
            if (err) throw err;
            //console.log('Updated!');
            console.log("Enter li element tag.");
            
          });
    }
    else if(cmd_data === 'li') {
        tag = '\n   ' + `${cmd_data}`;
        fs.appendFile('./views/index.pug', tag , function (err) {
            if (err) throw err;
            //console.log('Updated!');
            console.log("Enter li element value.");
            
          });
    }
    else{
        text = ` ${cmd_data}`;
        fs.appendFile('./views/index.pug', text, function (err) {
            if (err) throw err;
            //console.log('Updated!');
            console.log("Enter input html tag.");
          });
    }

});


app.get('', (req,res) => {
    res.render('index');
    
});


app.listen(8081, () => {
 // console.log('Listening at port no 8081');
});
