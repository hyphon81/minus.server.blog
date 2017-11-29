+++
Categories = []
Tags = [ "TRPG", "どどんとふ" ]
date = "2015-02-07T16:06:53+09:00"

title = "どどんとふのWEBIFを使ってみたい"

+++

どどんとふにはWEBIFなるものがあることを最近知りました。<br>
これを使ってなにかできないかなと考える今日このごろです。

<!--more-->

具体的には、キャラクターシートを保存しておいて使う時にどどんとふへ転送<br>
みたいなことができたらいいと思いました。<br>
<br>
とりあえず、<a href="https://en-taku.herokuapp.com/">こんなの</a>を作ってみたのですが、<br>
いまのところWEBIFは使っておらず、<br>
キャラクターシートを保存するだけで、どどんとふへは転送できません。<br>
<br>
そもそもウェブアプリなんて作ったのははじめてで、ここまで一人でやるのでさえ大変でした。<br>
(いろいろなページや本を参考にさせて頂きました。)<br>
<br>
ただ、面倒な部分はRuby on Railsで自動的に作ったので、<br>
ここから先どうしたらいいか正直わからんです。<br>
<br>
WEBブラウザからURL指定するとWEBIFが動くのは確認してるので<br>
GET叩けばいいのかなぐらいの認識です。<br>

Railsを使っているのでなんとなくRubyを使えばいいのかなということで、<br>
RubyからどどんとふのWEBIF叩く方法をメモっていきます。

ググったら色々出ましたが、Mechanizeというライブラリがよさげです。
(<a href="http://blog.scimpr.com/2014/03/06/ruby%E3%81%A7web%E3%82%92%E6%93%8D%E4%BD%9C%E3%81%A7%E3%81%8D%E3%82%8Bmechanize%E3%81%AE%E5%88%A9%E7%94%A8%E4%BE%8B%E3%82%92%E9%9B%86%E3%82%81%E3%81%A6%E3%81%BF%E3%81%9F/">参考</a>)<br>
<br>
さっそくググって出たページのコードをみながら、どどんとふ@マイナス鯖にアクセスするようにします。<br>
とりあえず、サーバの状態でも取ってみます。

        # -*- coding: utf-8 -*-
        require 'mechanize'

        agent = Mechanize.new
        page = agent.get('http://minus9x9.tk/DodontoF/DodontoFServer.rb')
        p page

↓実行結果

        #<Mechanize::File:0x000000021cd8b8 @uri=#<URI::HTTP:0x000000021a93c8 URL:http://minus9x9.tk/DodontoF/DodontoFServer.rb>, @body="[\"\xE3\x80\x8C\xE3\x81\xA9\xE3\x81\xA9\xE3\x82\x93\xE3\x81\xA8\xE3\x81\xB5\xEF\xBC\x88MySQL\xEF\xBC\x89\xE3\x80\x8D\xE3\x81\xAE\xE5\x8B\x95\xE4\xBD\x9C\xE7\x92\xB0\xE5\xA2\x83\xE3\x81\xAF\xE6\xAD\xA3\xE5\xB8\xB8\xE3\x81\xAB\xE8\xB5\xB7\xE5\x8B\x95\xE3\x81\x97\xE3\x81\xA6\xE3\x81\x84\xE3\x81\xBE\xE3\x81\x99\xE3\x80\x82\"]", @code="200", @full_path=false, @response={"server"=>"nginx", "date"=>"Sat, 07 Feb 2015 08:26:29 GMT", "content-type"=>"text/plain; charset=utf-8", "transfer-encoding"=>"chunked", "connection"=>"keep-alive"}, @filename="DodontoFServer.rb">

なんか文字化けしてキモいので、文字コードをUTF-8でbodyを表示するようにします。

        # -*- coding: utf-8 -*-
        require 'mechanize'

        agent = Mechanize.new
        page = agent.get('http://minus9x9.tk/DodontoF/DodontoFServer.rb')
        p page.body.force_encoding("utf-8")
        p page
        p page.body.encoding

↓実行結果

        #<Mechanize::File:0x0000000285e970 @uri=#<URI::HTTP:0x0000000283a660 URL:http://minus9x9.tk/DodontoF/DodontoFServer.rb>, @body="[\"「どどんとふ（MySQL）」の動作環境は正常に起動しています。\"]", @code="200", @full_path=false, @response={"server"=>"nginx", "date"=>"Sat, 07 Feb 2015 08:41:34 GMT", "content-type"=>"text/plain; charset=utf-8", "transfer-encoding"=>"chunked", "connection"=>"keep-alive"}, @filename="DodontoFServer.rb">
        #<Encoding:UTF-8>

それでは、どどんとふ@マイナス鯖のWEBIFを叩いてみます。

        # -*- coding: utf-8 -*-
        require 'mechanize'

        agent = Mechanize.new

        page2 = agent.get('http://minus9x9.tk/DodontoF/DodontoFServer.rb?webif=talk&room=0&name=hyphon81&message=hello&color=00AA00&bot=SwordWorld&callback=responseFunction')
        page2.body.force_encoding("utf-8")
        p page2
        p page2.body.encoding

実行するとbodyにresult OKという結果と共にどどんとふ上に発言しました。

        #<Mechanize::File:0x0000000300e800 @uri=#<URI::HTTP:0x00000002ff9108 URL:http://minus9x9.tk/DodontoF/DodontoFServer.rb?webif=talk&room=0&name=hyphon81&message=hello&color=00AA00&bot=SwordWorld&callback=responseFunction>, @body="responseFunction({\"result\":\"OK\"});", @code="200", @full_path=false, @response={"server"=>"nginx", "date"=>"Sat, 07 Feb 2015 08:47:15 GMT", "content-type"=>"text/plain; charset=utf-8", "transfer-encoding"=>"chunked", "connection"=>"keep-alive"}, @filename="DodontoFServer.rb_webif=talk&room=0&name=hyphon81&message=hello&color=00AA00&bot=SwordWorld&callback=responseFunction">
        #<Encoding:UTF-8>

あとは、これをなんとかすればいいのかな？<br>
以上、長文のくせに内容の薄いメモでした。
