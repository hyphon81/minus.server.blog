+++
Categories = []
Tags = [ "ArchLinux" ]
date = "2015-11-28T22:01:38+09:00"

title = "インターリンクの固定IPのサービスをArch Linuxで使った話"

+++

<a href="https://www.interlink.or.jp/service/myip/price.html" target=_blank>インターリンクの固定IPサービス</a>をArch Linuxで使ってみるのに少し難儀したのでその時のメモです。<br>
今回に限っては、いつも使っているArch Linuxのwikiをあまり有効に活用できなかったので、わすれないようにと・・・<br>
ちなみに環境はルータ越しにArch Linuxのマシンが配置されている想定です。

<!--more-->

まずは、pacmanでpppとpptpclientのパッケージをインストールします。
<br>
次に、以下のコマンドを実行します。
<br>

        pptpsetup --create "INTERLINK" --server インターリンクから通知されたVPNサーバのアドレスorドメイン名 --username ユーザ名 --password インターリンクから発行されたパスワード --encrypt

そうすると、以下のようなファイルができます。<br>
<br>
/etc/ppp/peers/INTERLINK

        # written by pptpsetup
        #debug
        pty "pptp インターリンクから通知されたVPNサーバのアドレスorドメイン名 --nolaunchpppd"
        lock
        noauth
        nobsdcomp
        nodeflate
        name ユーザ名
        remotename INTERLINK
        ipparam INTERLINK
        #require-mppe-128 //この行はコメントアウトしないとエラーがでる。

<br>
そして、/etc/ppp/chap-secretsには以下の内容が加わります。

        # added by pptpsetup for INTERLINK
        ユーザ名 INTERLINK "インターリンクから発行されたパスワード" *

設定が上手くいっていれば、あとは以下のコマンドを入力することで、<br>
ppp0が起動して固定IPでネットに繋がり、<br>
Linux起動時の自動起動が有効になるはずです。

        systemctl enable ppp@INTERLINK.service
        systemctl start ppp@INTERLINK.service

できてみれば簡単でした。<br>
<br>
ちなみに、固定IPを使って何をしているかというと、
<a href="http://www.hyphon81.net" target=_blank>こちら</a>の自宅サーバにドメイン名でアクセスできるようにしています。<br>
現状ではなにもありませんが。<br>
<br>
今回は以上です。
