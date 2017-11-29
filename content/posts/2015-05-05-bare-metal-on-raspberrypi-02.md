+++
Categories = []
Tags = [ "raspberrypi" ]
date = "2015-05-05T18:56:25+09:00"

title = "raspberrypiでベアメタる02"

+++

とりあえず、Lチカまではできました。<br>

<!--more-->

と言っても、以下のページの説明の通りにやっただけなのですが<br>
<a>https://www.cl.cam.ac.uk/projects/raspberrypi/tutorials/os/ok01.html</a>
<br>
<a>http://www.valvers.com/open-software/raspberry-pi/step01-bare-metal-programming-in-cpt1/</a>
<br>
以下、メモ書き程度に

BCM2835(raspberrypi)の資料はBCM2836(raspberrypi2)にも適用できるらしい。<br>
<a>http://makezine.jp/blog/2015/02/eben-upton-raspberry-pi-2.html</a><br>
<br>
ただし、少なくともGPIOについては以下のような違いがある。(まあ形がちがうし)<br>
<h4>GPIOのアドレス</h4>

        raspberrypi2 -> 0x3F200000
        raspberrypi  -> 0x20200000

<h4>OK LED(ACT LED)のピン番号</h4>

       raspberrypi2,model B+ -> 15
       raspberrypi           -> 16

このあたりのことは<a>http://www.valvers.com/open-software/raspberry-pi/step01-bare-metal-programming-in-cpt1/</a>
や、<a>https://www.raspberrypi.org/forums/viewtopic.php?f=72&t=98904</a>を見たほうが良い。

