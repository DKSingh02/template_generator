var express = require("express");
var bodyParser = require("body-parser");
var data = require("./data.json");
var mappingJson = require("./mapping.json");
var fs = require("fs");
var multer = require("multer");
var upload = multer();
var app = express();

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
var tag = "";

app.get("", function(req, res) {
  res.render("form", {
    Components: data["Components"]
  });
});

app.get("/clear", function(req, res) {
  fs.writeFile("./views/index.pug", "", function() {
    console.log("done");
  });
  res.render("form");
});

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
app.listen(3000);
