var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
var multer = require("multer");
var upload = multer();
var app = express();
var cleaner = require('clean-html');
const pug = require('pug');

app.set("view engine", "pug");
app.set("views", "./views");

// for parsing multipart/form-data
app.use(upload.array());
app.use(express.static("public"));

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-
//form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

var cmd_data = "";
var tagElement = "";
var tag = '';
var levelOfNesting = 2;
var options = {
  'indent': '\t',
  'add-break-around-tags': ['ul','li']
};

const printSpaces = function() {
  var spaces = '';
  for(var i=0;i<levelOfNesting;i++)spaces+=' ';
  return spaces; 
}

const outputHtml = function(res) {
  var compiledCode = pug.compileFile('./views/index.pug');
  cleaner.clean(compiledCode(), options, function(html) {
    res.render("form",{output: html});
  });
}

app.get("/", function(req, res) {
  outputHtml(res);
});

app.post("/clear", function(req, res) {
  fs.writeFile('./views/index.pug', 'html\r\n head\r\n  title Form Tester\r\n body', function() {
    outputHtml(res);
    console.log('done')});
});

app.post("/render_page", (req, res) => {
  res.render("index");
});

app.post("/", function(req, res) {
  tag = req.body.tag

  if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4" || tag === "h5" || tag === "h6" || tag === "p") {
    cmd_data = req.body.tag + " " + req.body.value;
    tagElement = "\r\n" + printSpaces() + `${cmd_data}`;
    fs.appendFile("./views/index.pug", tagElement, function(err) {
      outputHtml(res);
      if (err) throw err;
    });
  } else if (tag === "open ul" || tag === "open div") {
    cmd_data = req.body.tag.split(' ')[1];
    tagElement = "\r\n" + printSpaces() + `${cmd_data}`;
    levelOfNesting+=1
    fs.appendFile("./views/index.pug", tagElement, function(err) {
      outputHtml(res);
      if (err) throw err;
    });
  } else if (tag === "close ul" || tag === "close div") {
      levelOfNesting-=1;
      outputHtml(res);
  } else if (tag === "li") {
    cmd_data = req.body.tag + " " + req.body.value;
    tagElement = "\n" + printSpaces() + `${cmd_data}`;
    fs.appendFile("./views/index.pug", tagElement, function(err) {
      outputHtml(res);
      if (err) throw err;
    });
  }
  else if (tag === "img") {
      cmd_data = req.body.tag + "(src = '" + req.body.value + "')";
      tagElement = "\n" + printSpaces() + `${cmd_data}`;
      fs.appendFile("./views/index.pug", tagElement, function(err) {
        outputHtml(res);
        if (err) throw err;
      });
  }
  else if (tag === "code") {
    cmd_data = req.body.tag + " " + req.body.value;
    tagElement = "\n" + printSpaces() + `${cmd_data}`;
    fs.appendFile("./views/index.pug", tagElement, function(err) {
      outputHtml(res);
      if (err) throw err;
    });
  }
});

app.listen(3000);
