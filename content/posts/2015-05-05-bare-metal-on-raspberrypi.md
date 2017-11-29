+++
Categories = []
Tags = [ "raspberrypi" ]
date = "2015-05-05T08:51:49+09:00"

title = "raspberrypiでベアメタる"

+++

raspberrypiでベアメタルをやってみたくなりました。

<!--more-->

そもそもベアメタルとはなにかというと、もともとはむき出しの金属という意味らしいです。<br>
raspberrypiでベアメタルをやると言うと、LinuxなどのOSをかませずに、<br>
もっと低層のレイヤーで色々いじるということになります。<br>
<a href="/blog/2015/03/11/i-wanted-to-play-bluray-disc-with-raspberrypi2/">raspberrypiでのブルーレイ再生で失敗</a>して以来もてあましているので、これで遊びたい訳です。<br>
<a href="http://www.valvers.com/open-software/raspberry-pi/step01-bare-metal-programming-in-cpt1/">こちらの記事</a>を参考にしようと思ったのですが、<br>
<a href="https://launchpad.net/gcc-arm-embedded/4.7/4.7-2014-q2-update">紹介されているtoolchain</a>が
自分の環境だとうまく動かなかったり、ビルドも失敗したりしたので、<br>
まずはクロスコンパイラのビルドからやっていくことになりました。<br>
そのときの作業メモです。<br>
<br>
<a href="http://hp.vector.co.jp/authors/VA000177/html/arm-gcc.html">ここ</a>が参考になりました。
<h4>1. binutilsのビルド</h4>
これを書いている時点で、<a>http://core.ring.gr.jp/pub/GNU/</a>上の最新版はbinutils-2.25なので<br>
これを使用しました。<br>
ダウンロードしたtar.gzを解凍してarm用にビルドします。

        tar xvf binutils-2.25.tar.gz
        mv binutils-2.25 binutils-2.25_arm
        cd binutils-2.25_arm
        ./configure --target=arm-none-eabi
        make
        sudo make install

<h4>2. gccのビルド</h4>
これを書いている時点で、<a>http://core.ring.gr.jp/pub/GNU/</a>上の最新版はgcc-5.1.0なので<br>
これを使用しました。<br>
ダウンロードしたtar.bz2を解凍してarm用にビルドします。

        tar xvf gcc-5.1.0.tar.bz2
        mv gcc-5.1.0 gcc-5.1.0_arm
        cd gcc-5.1.0_arm
        ./configure --target=arm-none-eabi --disable-nls --disable-shared --with-gcc --with-gnu-ld --with-gnu-as --enable-languages=c --enable-interwork --enable-multilib --disable-libssp --disable-libstdcxx-pch  --with-dwarf2 --program-prefix=arm-none-eabi- --without-gmp-lib --without-mpfr-lib --without-mpc-lib
        make
        sudo make install

Archだとこれでいけましたが、別の環境ではzlibのところで以下のエラー出して失敗しました。

        error: Link tests are not allowed after GCC_NO_EXECUTABLES.

しかたがないのでconfigureに--disable-zlibを追加してビルドしました。<br>

以下のようなエラーで止まる場合は、

        libgcc.mvars: No such file or directory

findでlibgcc.mvarsがあったディレクトリをコピーしてきた。<br>
こんなふうにして対応。大丈夫かな・・・？

        find ./ -name *libgcc.mvars
        cp -r host-x86_64-unknown-linux-gnu/gcc/ ./

ビルドには2時間ぐらいかかりました。

<h4>3. newlibのビルド</h4>
<a>ftp://sources.redhat.com/pub/</a>のnewlib-2.2.0を使用。

        tar xvf newlib-2.2.0.tar.gz
        mv newlib-2.2.0 newlib-2.2.0_arm
        cd binutils-2.2.0_arm
        ./configure --target=arm-none-eabi
        make
        sudo make install

arm-non-eabi-gccと打って以下のように表示されればとりあえず成功です。

        $ arm-none-eabi-gcc
        arm-none-eabi-gcc: fatal error: no input files
        compilation terminated.

