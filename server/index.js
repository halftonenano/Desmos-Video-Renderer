const { PORT, CORS } = require('../config.json');

const potrace = require('potrace');

const express = require('express');
const cors = require('cors')
const app = express();

app.use(cors({
    origin: CORS,
    optionsSuccessStatus: 200
}))

async function getThings(response, frameNumber) {
    var trace = new potrace.Potrace({ turdSize: 50 });
    
    // console.log('-=-=-=-=-=-=-=-=-\n-=-=-=-=-=-=-=-=-\n-=-=-=-=-=-=-=-=-')
    trace.loadImage(`server/frames/out${frameNumber}.png`, (err) => {
        if (err) throw err;
    
        var lastPosx = '0';
        var lastPosy = '0';
    
        var splited = trace.getPathTag().split(' C ');
    
        let cx0 = 1;
        let cx1 = 1;
        let cx2 = 0;
        let cx3 = 0;
    
        let cy0 = 0;
        let cy1 = 1;
        let cy2 = 1;
        let cy3 = 0;
    
        var latexList = [];

        for (i=1; i<splited.length; i++) {
            let cPoints = splited[i].split(', ');
    
            cx0 = lastPosx;
            cy0 = lastPosy;
    
            for (k=0; k<3; k++) {

                let modified = false;

                if (k === 2) {
                    if (cPoints[k].indexOf('M') !== -1) {
                        let movePoint = cPoints[k].split(' M ');
                        cPoints[k] = movePoint[0];
                        let moveSplit = movePoint[1].split(' ');

                        lastPosx = moveSplit[0];
                        lastPosy = moveSplit[1];
                        // console.log('move <====');

                        modified = true;
                    }


                    if (cPoints[k].indexOf('L') !== -1) {
                        let linePoint = cPoints[k].split(' L ');
                        cPoints[k] = linePoint.shift();

                        // console.log('line below');
                        // console.log(linePoint);

                        for (line of linePoint) {
                            // console.log('line here >>> '+line);
                            let lSplit = line.split(' ');

                            if (Math.abs(lSplit[0] - lSplit[2]) > Math.abs(lSplit[1] - lSplit[3])) {

                                if (lSplit[0] < lSplit[2]) {
                                    latexList.push(`y-${lSplit[1]}=\\frac{${lSplit[3]}-${lSplit[1]}}{${lSplit[2]}-${lSplit[0]}}\\left(x-${lSplit[0]}\\right)\\left\\{${lSplit[0]}<x<${lSplit[2]}\\right\\}`);
                                    
                                } else {
                                    latexList.push(`y-${lSplit[1]}=\\frac{${lSplit[3]}-${lSplit[1]}}{${lSplit[2]}-${lSplit[0]}}\\left(x-${lSplit[0]}\\right)\\left\\{${lSplit[0]}>x>${lSplit[2]}\\right\\}`);

                                }
                            } else {
                                
                                if (lSplit[1] < lSplit[3]) {
                                    latexList.push(`y-${lSplit[1]}=\\frac{${lSplit[3]}-${lSplit[1]}}{${lSplit[2]}-${lSplit[0]}}\\left(x-${lSplit[0]}\\right)\\left\\{${lSplit[1]}<y<${lSplit[3]}\\right\\}`);
                                    
                                } else {
                                    latexList.push(`y-${lSplit[1]}=\\frac{${lSplit[3]}-${lSplit[1]}}{${lSplit[2]}-${lSplit[0]}}\\left(x-${lSplit[0]}\\right)\\left\\{${lSplit[1]}>y>${lSplit[3]}\\right\\}`);

                                }
                            }
                            lastPosx = lSplit[2];
                            lastPosy = lSplit[3];
                        }

                        modified = true;
                    }
                }


                let xySplit = cPoints[k].split(' ');
                if (k === 0) {
                    cx1 = xySplit[0];
                    cy1 = xySplit[1];
                } else if (k === 1) {
                    cx2 = xySplit[0];
                    cy2 = xySplit[1];
                } else if (k === 2) {
                    cx3 = xySplit[0];
                    cy3 = xySplit[1];

                    if (!modified) {
                        lastPosx = xySplit[0];
                        lastPosy = xySplit[1];
                    }
                }
            }
            latexList.push(`((1-t)((1-t)((1-t)${cx0}+t${cx1})+t((1-t)${cx1}+t${cx2}))+t((1-t)((1-t)${cx1}+t${cx2})+t((1-t)${cx2}+t${cx3})),`+
                `(1-t)((1-t)((1-t)${cy0}+t${cy1})+t((1-t)${cy1}+t${cy2}))+t((1-t)((1-t)${cy1}+t${cy2})+t((1-t)${cy2}+t${cy3})))`);
            // latexList.push(`\\left(\\left(1-t\\right)\\left(\\left(1-t\\right)\\left(\\left(1-t\\right)${cx0}+t${cx1}\\right)+t\\left(\\left(1-t\\right)${cx1}+t${cx2}\\right)\\right)+t\\left(\\left(1-t\\right)\\left(\\left(1-t\\right)${cx1}+t${cx2}\\right)+t\\left(\\left(1-t\\right)${cx2}+t${cx3}\\right)\\right),`+
            //     `\\left(1-t\\right)\\left(\\left(1-t\\right)\\left(\\left(1-t\\right)${cy0}+t${cy1}\\right)+t\\left(\\left(1-t\\right)${cy1}+t${cy2}\\right)\\right)+t\\left(\\left(1-t\\right)\\left(\\left(1-t\\right)${cy1}+t${cy2}\\right)+t\\left(\\left(1-t\\right)${cy2}+t${cy3}\\right)\\right)\\right)`);
        }

        response.send(latexList);
    });
}

async function pathToLatex(pathTag, response) {
    var lastPosx = '0';
    var lastPosy = '0';

    var splited = pathTag.split(' C ');

    let cx0 = 1;
    let cx1 = 1;
    let cx2 = 0;
    let cx3 = 0;

    let cy0 = 0;
    let cy1 = 1;
    let cy2 = 1;
    let cy3 = 0;

    var latexList = [];

    for (i=1; i<splited.length; i++) {
        let cPoints = splited[i].split(', ');

        cx0 = lastPosx;
        cy0 = lastPosy;

        for (k=0; k<3; k++) {
            let modified = false;

            if (k === 2) {
                if (cPoints[k].indexOf('M') !== -1) {
                    let movePoint = cPoints[k].split(' M ');
                    cPoints[k] = movePoint[0];
                    let moveSplit = movePoint[1].split(' ');

                    lastPosx = moveSplit[0];
                    lastPosy = moveSplit[1];
                    // console.log('move <====');

                    modified = true;
                }

                if (cPoints[k].indexOf('L') !== -1) {
                    let linePoint = cPoints[k].split(' L ');
                    cPoints[k] = linePoint.shift();

                    for (line of linePoint) {
                        let lSplit = line.split(' ');

                        if (Math.abs(lSplit[0] - lSplit[2]) > Math.abs(lSplit[1] - lSplit[3])) {

                            if (lSplit[0] < lSplit[2]) {
                                latexList.push(`y-${lSplit[1]}=\\frac{${lSplit[3]}-${lSplit[1]}}{${lSplit[2]}-${lSplit[0]}}\\left(x-${lSplit[0]}\\right)\\left\\{${lSplit[0]}<x<${lSplit[2]}\\right\\}`);
                            } else {
                                latexList.push(`y-${lSplit[1]}=\\frac{${lSplit[3]}-${lSplit[1]}}{${lSplit[2]}-${lSplit[0]}}\\left(x-${lSplit[0]}\\right)\\left\\{${lSplit[0]}>x>${lSplit[2]}\\right\\}`);
                            }
                        } else {
                            
                            if (lSplit[1] < lSplit[3]) {
                                latexList.push(`y-${lSplit[1]}=\\frac{${lSplit[3]}-${lSplit[1]}}{${lSplit[2]}-${lSplit[0]}}\\left(x-${lSplit[0]}\\right)\\left\\{${lSplit[1]}<y<${lSplit[3]}\\right\\}`);
                            } else {
                                latexList.push(`y-${lSplit[1]}=\\frac{${lSplit[3]}-${lSplit[1]}}{${lSplit[2]}-${lSplit[0]}}\\left(x-${lSplit[0]}\\right)\\left\\{${lSplit[1]}>y>${lSplit[3]}\\right\\}`);
                            }
                        }
                        lastPosx = lSplit[2];
                        lastPosy = lSplit[3];
                    }

                    modified = true;
                }
            }

            let xySplit = cPoints[k].split(' ');
            if (k === 0) {
                cx1 = xySplit[0];
                cy1 = xySplit[1];
            } else if (k === 1) {
                cx2 = xySplit[0];
                cy2 = xySplit[1];
            } else if (k === 2) {
                cx3 = xySplit[0];
                cy3 = xySplit[1];

                if (!modified) {
                    lastPosx = xySplit[0];
                    lastPosy = xySplit[1];
                }
            }
        }
        latexList.push(`((1-t)((1-t)((1-t)${cx0}+t${cx1})+t((1-t)${cx1}+t${cx2}))+t((1-t)((1-t)${cx1}+t${cx2})+t((1-t)${cx2}+t${cx3})),`+
            `(1-t)((1-t)((1-t)${cy0}+t${cy1})+t((1-t)${cy1}+t${cy2}))+t((1-t)((1-t)${cy1}+t${cy2})+t((1-t)${cy2}+t${cy3})))`);
    }
    response.send(latexList);
}


app.use(express.static('client'));

app.get('/grabbings', async (req, res) => {
    console.log(req.query)
    
    const { frame } = req.query;

    if (!!frame) {
        let frameNumber = parseInt(frame);
        
        if (0 < frameNumber < 232) {
            getThings(res, frameNumber);
        }
    }
});


app.use(express.json({limit: '2mb'}));

app.post('/send', async (req, res) => {
    const { imgHeight, imgWidth, data } = req.body;

    if (!data) return res.status(400).send('Please include a request body in json');
    if (!imgHeight || !imgWidth) return res.status(400).send('Please include image height and width in the request');

    var imageBuffer = new Buffer.from(data, 'base64');

    potrace.trace(imageBuffer, (err, svg) => {
        if (err) throw err;

        res.send(svg);

        // pathToLatex(svg, res);
    });

    // trace.loadImage(imageBuffer, (err) => {
    //     if (err) throw err;

    //     pathToLatex(trace.getPathTag(), res);
    // });
});

app.listen(PORT, () => {
    console.log(`running on ${PORT}`);
});