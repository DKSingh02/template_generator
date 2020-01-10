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
var prevCommands = [];
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

const updateCss = function(req) {
  var styles = req.body.style.split(',');
  fs.appendFile("./public/styles.css", '.' + req.body.class + ' {', function(err) {if (err) throw err;});
  for(var i=0;i<styles.length;i++) {
    fs.appendFile("./public/styles.css", '\r\n\t' + styles[i] + ';', function(err) {if (err) throw err;});
  }
  fs.appendFile("./public/styles.css", '\r\n}\r\n\n', function(err) {if (err) throw err;});
}

const appendToFile = function(res, tagElement) {
  prevCommands.push(tagElement.length);
  fs.appendFile("./views/index.pug", tagElement, function(err) {
    outputHtml(res);
    if (err) throw err;
  });
}

app.get("/", function(req, res) {
  outputHtml(res);
});

app.post("/clearPug", function(req, res) {
  fs.writeFile('./views/index.pug', 'html\r\n head\r\n  title Form Tester\r\n  link(rel="stylesheet", type="text/css", href="styles.css")\r\n body', function() {
    outputHtml(res);});
});

app.post("/clearCss", function(req, res) {
  fs.writeFile('./public/styles.css', '', function() {});
});

app.post("/render_page", (req, res) => {
  res.render("index");
});

app.post("/undo", (req, res) => {
  fs.stat('./views/index.pug', function(err, stats) {
    if (err) throw err;
    fs.truncate('./views/index.pug', stats.size - prevCommands.pop(), function() {
      outputHtml(res);
    });
  });
});

app.post("/", function(req, res) {
  tag = req.body.tag;
  classname = req.body.class;

  if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4" || tag === "h5" || tag === "h6" || tag === "p") {
    if(classname) {
      cmd_data = req.body.tag + "." + classname + " " + req.body.value;
    }
    else {
      cmd_data = req.body.tag + " " + req.body.value;
    }
    tagElement = "\r\n" + printSpaces() + `${cmd_data}`;
    appendToFile(res,tagElement);
  } else if (tag === "open ul" || tag === "open div") {
    if(classname) {
      cmd_data = req.body.tag.split(' ')[1] + "." + classname;
    }
    else {
      cmd_data = req.body.tag.split(' ')[1];
    }
    tagElement = "\r\n" + printSpaces() + `${cmd_data}`;
    levelOfNesting+=1
    appendToFile(res,tagElement);
  } else if (tag === "close ul" || tag === "close div") {
      levelOfNesting-=1;
      outputHtml(res);
  } else if (tag === "li") {
    if(classname) {
      cmd_data = req.body.tag + "." + classname + " " + req.body.value ;
    }
    else {
      cmd_data = req.body.tag + " " + req.body.value;
    }
    tagElement = "\n" + printSpaces() + `${cmd_data}`;
    appendToFile(res,tagElement);
  }
  else if (tag === "img") {
      cmd_data = req.body.tag + "(src = '" + req.body.value + "')";
      tagElement = "\n" + printSpaces() + `${cmd_data}`;
      appendToFile(res,tagElement);
  }
  else if (tag === "code") {
    cmd_data = req.body.tag + " " + req.body.value;
    tagElement = "\n" + printSpaces() + `${cmd_data}`;
    appendToFile(res,tagElement);
  }
  if(req.body.style)updateCss(req);
});

app.listen(3000);
