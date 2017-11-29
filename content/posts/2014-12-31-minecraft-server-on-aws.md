+++
Categories = []
Tags = [ "AWS", "minecraft" ]
date = "2014-12-31T13:20:23+09:00"

title = "minecraft server をAWSの無料枠で動かした時のメモ"

+++

AWS EC2の12ヶ月無料枠でminecraft serverを動かしてみたので、
そのときのメモ書きです。<br>
（だいぶいいかげんです。また、AWSのインスタンス作成については全く説明しません。）

<!--more-->

AWS EC2の無料枠はCPU1コア、メモリ996MBとなっています。
対して、minecraft serverはメモリを1024MBくらい使うのでそのままでは足りません。

コレをSSD使用インスタンスでSwapファイルを作成することで解決しました。

1．まず適当な大きさのSSDストレージを持つインスタンスを作ります。<br>
とりあえず15GBで用意しました。

2．とりあえずjdkを入れます。<br>
Amazon Linuxでは、以下のうちの二つを入れればいいんじゃないでしょうか？<br>
私の場合、なんかすでには言ってました。

        $ sudo yum search jdk
        Loaded plugins: priorities, update-motd, upgrade-helper
        =============================== N/S matched: jdk ===============================
        
        ･･･
        
        java-1.8.0-openjdk.x86_64 : OpenJDK Runtime Environment
        ･･･
        java-1.8.0-openjdk-devel.x86_64 : OpenJDK Development Environment
        ･･･

3．Swapファイルを作成します。<br>
とりあえず大きめに4GBぐらい（大きすぎ？）作りました。

        # dd if=/dev/zero of=/swapfile bs=1M count=4096

作ったら権限を変更してmkswap → swapon

        # chmod 600 /swapfile
        # mkswap /swapfile
        # swapon /swapfile

/etc/fstabへ以下の行を追記

        /swapfile none swap defaults 0 0

4．mincraft serverをダウンロードして起動します。
wgetなり、ローカルに落としてscp等でアップロードするなりして、
minecraft serverの.jarファイルをAWSのインスタンス内におきます。
置いたディレクトリ内で以下のコマンドを実行します。<br>
（落としたファイル名は適宜読み替えてください）

        $ java -Xmx1024M -Xms1024M -jar minecraft_server.jar nogui

一度目は、eula.txtと言うファイルが生成されて止まります。
生成されたファイルの内容をよく確認した上で、指定の箇所を変更すれば起動します。


以上です。

＜参考にしたページ＞

http://wikiwiki.jp/kami/?%A5%B5%A1%BC%A5%D0%A4%CE%B7%FA%A4%C6%CA%FD

https://wiki.archlinux.org/index.php/Swap_%28%E6%97%A5%E6%9C%AC%E8%AA%9E%29