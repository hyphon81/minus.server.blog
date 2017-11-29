var test2 = function( s ) {
    s.setup = function() {
        s.createCanvas(480, 240);
    }

    s.draw = function() {
        s.background(0);
        background_cyber();
    }

    function background_cyber() {
        s.fill(255, 60);
        s.stroke(180, 50);

        var i, j;
        var range;
        range = 4;

        for (i = 10; i< s.width; i+=20) {
            //line(i, 0, i, height);
            s.noFill();
            s.beginShape();
            s.curveVertex(i, 0);
            s.curveVertex(i + s.random(-range,range), s.height/5);
            s.curveVertex(i + s.random(-range,range), s.height/5 * 2);
            s.curveVertex(i + s.random(-range,range), s.height/5 * 3);
            s.curveVertex(i + s.random(-range,range), s.height/5 * 4);
            s.curveVertex(i, s.height);
            s.endShape();
        }

        for (j =10; j< s.height; j+=20) {
            s.line(0, j, s.width, j);
        }
    }

}

var test2 = new p5(test2, 'test2');
