function parse(){
    document.getElementById('errorName').innerHTML = "";
    document.getElementById('errorMsg').innerHTML = "";
    let text = document.getElementById("boolAlgInput").value
    text = text.replace(/\n/g, ' ');
    let result;
    try{
        result = new Parser(text).parse();
    }catch(err){
        document.getElementById('errorName').innerHTML = err.name;
        document.getElementById('errorMsg').innerHTML = err.message;
        return;
    }
    var columnUS = result.generateTruthTableComlumn({});
    var column = {};
    Object.keys(columnUS).sort().forEach(function(key) {
        column[key] = columnUS[key];
    });

    var outUS = {}
    while(true){
        outUS[Object.values(column).join(",")] = result.toTruthTable(column);
        if(!Object.values(column).includes(false))break;
        var index = 0;
        for(var key in column){

            if(column[key] == true){
                index++;
            }else{
                column[key] = true;
                break;
            }
        }
        if(index > 0 && index < Object.keys(column).length){
            for(var key in column){
                index--;
                if(index >= 0){
                    column[key]= false;
                }else{
                    break;
                }
            }
        }
    }
    var out = {};
    Object.keys(outUS).sort().forEach(function(key) {
        out[key] = outUS[key];
    });
    buildTruthTable(out, column);
}

function buildTruthTable(out, column){
    let div = document.getElementById("truthTable");
    let text = "<table>\n<thead>\n<tr>\n";
    for(var key in column){
        text = text + "<th>" + key + "</th>\n";
    }
    text = text + "<th>Output</th>";
    text = text + "</tr>\n</thead>\n<tbody>\n";
    for(var key in out){
      text = text + "<tr>\n";
      (key.toString()).split(",").forEach(s => {
        text = text + "<td class=\"td_" + s + "\">" + s + "</td>";
      });
      var value = out[key];
      text = text + "<td class=\"td_" + value + "\">" + value + "</td>";
      text = text + "</tr>\n";
    }
    text = text + "</tbody>\n</table>";
    div.innerHTML = text;
}
var colorMode = false;
function toggleColorMode(){
    colorMode = !colorMode;
    var colorFalse = '#E57D1B';
    var colorTrue = '#96b946';
    document.documentElement.style.setProperty("--txt-0", colorMode ? '#000000' : colorFalse);
    document.documentElement.style.setProperty("--txt-1", colorMode ? '#000000' : colorTrue);
    document.documentElement.style.setProperty("--bg-0", colorMode ? colorFalse : '#1d1d1d');
    document.documentElement.style.setProperty("--bg-1", colorMode ? colorTrue : '#1d1d1d');
}
var colorsEnabled = true;
function toggleColors(){
    var colorMode = false;
    colorsEnabled = !colorsEnabled;
    document.documentElement.style.setProperty("--txt-0", colorsEnabled ? '#E57D1B' : '#ff00ff');
    document.documentElement.style.setProperty("--txt-1", colorsEnabled ? '#96b946' : '#ff00ff');
    document.documentElement.style.setProperty("--bg-0", '#1d1d1d');
    document.documentElement.style.setProperty("--bg-1", '#1d1d1d');
    document.getElementById('buttonColorToggle').innerHTML = (colorsEnabled ? 'Disable' : 'Enable') + ' Colors'
}
