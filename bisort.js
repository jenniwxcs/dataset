function PrefList(n, limit) {
    this.size = n;
    this.limit = limit;
    this.items = [{item: 0, equals: []}];
    this.current = {item: 1, try: 0, min: 0, max: 1};

    this.addAnswer = function(x, y, pref) {
        if (pref == 0) {
            this.items[this.current.try].equals.push(this.current.item);
            this.current = {item: ++this.current.item, try: 0, min: 0, max: this.items.length};
        } else {
            if (pref == -1) this.current.max = this.current.try
            else this.current.min = this.current.try + 1;

            if (this.current.min == this.current.max) {
                this.items.splice(this.current.min, 0, {item: this.current.item, equals: []});
                this.current = {item: ++this.current.item, try: 0, min: 0, max: this.items.length};
            } else if (this.current.min >= this.limit) {
                if (this.items[this.limit]) this.items[this.limit].equals.push(this.current.item);
                else this.items.splice(this.limit, 0, {item: this.current.item, equals: []});
                this.current = {item: ++this.current.item, try: 0, min: 0, max: this.items.length};
            }
        }
        console.log("post-add answer");
        console.log(JSON.stringify(this.items));
        console.log(JSON.stringify(this.current));
        console.log("-----------------");
    }

    this.getQuestion = function() {
        if (this.current.item >= this.size) return null;
        this.current.try = Math.min(this.limit-1, Math.floor((this.current.min + this.current.max) / 2));

        console.log("post-get question");
        console.log(JSON.stringify(this.items));
        console.log(JSON.stringify(this.current));
        console.log("-----------------");

        return({a: this.current.item, b: this.items[this.current.try].item});
    }

    this.getOrder = function() {
        var index = [];
        for (var i in this.items) {
            var equal = [this.items[i].item];
            for (var j in this.items[i].equals) {
                equal.push(this.items[i].equals[j]);
            }
            index.push(equal);
        }
        return(index);
    }

    this.getLimit = function() {
        return this.limit;
    }
}

var t, c = 0, q;
var dataset = [];

$(function(){
    _getDataset();
});

function _getDataset() {

    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        dataset = (this.responseText||"").split(",");
      }
    };
    xmlhttp.open("GET","./dataset.php?q=" + dataset, true);
    xmlhttp.send();
}


function start(limit) {
    var len = dataset.length;
    limit = limit || len;
    t = new PrefList(len, limit);

    $("#info").addClass("no-display");
    $("#comparison").removeClass("no-display");
    $("#results").addClass("no-display");

    processQuestion();
}

function processQuestion() {
    q = t.getQuestion();
    if (q != null) {
        displayQuestion(q);
    } else {
        showResults();
    }
}

function displayQuestion(q) {
    $("#qn").text(++c);
    $(".left").text(dataset[q.a]);
    $(".right").text(dataset[q.b]);
    console.log(dataset[q.a] + " vs. " + dataset[q.b]);
}

function chooseLeft() {
    processAnswer(-1);
}
function chooseRight() {
    processAnswer(1);
}

function noChoice() {
    processAnswer(0);
}

function processAnswer(answer) {
    t.addAnswer(q.a, q.b, answer);
    processQuestion();
}

// PERFORM SORT BASED ON TABLE AND DISPLAY RESULT
function showResults() {
    var index = t.getOrder();
    var limit = t.getLimit();
    var html = "";

    for (var i = 0; i < limit; i++) {
        var len = index[i].length;

        var rClass = i%2 == 0 ? "row-even" : "row-odd";
        html += "<div class='row " + rClass + "'>";
        html += "<div class='rank'>";
        html += (i+1) + "</div>";

        for (var j = 0; j < len; j++) {
            if (len > 1) {
                if (j == 0) {
                    html += "<div>(" + len + "-way tie)</div>";
                    html += "</div>"; // close row and open new one
                }

                html += "<div class='row " + rClass +"'>";
                html += "<div class='rank'>&nbsp;</div>"
            }

            html += "<div>" + dataset[index[i][j]] + "</div>";
            html += "</div>"; // close row
            
        }
    }

    $("#comparison").addClass("no-display");
    $("#results").removeClass('no-display');
    $("#results").html(html);
}

function debugResults() {
    var index = t.getOrder();
    console.log("LIST IN ORDER:");
    for (var i = 0, pos = 1; i < index.length; i++) {
        var len = index[i].length;
        var pre = pos + ". " + (len > 1 ? "(" + len + "-way tie)" : "");
        for (var j = 0; j < len; j++) {
            console.log(pre + dataset[index[i][j]]);
            pre = "&nbsp;&nbsp;&nbsp;&nbsp;";
        }
        pos ++;
    }
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
}