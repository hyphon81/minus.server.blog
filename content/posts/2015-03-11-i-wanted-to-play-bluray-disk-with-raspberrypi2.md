+++
Categories = [ "製作" ]
Tags = [ "raspberrypi", "ArchLinux" ]
date = "2015-03-11T23:24:43+09:00"

title = "raspberrypi2でブルーレイディスクを再生したかった"

+++

再生はできましたが動きがかっくかくでした。<br>
失敗でした。

<!--more-->

<h3>■試した方法</h3>
raspberrypi2で<a href=https://archlinuxjp.kusakata.com/wiki/%E3%83%A1%E3%82%A4%E3%83%B3%E3%83%9A%E3%83%BC%E3%82%B8?rdfrom=https%3A%2F%2Fwiki.archlinux.org%2Findex.php%3Ftitle%3DMain_Page_%28%25E6%2597%25A5%25E6%259C%25AC%25E8%25AA%259E%29%26redirect%3Dno>ArchLinux</a>を動かしてmplayerで再生するという方法をとりました。<br>
このやり方はArchLinuxのwikiに載っていたりします。<br>
・参考：<a>https://archlinuxjp.kusakata.com/wiki/Blu-ray?rdfrom=https%3A%2F%2Fwiki.archlinux.org%2Findex.php%3Ftitle%3DBlu-ray_%28%25E6%2597%25A5%25E6%259C%25AC%25E8%25AA%259E%29%26redirect%3Dno</a><br>
<br>
ブルーレイドライブはUSB接続のものを利用し、<br>
給電のためにコンセントからUSBの電源をとるアレの口が2つあるものを使い、<br>
口の1つはraspberrypi2の、もう1つはブルーレイドライブの電源にそれぞれ使いました。<br>
ブルーレイドライブの電源の供給には<a href=http://www.amazon.co.jp/gp/product/B00GLKR6GO?psc=1&redirect=true&ref_=oh_aui_detailpage_o09_s00>コレ</a>を使いました。<br>
<br>
<h4>OSのインストール</h4>
まずは公式のページを参考に用意したmicroSDカードにArchLinuxをインストー
ルです。<br>
手順は全て参考のページに簡潔に載っているので、そちらを見た方がいいです。<br>
・参考：<a>http://archlinuxarm.org/platforms/armv7/broadcom/raspberry-pi-2</a><br>
<br>
手持ちのLinuxのPCからmicroSDカードをfdiskでパーティション切ります。
<br>
パーティションは2つで、1つ目はW95 FAT32 (LBA)を100MB、2つ目はLinuxを
残り全部です。<br>
パーティションが切れたら、mkfs.vfatとmkfs.ext4でそれぞれフォーマットし
ます。<br>
フォーマットが終わったら、パーティションに対応するデバイスをそれぞれマ
ウントして、<br>
2つ目のパーティションをマウントしたディレクトリに対して<br>
ダウンロードしたArchLinuxのイメージをbsdtarで展開します。<br>
展開してできたbootディレクトリ以下を全て、<br>
2つ目のパーティションをマウントしたディレクトリにコピーします。<br>
これで終わりです。

<h4>ArchLinuxへ必要なパッケージとファイルをインストール</h4>
libaacs libbluray mplayerをインストールします。
{% codeblock %}
pacman -S libaacs libbluray mplayer
{% endcodeblock %}

次に~/.config/aacsを作成し、そこにKEYDB.cfgファイルをダウンロードしま
す。<br>
{% codeblock %}
mkdir ~/.config
mkdir ~/.config/aacs
cd ~/.config/aacs
wget http://www.labdv.com/aacs/KEYDB.cfg
{% endcodeblock %}
とりあえずこれでいいはずです。

<h4>ブルーレイディスクの再生</h4>
USB接続したブルーレイドライブをマウントして、ディスクを挿入し、<br>
mplayerで再生します。
{% codeblock %}
mount /dev/sr0 /media/blurays

mplayer -vo fbdev -lavdopts threads=4 br:////media/blurays
{% endcodeblock %}
これで、ブルーレイディスクがかっくかくと再生されました。<br>
一応、/boot/config.txtを弄ってオーバークロックも試しましたがダメでした。
<br>
raspberrypi2とUSBのブルーレイドライブで1万円ぐらいかかってますし、<br>
それだけあったら普通のブルーレイプレイヤーを買った方がいいと思います。

以上です。