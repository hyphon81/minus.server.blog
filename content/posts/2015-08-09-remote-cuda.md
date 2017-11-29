+++
Categories = [ "製作" ]
Tags = [ "cuda" ]
date = "2015-08-09T20:38:02+09:00"

title =  "CUDA + OpenGLのサンプルプログラムをリモートで動かしたい"

+++

CUDAのサンプルプログラムにはOpenGLを利用して動画を描画するものがあります。<br>
(fluidGLとかoceanFFTとかsmokeParticleslとか)<br>
しかしながら、これをリモート環境下で動かそうと思った時に苦労したので、<br>
今回はその時のことをメモ書き程度に。

<!--more-->

今回環境を構築する対象はLinuxのSlackwareです。<br>
(なので、ソースからビルドになります。)<br>
(いちおう、slackpkgとかSlackBuildというのもありますが)<br>

最初は<a href="http://www.straightrunning.com/XmingNotes/" target="_blank">Xming</a>
を使ってなんとかしようとしていました。<br>
しかし、寄付をすることでダウンロードすることのできる最新版を使っても、<br>
"コンフィグが足りない!"と言われ、上手くいかなかったので、<br>
この方法はあきらめました。<br>
<br>
Googleで検索した結果、VirtualGL + TurboVNCという環境では、<br>
リモート環境下での描画ができる例があったので、その環境を構築しました。<br>

<h4>libjpeg-turboのインストール</h4>
VirtualGL、TurboVNCでは<a href="http://libjpeg-turbo.virtualgl.org/" target="_blank">libjpeg-turbo</a>というライブラリを使用するので、<br>
公式のページからソースをもらってきてビルドしました。<br>
(パッケージでインストールできるディストロの人は当然パッケージ使ったほうがいいです。)<br>
ビルドする時にはPICとJAVAのフラグを有効にしておくと後で苦労しなくてすみます。<br>

<h4>TurboVNC</h4>
<a href="http://www.turbovnc.org/" target="_blank">TurboVNC</a>はVirtualGLと相性のいいVNCサーバのようです。<br>
これも公式のページからソースをもらってきてビルドしました。<br>
ビルドの際は、先ほどインストールしたlibjpeg-turboのincludeディレクトリおよび<br>
libturbojpeg.aのパスを指定する必要があります。<br>
TurboVNCの基本的な使い方は次のようになってます。

        #起動しているサーバの確認
        vncserver -list
        
        #ディスプレイ番号:n番でサーバを起動
        vncserver :n
        
        #ディスプレイ番号:n番のサーバを停止
        vncserver -kill :n

<h4>VirtualGL</h4>
<a href="http://www.virtualgl.org/" target="_blank">VirtualGL</a>はインストールよりも使い方を理解するのに苦労しました。<br>
(ちゃんとドキュメントを読めばわかるんでしょうが)<br>
<br>
インストール後はまずは設定で、rootユーザとして以下を実行<br>
この時Xサーバはoffにしておきましょう。

        #rootユーザでvglconfigを実行
        vglserver_config
        
        1) Configure server for use with VirtualGL
        2) Unconfigure server for use with VirtualGL
        X) Exit
        
        Choose:

        #1を選択後、すべてnで(べつにYでもいいが、その後ひと手間かかる)
        1
        n
        n
        n

その後、Xサーバを再起動します。<br>
そしてXサーバが起動した状態でvncサーバにアクセスし、<br>
vncクライアントからvglrun -d <i><b>"vncサーバ上で起動しているXサーバのウィンドウの番号"</b></i> で実行したいプログラムを起動します。<br>
たとえば、以下のような感じです。

        vglrun -d <Xサーバのウィンドウの番号> glxgears
        
        vglrun -d <Xサーバのウィンドウの番号> ./fluidGL

これで、vncクライアント上からCUDA + OpenGLのサンプルプログラムを動かすことができました。<br>
![image1](https://pbs.twimg.com/media/CL0QFO5VEAA-WfB.jpg)

今回は以上です。