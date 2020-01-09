var express = require("express");
var bodyParser = require("body-parser");
var data = require("./data.json");
var mappingJson = require("./mapping.json");

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

const updateCss = function(req) {
  var styles = req.body.style.split(',');
  fs.appendFileSync("./public/styles.css", '.' + req.body.class + ' {');
  for(var i=0;i<styles.length;i++) {
    fs.appendFileSync("./public/styles.css", '\r\n\t' + styles[i] + ';');
  }
  fs.appendFileSync("./public/styles.css", '\r\n}\r\n\n');
}

// app.get("/", function(req, res) {
//   outputHtml(res);
// });

app.get("", function(req, res) {
  res.render("form", {
    Components: data["Components"]
  });
});

app.post("/clearPug", function(req, res) {
  fs.writeFile('./views/index.pug', 'html\r\n head\r\n  title Form Tester\r\n  link(rel="stylesheet", type="text/css", href="styles.css")\r\n body', function() {
    outputHtml(res);});
});

app.post("/clearCss", function(req, res) {
  fs.writeFile('./public/styles.css', '', function() {});
});

// app.get("/", function(req, res) {
//   res.render("form");
// });

// app.get("", function (request, response) {
//     response.render('dropdowndemo', {
//         Components: data['Components'],
//     })
// });

app.post("/", function(request, response) {
  let selectedComponent = request.body.dropDown;
  let selectedComponentValue = request.body.value;
  let selectedHtmlTag = mappingJson[selectedComponent];
  console.log("Hello" + request.body.value);

  if(selectedHtmlTag) {
      enterTagInJson(selectedHtmlTag);
  }
  else {
    enterTagValueJson(selectedComponentValue);
  }



  //enterElementInDom(selectedHtmlTag);
  response.render("form", {
    component: request.body.dropDown,
    Components: data["Components"]
  });
});

// app.get("/tagValue", function(req, res) {
//     res.render("form", {
//       Components: data["Components"]
//     });
//   });

app.post("/render_page", (req, res) => {
  res.render("index");
});

function enterTagInJson(selectedHtmlTag) {
    fs.readFile('./template.json', 'utf-8', function(err, data) {
        if (err) throw err
    
        var arrayOfObjects = JSON.parse(data)
        arrayOfObjects.template.push({
            tag: selectedHtmlTag 
        })
    
        console.log(arrayOfObjects)
    
        fs.writeFile('./template.json', JSON.stringify(arrayOfObjects), 'utf-8', function(err) {
            if (err) throw err
            console.log('Done!')
        })
      });
}

function enterTagValueJson(value) {
    fs.readFile('./template.json', 'utf-8', function(err, data) {
        if (err) throw err
    
        var arrayOfObjects = JSON.parse(data)
        arrayOfObjects.template.push({
            value: value 
        })
    
        console.log(arrayOfObjects)
    
        fs.writeFile('./template.json', JSON.stringify(arrayOfObjects), 'utf-8', function(err) {
            if (err) throw err
            console.log('Done!')
        })
      });
}


function enterElementInDom(selectedHtmlTag) {
    //app.post("/", function(req, res) {
        // This is only for header and plain text
        tag = selectedHtmlTag;
        if (
          tag === "h1" ||
          tag === "h2" ||
          tag === "h3" ||
          tag === "h4" ||
          tag === "h5" ||
          tag === "h6" ||
          tag === "p"
        ) {
          cmd_data = req.body.tag + " " + req.body.value;
          tagElement = "\r\n" + `${cmd_data}`;
          fs.appendFile("./views/index.pug", tagElement, function(err) {
            if (err) throw err;
          });
        }
      
        // This is for list items
        else if (tag === "ul" || tag === "div") {
          cmd_data = req.body.tag;
          tagElement = "\r\n" + `${cmd_data}`;
          fs.appendFile("./views/index.pug", tagElement, function(err) {
            if (err) throw err;
          });
        } else if (tag === "li") {
          cmd_data = req.body.tag + " " + req.body.value;
          tagElement = "\n " + `${cmd_data}`;
          fs.appendFile("./views/index.pug", tagElement, function(err) {
            if (err) throw err;
          });
        } else if (tag === "img") {
          cmd_data = req.body.tag + "(src = '" + req.body.value + "')";
          tagElement = "\n " + `${cmd_data}`;
          fs.appendFile("./views/index.pug", tagElement, function(err) {
            if (err) throw err;
          });
        } else if (tag === "code") {
          cmd_data = req.body.tag + " " + req.body.value;
          tagElement = "\n " + `${cmd_data}`;
          fs.appendFile("./views/index.pug", tagElement, function(err) {
            if (err) throw err;
          });
        }
        //res.render("form");
      //});
      
}

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
    fs.appendFile("./views/index.pug", tagElement, function(err) {
      outputHtml(res);
      if (err) throw err;
    });
  } else if (tag === "open ul" || tag === "open div") {
    if(classname) {
      cmd_data = req.body.tag.split(' ')[1] + "." + classname;
    }
    else {
      cmd_data = req.body.tag.split(' ')[1];
    }
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
    if(classname) {
      cmd_data = req.body.tag + "." + classname + " " + req.body.value ;
    }
    else {
      cmd_data = req.body.tag + " " + req.body.value;
    }
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
  if(req.body.style)updateCss(req);
});

app.listen(3000);
