+++
Categories = []
Tags = [ "raspberrypi" ]
date = "2015-05-18T18:57:14+09:00"

title = "raspberrypiでベアメタる03"

+++

raspberrypiベアメタル、<br>
とりあえず、<br>
1.HDMI出力によるモニタへの表示<br>
2.UARTの使用<br>
3.TimerによるIRQ interrupt<br>
が、できました。<br>
動いたソースを<a href="https://github.com/hyphon81/sample">githubにアップしてみました</a>。<br>

<!--more-->

アップしたコードでは、sample01以下でmakeを実行すると、<br>
(クロスコンパイラがインストールされていれば)kernel.imgというファイルができるので、<br>
これを、linuxをインストールしたraspberrypiのSDカードの<br>
/bootディレクトリ下のkernel.imgと入れ変えてください。<br>
(元のkernel.imgはバックアップを取っておくなりしたほうがいいです。)<br>
このSDカードを使ってraspberrypiの電源を入れると、青、緑、赤の3ラインがモニタに表示され、<br>
LEDのACTランプがTimer割込みに従って点滅します。<br>
それだけです。<br>
<br>
いちおう、モニタ表示部分だけでも説明をしてみます。<br>
参考にしたのは、
<a>http://www.cl.cam.ac.uk/projects/raspberrypi/tutorials/os/screen01.html</a>と、
<a>https://github.com/dwelch67/raspberrypi</a>のvideo01です。


        int main(void)
        {
          FrameBufferDescription *fbInfoAddr;
          uint8 *fbAddr;
          int x,y;
          uint16 colour;

          clear_bss();
          disable_all_IRQ();
          set_vector_table();
          init_uart(115200);
          set_uart_timeout(-1, -1);
          fbInfoAddr = init_frame_buffer(1024,768,16); // <== ここでフレームバッファの初期化をします
                                                       // 要するに描画する領域のサイズを決め、
                                                       // ビットマップへのポインタを返す関数です。


          ・・・
          
          
          FrameBufferDescription* init_frame_buffer(uint32 width,
                                                    uint32 height,
                                                    uint32 bitDepth)
          {
            static FrameBufferDescription *fb = (FrameBufferDescription*)FLAME_BUFFER;
  uint32 r;
  
            if(width > 4096 || height > 4096 || bitDepth > 32){
              return 0;
            }

            *fb=FrameBufferInfo;
            
            fb->width = width;
            fb->height = height;
            fb->vWidth = width;
            fb->vHeight = height;
            fb->bitDepth = bitDepth; // ここまでで、フレームバッファの初期値を入れて、
            
            mailbox_write((uint32)fb, 1); // 初期値のかかれた領域のアドレスをメールボックスに送ると、

            r = mailbox_read(1); // メールが返ってきた時に伝えた領域がそのままモニタのビットマップを示すようになります。
            if(r == E_INVALID_VAL){
              puts("Error!! mailbox_read() E_INVALID_VAL!\r\n");
              return NULL;
            }
            if(r == E_COUNTUP_MAX){
              puts("Error!! mailbox_read() E_COUNTUP_MAX!\r\n");
              return NULL;
            }
            
            return fb;
          }


          ・・・
          
          
          typedef struct {
            uint32 width;
            uint32 height;
            uint32 vWidth;
            uint32 vHeight;
            uint32 pitch;
            uint32 bitDepth;
            uint32 x;
            uint32 y;
            void* pointer;  // <= ここにビットマップへのポインタがあります。
            uint32 size;
          } FrameBufferDescription;

raspberrypiはフレームバッファとメールボックスという仕組みでモニタへの描画が出来るようです。<br>
専用の構造体を用意して、そのアドレスをCPUのメールボックスに相当するレジスタに伝えると、<br>
メールボックスに伝えたアドレスの構造体から描画を制御できるようになるみたいです。


        fbInfoAddr = init_frame_buffer(1024,768,16); // <= カラー深度16bitで初期化しているので1pixelは2byte
        /* Error route */
        if(fbInfoAddr == NULL){ // フレームバッファの初期化に成功していれば、fbInfoAddrには構造体へのアドレスが入っている。
          while(1){
            uart_puts("Error!\r\n");
            delay_ms(1000);
            set_gpio(OK_LED_PIN, INPUT_PULLDOWN);
            delay_ms(1000);
            set_gpio(OK_LED_PIN, INPUT_PULLUP);
          }    
        }
        while(1){
          fbAddr=fbInfoAddr->pointer; // <= (x=0,y=0)のポインタを渡す。
          colour = 0x0000;                  // 黒から段々色を濃くする
          for(y=0;y<div_uint32(768,3);y++){ // <= 青描画部分 上の1/3の描画をおこなう
            for(x=0;x<1024;x++){
              *fbAddr = colour &  0xff;     // little endianなので下位bitが先にくる
              fbAddr++;
              *fbAddr = (colour >> 8) & 0xff;// little endianなので上位bitが後にくる
              fbAddr++;
            }
            if(colour < 0b0000000000011111){ // 16bitでは下位5bitが青を示す。
              colour += (1 << 0);            // 青の漉さが最大になるまでグラデーションをかける。
            }
            uart_puts("blue colour = 0x"); putxval(colour,0); uart_puts("\r\n");
          }
          colour = 0x0000;
          for(y=0;y<div_uint32(768,3);y++){ // <= 緑描画部分 真ん中の1/3の描画をおこなう
            for(x=0;x<1024;x++){
              *fbAddr = colour &  0xff;
              fbAddr++;
              *fbAddr = (colour >> 8) & 0xff;
              fbAddr++;
            }
            if(colour < 0b0000011111100000){ // 16bitでは青の次6bitが緑を示す。
              colour += (1 << 5);
            }
            uart_puts("green colour = 0x"); putxval(colour,0); uart_puts("\r\n");
          }
          colour = 0x0000;
          for(y=0;y<div_uint32(768,3);y++){ // <= 赤描画部分 下の1/3の描画をおこなう
            for(x=0;x<1024;x++){
              *fbAddr = colour &  0xff;
              fbAddr++;
              *fbAddr = (colour >> 8) & 0xff;
              fbAddr++;
            }
            if(colour < 0b1111100000000000){ // 16bitでは上位5bitが赤を示す。
              colour += (1 << 11);
            }
            uart_puts("red colour = 0x"); putxval(colour,0); uart_puts("\r\n");
          }

このへんの処理でpixelに対応するポインタのさすアドレスの値へ色情報を渡して描画しています。<br>
やっていることは大したことではないですが、説明が難しい・・・。<br>
これでわかる人いるのかな・・・？