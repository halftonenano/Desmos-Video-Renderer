const elt = document.getElementById('calculator');
const container = document.getElementById('calculator-container');
const calculator = Desmos.GraphingCalculator(elt);
calculator.setExpression({ id: 'graph1', latex: 'y=x^2' });

var calcSizeX = 0;
var calcSizeY = 0;

resizeCalculator();
window.onresize = resizeCalculator;
function resizeCalculator() {
    elt.style.width = `${container.clientWidth-50}px`;
    calcSizeX = container.clientWidth-50-parseInt(document.querySelector('.dcg-exppanel-outer').style.width);
    elt.style.height = `${container.clientHeight-50}px`;
    calcSizeY = container.clientHeight-50;
}

const status = document.getElementById('progressbar-inner');
const rerenderIcon = document.getElementById('rerender-icon');

var currentFrame = 0;
var frames = [1,2,3,4,5];

var fetchedData = [];

rerenderIcon.style.transform = 'rotate(0deg)';
rendering();

async function rendering() {
    rerenderIcon.style.transform = `rotate(-${parseInt(rerenderIcon.style.transform.match(/\d+/g)[0])+540}deg)`;
    
    if (currentFrame < frames.length-1) {
        currentFrame++;
    } else {
        currentFrame = 0;
    }

    calculator.setExpression({ id: 'graph1', latex: `y=x^${frames[currentFrame]}` });

    if (fetchedData.length > 0) {

        console.log(calculator.getState());
        
        // let currentGraphs = await calculator.getExpressions();

        // for (expression of currentGraphs) {
        //     calculator.removeExpression({ id: expression.id });
        // }

        calculator.setBlank();

        console.log(parseInt(document.querySelector('.dcg-exppanel-outer').style.width));

        calculator.setMathBounds({
            left: 0,
            // right: 1920/(calcSizeX/calcSizeY),
            right: (calcSizeX*(1080/calcSizeY)),
            bottom: 0,
            top: 1080
        });
        
        if (frameInput.value === 'db') {
            return;

        }

        console.log(fetchedData.length);

        for (i=0; i<fetchedData.length; i++) {
            calculator.setExpression({ id: `das${i}`, latex: fetchedData[i], color: '#000' });
        }

        status.style.width = '100%';

    }

}

// var changed = 0;

calculator.observeEvent('change', function() {
    console.log('Change occurred');
    // changed++;
    // status.textContent = `${changed}%`;
});

const frameInput = document.getElementById('frame-number-input');
var imgConverted = {};

async function fetchRequest() {
    if (imgConverted.data) {
        status.style.width = '5%';
        const response = await $.ajax({
                url: '/send',
                method: 'POST',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    imgHeight: '1080',
                    imgWidth: '1920',
                    data: imgConverted.data
                })
            });
        console.log(response);
        fetchedData = response;
        status.style.width = '20%';
    }

    if (!isNaN(frameInput.value) && frameInput.value.length > 0) {
        status.style.width = '5%';
        const response = await $.get(`/grabbings?frame=${parseInt(frameInput.value)}`);
        console.log(response);
        fetchedData = response;
        status.style.width = '20%';
    }
}


uploadFiles();
function uploadFiles() {
    'use strict'
    var URL = window.URL || window.webkitURL;
    // var displayMessage = function (message, isError) {
    // var element = document.querySelector('#message');;
    // element.innerHTML = message;
    // element.className = isError ? 'error' : 'info';
    // }
    var playSelectedFile = function (event) {
        var file = this.files[0];

        var type = file.type;
        console.log(type);

        // var fileURL = URL.createObjectURL(file);

        var reader = new FileReader();
        
        reader.onload = function () {
            let base64String = reader.result.replace("data:", "")
            .replace(/^.+,/, "");
            
            console.log(base64String);

            imgConverted.data = base64String;

            // console.log(reader.result);
        }
        reader.readAsDataURL(file);
    }
    var inputNode = document.getElementById('image-input');
    inputNode.addEventListener('change', playSelectedFile, false);
}

const screenshotTarget = document.body;
async function saveScreenshot() {
    html2canvas(screenshotTarget).then((canvas) => {
        const base64image = canvas.toDataURL("image/png");

        var link = document.createElement("a");

        // document.body.appendChild(link); // for Firefox

        link.setAttribute("href", base64image);
        link.setAttribute("download", `rickroll/out${frameInput.value}`);
        link.click();
    });
}