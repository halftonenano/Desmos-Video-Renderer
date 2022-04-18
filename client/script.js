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
    // console.log(rerenderIcon.style.transform.match(/\d+/g))
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

        // const newDefaultState = calculator.getState();
        // calculator.setDefaultState(newDefaultState);
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

        for (i=0; i<fetchedData.length; i++) {
            calculator.setExpression({ id: `das${i}`, latex: fetchedData[i], color: '#000' });
        }

        status.style.width = '100%';

    }

}

var changed = 0;

calculator.observeEvent('change', function() {
    console.log('Change occurred');
    // changed++;
    // status.textContent = `${changed}%`;
});

const frameInput = document.getElementById('frame-number-input');

async function fetchRequest() {
    if (!isNaN(frameInput.value) && frameInput.value.length > 0) {
        status.style.width = '5%';
        const response = await $.get(`http://localhost:3000/grabbings?frame=${parseInt(frameInput.value)}`);
        status.style.width = '20%';
        console.log(response);
        fetchedData = response;
    }

}