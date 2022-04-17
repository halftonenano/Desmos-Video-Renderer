const elt = document.getElementById('calculator');
const calculator = Desmos.GraphingCalculator(elt);
calculator.setExpression({ id: 'graph1', latex: 'y=x^2' });

var currentFrame = 0;
var frames = [1,2,3,4,5];

var fetchedData = [];

rendering();

function rendering() {
    
    if (currentFrame < frames.length-1) {
        currentFrame++;
    } else {
        currentFrame = 0;
    }

    calculator.setExpression({ id: 'graph1', latex: `y=x^${frames[currentFrame]}` });

    if (fetchedData.length > 0) {

        console.log(calculator.getState());

        for (i=0; i<fetchedData.length; i++) {
            calculator.setExpression({ id: `das${i}`, latex: fetchedData[i], color: '#000' });
        }

    }

}

async function fetchRequest() {
    const response = await $.get(`http://localhost:3000/grabbings?frame=18`);

    fetchedData = response;
}