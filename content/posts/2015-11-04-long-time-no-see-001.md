+++
Categories = []
Tags = []
date = "2015-11-04T23:12:48+09:00"

title = "放置期間が長びいた・・・"

+++

最近はMOOCをずっとやってて、ここを放置していたので、<br>
そろそろなんか書かなきゃなというしだいです。<br>
スタンフォード大学のMachine Learningは無事修了できました。

<!--more-->

Octopressでp5.jsというのを使ってみたくて、ちょっと苦労したので<br>
メモ書きをば。
<script src="/javascripts/p5-release/p5.js"></script>
<script src="/javascripts/test.js"></script>
<div id="test1">
この図はp5.jsのjavascriptで生成しています。
</div>
まぁ、<a
href="http://p5js.org/examples/examples/Structure_Recursion.php">これ
</a>なんですが。<br>

<br>
とりあえず、<a
href="http://p5aholic.hatenablog.com/entry/2015/05/16/163251">ここ</a>
を参考に、させていただきました。
<br>
<br>
まずは、Octopressのsource/javascripts以下にp5.jsを配置します。
<br>
あと、記事に貼りつけたいコードもここに配置します。<br>
ちなみにここに貼ってるコードは、以下のようになってます。<br>
test.js

        function setup() {
          var canvas =  createCanvas(720, 400);
          canvas.parent("p5Canvas")
          noStroke();
          noLoop();
        }
        
        function draw() {
          drawCircle(width/2, 280, 6);
        }

        function drawCircle(x, radius, level) {                    
          var tt = 126 * level/4.0;
          fill(tt);
          ellipse(x, height/2, radius*2, radius*2);      
          if(level > 1) {
            level = level - 1;
            drawCircle(x - radius/2, radius/2, level);
            drawCircle(x + radius/2, radius/2, level);
          }
        }

setup()関数がポイントのようです。
<br>
つぎに、source/_includes/custom/head.htmlを編集します。<br>
以下の行を追加します。

        <script src="/javascripts/p5-release/p5.js"></script>
        <script src="/javascripts/test.js"></script>

<br>
さいごに、記事のmarkdownファイルに以下の行を追加することで、<br>
その位置に図が置かれます。<br>

        <div id="p5Canvas">
        </div>

<br>
この手法は色々応用できそうです。<br>
今回は以上です。<br>
<br>
としたかったのですが、上記の方法では同じページに複数のcanvasを配置
できないことがわかりました。<br>
<br>
そこで、<a href="http://codein.namanyayg.com/blog/p5/">ここ</a>を参考に
コードを変えてみました。

改変test.js

        var test1 = function( s ) {
          s.setup = function() {
            s.createCanvas(720, 400);
            s.noStroke();
          }

          s.draw = function() {
            if(s.frameCount % 200 === 0){
              drawCircle(s.width/2, 280, random(1,8));
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
        

このように書くことで、複数のp5.jsのスクリプトを、<br>
同じページに貼り付けられるらしいです。<br>
試しに別のスクリプトを貼ってみます。
ちなみにスクリプトは記事のmarkdownの中に埋め込んでも<br>
大丈夫なようです。<br>
こんな感じに

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

<br>

        <script src="/javascripts/test2.js"></script>
        <div id="test2">
        </div>

<script src="/javascripts/test2.js"></script>
<div id="test2">
</div>
上手くいったようです。(何じゃこりゃ)