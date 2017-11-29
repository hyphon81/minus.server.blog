+++
Categories = [ "製作"]
Tags = [ "ArchLinux" ]
date = "2016-01-03T16:51:18+09:00"

title = "ZFSにArch Linuxをインストールする"

+++

ZFSというファイルシステムにArch Linuxをインストールした時のメモ書きです。<br>
例によってほとんどArch Linux の wikiのリンク集です・・・

<!--more-->

まずは、ZFSのパッケージを含むISOを用意します。<br>
やり方は<a href="https://wiki.archlinuxjp.org/index.php/ZFS#archzfs_.E3.83.91.E3.83.83.E3.82.B1.E3.83.BC.E3.82.B8.E3.82.92_archiso_.E3.81.AB.E5.9F.8B.E3.82.81.E8.BE.BC.E3.82.80" target=_blank>ここ</a>を見た方が良いでしょう。<br>
<br>
ZFSのパッケージを含むISOのインストールメディアを入手したら、<br>
基本的にwikiの<a href="https://wiki.archlinuxjp.org/index.php/ZFS_%E3%81%AB_Arch_Linux_%E3%82%92%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB" target=_blank>ZFS に Arch Linux をインストール</a>に従ってインストールを進めれば大丈夫ですが、<br>
自分の場合はいくつか躓いた部分があったので書いておきます。<br>
それと、Arch Linuxインストール時はloadkeys jp106は忘れずに打っておきましょう。<br>
(私は毎回忘れます・・・)<br>

<h3>1. ファイルシステムの用意</h3>
まず、ディスクのパーティションですが、<br>
自分の場合は以下のようにしました。<br>

        # gdisk -l /dev/sda
        GPT fdisk (gdisk) version 1.0.1
        
        ・・・
        
        Number  Start (sector)    End (sector)  Size       Code  Name
           1            2048         1050623   512.0 MiB   EF00  BIOS Boot Partition
           2         1050624      1953525134   931.0 GiB   BF00  ZFS

パーティションを分けたら、ブートパーティションを忘れずにフォーマットしましょう。<br>
フォーマットは以下のコマンドでできます。<br>

        # mkfs.vfat -F32 /dev/sda

<br>
それでは、ZFSファイルシステムをセットアップしていきましょう。<br>
まずはwikiに従ってZFSモジュールがロードされていることを確認します。<br>
以下のコマンドを打って何も出なければ大丈夫です。<br>

        # modprobe zfs

ここで何かしらのエラーが出るようならISOの作成に失敗しているんじゃないかと思います。<br>
私は今のところこの段階で失敗したことないですが。<br>
<br>
ZFSモジュールがロードされていることが確認できたら、<br>
さっそくzpoolを作りましょう。

        zpool create zroot /dev/disk/by-id/"Code BF00に設定したパーティション"

"Code BF00に設定したパーティション"は、<br>
これまでの通りにやってるならたぶん"ハードディスクの名前"-part2になるはずです。<br>
zrootは作成するzpoolの名前なので好きに変えられます。<br>
まぁ、wikiに従って変えずにいきますが。<br>
zpoolを作成をしたら、必要なファイルシステムを作ります。

        # zfs create zroot/home -o mountpoint=/home
        # zfs create zroot/root -o mountpoint=/root

"マウント先が空じゃない"みたいな警告がでますが今は気にしなくて大丈夫です。<br>
<br>
あと、/varとか/etcと言ったシステムディレクトリを個別のZFSファイルシステムで用意する場合、<br>
マウント先を"legacy"に設定して/etc/fstabにマウントの設定を行なう必要があります。<br>
(ZFSでは起動時に自動でファイルシステムがマウントされるので、<br>
システムディレクトリでなければマウント先を設定してやるだけで大丈夫です。)<br>
ファイルシステムを個別に用意する理由ですが、これをやると、<br>
スナップショットが個別に取れるというメリットがあるんだと思います、たぶん・・・<br>
なお、wikiでは/varと/usrを個別に用意するやり方が載っていますが、<br>
自分の場合は、/usrを個別に用意すると上手くいかなかったので、<br>
(最終的にブート時に/sbin/initがないとか言って起動できませんでした。)<br>
今回は/varのみを個別に用意していきます。

        # zfs create zroot/var -o mountpoint=legacy

スワップパーティションについては、<br>
インストールが終った後に<a href="https://wiki.archlinuxjp.org/index.php/ZFS#.E3.82.B9.E3.83.AF.E3.83.83.E3.83.97.E3.83.9C.E3.83.AA.E3.83.A5.E3.83.BC.E3.83.A0" target=_blank>ここ</a>を見て設定するのが良いと思います。<br>
<br>
ファイルシステムの作成ができたら、<br>
それらの設定をしていきます。<br>

        # zfs set mountpoint=/ zroot
        #
        # zfs set mountpoint=/home zroot/home
        # zfs set mountpoint=/root zroot/root
        #
        # zfs set mountpoint=legacy zroot/var

ここでも、"マウント先が空じゃない"みたいな警告がでますがスルーで。<br>
/varのファイルシステムを個別に用意したばあいは以下もやっておくことが推奨されています。

        # zfs set xattr=sa zroot/var
        # zfs set acltype=posixacl zroot/var

次にブート時に自動でzrootが読み込まれるよう設定します。

        # zpool set bootfs=zroot zroot

以上が設定できたらzpoolを一旦exportします。

        # zpool export zroot


<h3>2. Arch Linuxのインストール</h3>
これまでに作成したZFSファイルシステムを/mnt以下にマウントします。<br>

        # zpool import -d /dev/disk/by-id -R /mnt zroot

また、ブートパーティションとzroot/varは個別にマウントする必要があります。<br>

        # mkdir /mnt/var
        # mount -t zfs zroot/var /mnt/var
        #
        # mkdir /mnt/boot
        # mount /dev/sda1 /mnt/boot

マウントしたら、以下を実行

        # zpool set cachefile=/etc/zfs/zpool.cache zroot
        # cp /etc/zfs/zpool.cache /mnt/etc/zfs/zpool.cache

そしてArch Linuxをインストール。<br>
インストール前には/etc/pacman.d/mirrorlistを編集して、<br>
.jpのミラーを一番上に持ってくるのを忘れずに。

        # pacstrap -i /mnt base base-devel

インストールができたら、fstabを編集していきます。<br>

        # genfstab -U -p /mnt | grep boot >> /mnt/etc/fstab

また、zroot/varを作成した場合は以下を/mnt/etc/fstabへ追記します。

        zroot/var              /var          zfs      defaults,noatime,acl   0      0

あとは<a href="/blog/2015/04/22/raid-1-with-arch-linux/#arch_linux_install_chroot" target=_blank>Arch Linux をRAID1組んだ構成でUEFIブートでインストールしました</a>で書いたように、<br>
Arch Linuxにchrootで入って設定します。<br>
<br>
ただし、ZFSを使うにはいくつかのパッケージが必要です。<br>
あと、これを書いてる時点でgummibootはsystemd-bootになってましたので、<br>
そこについても書いておきます。<br>
<br>

<h3>3. ZFSのパッケージをインストール(chroot中)</h3>
ZFSのパッケージのインストールはdemz-repo-coreを利用するのが楽です。<br>
/etc/pacman.confの最終行に以下を追記します。

        [demz-repo-core]
        SigLevel = Required DatabaseOptional TrustedOnly
        Server = http://demizerone.com/$repo/$arch

/etc/pacman.confを編集したら、<br>
pacman's trusted key listにメンテナさんのkeyを追加します。

        # pacman-key -r 0EE7A126
        # pacman-key --lsign-key 0EE7A126
        # pacman -Syy

ここでコケる場合は以下を試してみましょう。
<h4>a. dirmngr_ldapservers.confを作成</h4>
/root/.gnupg/dirmngr_ldapservers.confがない場合、<br>
以下を実行してみてください。

        # mkdir /root/.gnupg
        # touch /root/.gnupg/dirmngr_ldapservers.conf

<h4>b. /etc/pacman.d/gnupg/gpg.confの編集</h4>
<a href="https://wiki.archlinux.org/index.php/Pacman/Package_signing#Troubleshooting" target=_blank>ここ</a>を参考に/etc/pacman.d/gnupg/gpg.confを編集してみましょう。<br>
<br>
demz-repo-coreの設定が上手くいったら、<br>
ZFSのパッケージをインストールします。<br>

        # pacman -S zfs

ここで、gitかltsかのパッケージの選択ができますが、<br>
gitの方のパッケージをインストールしようとしてKernelのバージョンが合わない場合
、<br>
古いバージョンのKernelをインストールする必要があります。<br>
Kernelなどの古いバージョンのパッケージは<a href="https://wiki.archlinux.org/index.php/Arch_Linux_Archive" target=_blank>ここ</a>を参考にインストールします。<br>
具体的には以下のリンク先から必要なパッケージをダウンロードしてインストールします。<br>
<a target=_blank>https://archive.archlinux.org/packages/l/linux/</a><br>

        # pacman -S wget
        #
        # cd /var/cache/pacman/pkg
        # wget https://archive.archlinux.org/packages/l/linux/"必要なパッケージ"
        # pacman -U "必要なパッケージ"

このやり方で古いKernelをインストールできます。<br>
<br>
zfsパッケージがインストールできたら、<br>
/etc/mkinitcpio.confを編集してinitramfsを再生成します。<br>
/etc/mkinitcpio.confのHOOKS=~の部分を以下のように編集します。

        HOOKS="base udev autodetect modconf block keyboard zfs filesystems fsck"

編集ができたら、以下のコマンドを実行します。

        mkinitcpio -p linux

この時zfsの部分でERRORが出なければ大丈夫のはずです。<br>

<h3>4. ブートローダのインストール(chroot中)</h3>
以下を実行します。

        # pacman -S dosfstools
        #
        # bootctl --path=/boot install

コマンドが実行できたら、以下のファイルを用意します。

        # vi /boot/loader/entries/arch.conf
        ----------------------------------------
        title          Arch Linux
        linux          /vmlinuz-linux
        initrd         /initramfs-linux.img
        options        zfs=bootfs rw

これで、あとはネットワーク周りの設定ができれば、<br>
ZFS上のArch Linuxが起動します。<br>
インストール作業が完了したら、chrootから出て
ファイルシステムをアンマウントし、zpoolをexportします。

        # exit
        # umount /mnt/boot
        # umount /mnt/var
        # zfs umount -a
        # zpool export zroot

以上ができたら、rebootします。

<h3>5. 初回起動後</h3>
以下を実行してください。

        # zpool set cachefile=/etc/zfs/zpool.cache zroot
        #
        # systemctl enable zfs.target

また、hostidコマンドを実行して得られた値を<br>
ブートオプションに追記します。

        # hostid
        XXXXXXXX
        #
        # vi /boot/loader/entries/arch.conf
        ------------------------------------
        title    Arch Linux
        linux    /vmlinuz-linux
        initrd   /initramfs-linux.img
        options  zfs=bootfs rw spl.spl_hostid=0xXXXXXXXX

これでインストール作業は完了です。<br>
<br>
今回は以上です。