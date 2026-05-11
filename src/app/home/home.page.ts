import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { GameService } from '../game.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit {

  isLoginModalOpen = false;

  isScoresModalOpen = false;

  isSettingsModalOpen = false;

  currentNickname: string = '';

  highScores: any[] = [];

  soundEnabled = true;

  // TIKLAMA SESİ
  clickAudio =
    new Audio(
      'assets/sounds/tıklama.mp3'
    );

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    public gameService: GameService
  ) {}

  // TIKLAMA SESİ ÇAL
  playClick() {

    if (!this.soundEnabled) return;

    this.clickAudio.currentTime = 0;

    this.clickAudio.play().catch(() => {});
  }

  ngOnInit() {

    // SESİ ÖNCEDEN YÜKLE
    this.clickAudio.load();

    const sound =
      localStorage.getItem(
        'soundEnabled'
      );

    this.soundEnabled =
      sound !== 'false';

    const activeUser =
      localStorage.getItem(
        'activeUser'
      );

    if (activeUser) {

      this.currentNickname =
        activeUser;
    }

    this.refreshScores();
  }

  // SKORLAR
  refreshScores() {

    this.highScores =
      this.gameService.getHighScores();
  }

  // OYUNA BAŞLA
  openLoginModal() {

    this.playClick();

    this.isLoginModalOpen = true;
  }

  // SKOR TABLOSU
  openScoresModal() {

    this.playClick();

    this.refreshScores();

    this.isScoresModalOpen = true;
  }

  // AYARLAR
  openSettingsModal() {

    this.playClick();

    this.isSettingsModalOpen = true;
  }

  // GİRİŞ
  async handleLogin() {

    this.playClick();

    const nick =
      this.currentNickname.trim();

    if (!nick) {

      const alert =
        await this.alertCtrl.create({

        header: 'Hata',

        message:
          'Nickname giriniz!',

        buttons: [
          {
            text: 'TAMAM',

            handler: () => {

              this.playClick();
            }
          }
        ]
      });

      await alert.present();

      return;
    }

    localStorage.setItem(
      'activeUser',
      nick
    );

    this.gameService.setNickname(
      nick
    );

    this.isLoginModalOpen = false;

    setTimeout(() => {

      this.navCtrl.navigateForward(
        '/map'
      );

    }, 150);
  }

  // SES AÇ/KAPAT
  toggleSound() {

    this.soundEnabled =
      !this.soundEnabled;

    localStorage.setItem(
      'soundEnabled',
      String(this.soundEnabled)
    );

    if (this.soundEnabled) {

      setTimeout(() => {

        this.playClick();

      }, 100);
    }
  }

  // İSİM DEĞİŞTİR
  async changeNickname() {

    this.playClick();

    const activeUser =
      localStorage.getItem(
        'activeUser'
      );

    if (!activeUser) {

      const warn =
        await this.alertCtrl.create({

        header: 'Uyarı',

        message:
          'Önce giriş yapınız!',

        buttons: [
          {
            text: 'TAMAM',

            handler: () => {

              this.playClick();
            }
          }
        ]
      });

      await warn.present();

      return;
    }

    const alert =
      await this.alertCtrl.create({

        header: 'İsim Değiştir',

        inputs: [
          {
            name: 'nickname',
            placeholder: 'Yeni isim'
          }
        ],

        buttons: [

          {
            text: 'İPTAL',

            role: 'cancel',

            handler: () => {

              this.playClick();
            }
          },

          {
            text: 'KAYDET',

            handler: (data) => {

              this.playClick();

              if (
                data.nickname &&
                data.nickname.trim()
              ) {

                localStorage.setItem(
                  'activeUser',
                  data.nickname
                );

                this.currentNickname =
                  data.nickname;

                this.gameService.setNickname(
                  data.nickname
                );
              }
            }
          }
        ]
      });

      await alert.present();
  }

  // ÇIKIŞ YAP
  async logout() {

    this.playClick();

    const activeUser =
      localStorage.getItem(
        'activeUser'
      );

    if (!activeUser) {

      const warn =
        await this.alertCtrl.create({

        header: 'Uyarı',

        message:
          'Önce giriş yapınız!',

        buttons: [
          {
            text: 'TAMAM',

            handler: () => {

              this.playClick();
            }
          }
        ]
      });

      await warn.present();

      return;
    }

    const alert =
      await this.alertCtrl.create({

        header: 'Çıkış Yap',

        message:
          `"${activeUser}" hesabından çıkılsın mı?`,

        buttons: [

          {
            text: 'İPTAL',

            role: 'cancel',

            handler: () => {

              this.playClick();
            }
          },

          {
            text: 'ÇIKIŞ YAP',

            handler: () => {

              this.playClick();

              localStorage.removeItem(
                'activeUser'
              );

              this.currentNickname = '';

              this.isLoginModalOpen = false;

              this.isScoresModalOpen = false;

              this.isSettingsModalOpen = false;

              this.navCtrl.navigateRoot(
                '/home'
              );
            }
          }
        ]
      });

    await alert.present();
  }

  // HESABI SİL
  async deleteAccount() {

    this.playClick();

    const activeUser =
      localStorage.getItem(
        'activeUser'
      );

    if (!activeUser) {

      const warn =
        await this.alertCtrl.create({

        header: 'Uyarı',

        message:
          'Önce giriş yapınız!',

        buttons: [
          {
            text: 'TAMAM',

            handler: () => {

              this.playClick();
            }
          }
        ]
      });

      await warn.present();

      return;
    }

    const alert =
      await this.alertCtrl.create({

        header: 'Hesabı Sil',

        message:
          `"${activeUser}" hesabı silinsin mi?`,

        buttons: [

          {
            text: 'İPTAL',

            role: 'cancel',

            handler: () => {

              this.playClick();
            }
          },

          {
            text: 'SİL',

            handler: () => {

              this.playClick();

              localStorage.removeItem(
                'activeUser'
              );

              this.currentNickname = '';

              this.isSettingsModalOpen = false;
            }
          }
        ]
      });

      await alert.present();
  }

  // OYUNDAN ÇIKIŞ
  async exitGame() {

    this.playClick();

    const alert =
      await this.alertCtrl.create({

        header: 'Zihin Avcısı',

        message:
          'Oyundan çıkmak istiyor musunuz?',

        buttons: [

          {
            text: 'HAYIR',

            role: 'cancel',

            handler: () => {

              this.playClick();
            }
          },

          {
            text: 'EVET',

            handler: () => {

              this.playClick();

              window.open('', '_self');

              window.close();
            }
          }
        ]
      });

    await alert.present();
  }
}