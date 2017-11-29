+++
Categories = [ "製作" ]
Tags = [ "ArchLinux" ]
date = "2015-04-22T18:28:42+09:00"

title = "Arch linux をRAID1組んだ構成でUEFIブートでインストールしました"

+++

自宅で使っているサーバのハードディスクが壊れました。<br>
システムを作りなおしになり、このさいなのでRAIDを組んで対障害性を上げよ
うと思いました。<br>
ふつうに以下のページの通りにやればできました。<br>
<a>https://bbs.archlinux.org/viewtopic.php?pid=1390741#p1390741</a><br>
ここを読めば、ここから下の話は読む必要ありません。

<!--more-->

<h4>1. ハードディスクを2つ用意し、そのうち1つをcgdiskでパーティション
切ります。</h4>
Arch LinuxのISOを焼いたDVDなりUSBメモリなりでブートすることを想定して
います。<br>
起動したらとりあえずloadkeys jp106とやっておくといいと思います。<br>
cgdiskでさくっとパーティションを切ります。<br>

        Part. #     Size        Partition Type            Partition Name
        ----------------------------------------------------------------
                    1007.0 KiB  free space
           1        512.0 MiB   BIOS boot partition       EFI boot
           2        500.0 GiB   Linux RAID                Linux RAID

ひとつ目のパーティションは EFI boot用の領域として512MBを0xef02で、<br>
ふたつ目のパーティションは RAID用に0xfd00で取っておきます。<br>
<br>
<h4>2. もうひとつのディスクにパーティション構成をコピーします。</h4>
次のコマンドを実行します。

        sgdisk --backup=table /dev/sda(1.でパーティション切ったディスク)
        sgdisk --load-backup=table /dev/sdb(なにもしてないほうのディスク)

<h4>3. mdadmを使用してRAIDを構成します。</h4>
次のコマンドを実行します。

        mdadm --create /dev/md0 --metadata 1.0 --raid-devices=2 --level=1 /dev/sd[ab]1
        mdadm --create /dev/md1 --raid-devices=2 --level=1 /dev/sd[ab]2

この時なにか聞かれましたが、とりあえずイエスで大丈夫です。

<h4>4. RAIDを組んだデバイスのファイルシステムを構築します。</h4>
次のコマンドを実行します。

        mkfs.fat -F32 /dev/md0
        mkfs.ext4 /dev/md1

<h4>5. デバイスをマウントしてArch Linuxをインストールします。</h4>
次のコマンドを実行します。

        mount /dev/md1 /mnt
        mkdir /mnt/boot
        mount /dev/md0 /mnt/boot

        pacstrap -i /mnt base base-devel

base-develはつけなくてもいけるそうです。

<h4>6. /etc/mdadm.confと/etc/fstabに必要な情報を記入します。</h4>
次のコマンドを実行します。

        mdadm --detail --scan >> /mnt/etc/mdadm.conf
        genfstab -U -p /mnt >> /mnt/etc/fstab

コマンド打てば自動でやってくれるので楽です。

<h4 id="arch_linux_install_chroot">7. インストールしたArch Linuxにchrootで入って設定します。</h4>
次のコマンドを実行します。

        arch-chroot /mnt /bin/bash

これで、インストールしたArch Linuxのシステムに入れます。<br>
入ったらまず /etc/locale.genを編集してロケールの設定をします。<br>
<a>https://archlinuxjp.kusakata.com/wiki/%E3%83%93%E3%82%AE%E3%83%8A%E3%83%BC%E3%82%BA%E3%82%AC%E3%82%A4%E3%83%89#.E3.83.AD.E3.82.B1.E3.83.BC.E3.83.AB</a><br>
上記のリンク先に従って、en_US.UTF-8 UTF-8とja_JP.UTF-8 UTF-8のコメントアウトを外しま
す。<br>
/etc/locale.genを編集したら以下のコマンドを実行します。

        locale-gen

つづいて以下のコマンドを実行します。

        echo LANG=en_US.UTF-8 > /etc/locale.conf

/etc/vconsole.confにKEYMAP=jp106を記入します。<br>
(このファイルは最初ないので作成することになります)<br>
つづいてタイムゾーンを設定します。

        ln -s /usr/share/zoneinfo/Asia/Tokyo /etc/localtime

この後、rootパスワードやホスト名やネットワークまわりの設定をします。<br>
このあたりの設定方法は<a
href=https://archlinuxjp.kusakata.com/wiki/%E3%83%93%E3%82%AE%E3%83%8A%E3%83%BC%E3%82%BA%E3%82%AC%E3%82%A4%E3%83%89#.E3.83.9B.E3.82.B9.E3.83.88.E5.90.8D>
公式のwiki</a>に全部載っています。

<h4>8. ブートローダとしてgummibootをインストールします。</h4>
次のコマンドを実行します。

        pacman -S gummiboot

自分がやった時には、最初から入っているふうでした。<br>
ひょっとしたら、base-develに入っているのかもしれません。<br>
インストールしたら以下のコマンドを実行します。

        gummiboot install

上記のコマンドがうまくいかない場合(私もそうでした)以下を実行します。

        mkdir -p /boot/EFI/gummiboot
        cp /usr/lib/gummiboot/gummibootx64.efi /boot/EFI/gummiboot/
        efibootmgr -c -d /dev/sda -p 1 -L Arch\ Linux\ 1 -l \\EFI\\gummiboot\\gummibootx64.efi
        efibootmgr -c -d /dev/sdb -p 1 -L Arch\ Linux\ 2 -l \\EFI\\gummiboot\\gummibootx64.efi

つづいて以下を実行します。

        mkdir -p /boot/loader/entries

/boot/loader/entries/arch1.confを作成し、以下のように内容を編集します。

         title         Arch Linux
         linux         /vmlinuz-linux
         initrd        /initramfs-linux.img
         options       root=/dev/md1 rw

仕上げに/etc/mkinitcpio.confのHOOKの行を次のように編集します。

        HOOKS="base udev autodetect modconf block filesystems mdadm_udev keyboard fsck"

編集したら、次のコマンドを実行します。

        mkinitcpio -p linux

あとは、chrootから出てrebootすれば、上手くいってれば出来あがりです。