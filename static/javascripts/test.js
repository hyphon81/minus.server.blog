var test1 = function( s ) {
    s.setup = function() {
        s.createCanvas(720, 400);
        s.noStroke();
    }

    s.draw = function() {
        if(s.frameCount % 200 === 0){
            drawCircle(s.width/2, 280, s.random(1,8));
        }
    }

    function drawCircle(x, radius, level) {                    
        var tt = 126 * level/4.0;
        s.fill(tt);
        s.ellipse(x, s.height/2, radius*2, radius*2);      
        if(level > 1) {
            level = level - 1;
            drawCircle(x - radius/2, radius/2, level);
            drawCircle(x + radius/2, radius/2, level);
        }
    }
}

var test1 = new p5(test1, 'test1');
