import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, IonContent, AlertController } from '@ionic/angular';
import { GameService } from '../../game.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class MapPage implements OnInit, OnDestroy {

  @ViewChild(IonContent) content!: IonContent;

  levels: any[] = [];

  currentNickname: string = 'AVCI';

  timerRef: any;

  // TIKLAMA SESİ
  clickAudio = new Audio('assets/sounds/tıklama.mp3');

  constructor(
    private navCtrl: NavController,
    public gameService: GameService,
    private cdr: ChangeDetectorRef,
    private alertCtrl: AlertController
  ) {}

  // TIKLAMA SESİ ÇALMA
  playClick() {
    this.clickAudio.currentTime = 0;
    this.clickAudio.play().catch(() => {});
  }

  // GERİ TUŞU
  goBack() {
    this.playClick();
    setTimeout(() => {
      this.navCtrl.back();
    }, 120);
  }

  ngOnInit() {
    this.clickAudio.load();

    const saved = localStorage.getItem('activeUser');
    if (saved) {
      this.currentNickname = saved;
      this.gameService.setNickname(saved);
    }

    this.refreshLevels();

    // Can yenilenmesini takip etmek için timer
    this.timerRef = setInterval(() => {
      if (this.gameService.userStats.lives < 5) {
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' + s : s}`;
  }

  ionViewWillEnter() {
    this.refreshLevels();
    this.cdr.detectChanges();
  }

  refreshLevels() {
    this.levels = this.gameService.getMapData();
  }

  // Sayfa tamamen yüklendiğinde aktif seviyeye kaydır
  ionViewDidEnter() {
    this.scrollToActiveLevel();
  }

  scrollToActiveLevel() {
    setTimeout(() => {
      // Aktif olan seviyenin index'ini bul
      const activeIndex = this.levels.findIndex(l => l.status === 'active');
      
      if (activeIndex !== -1) {
        // HTML üzerindeki tüm bölümleri al
        const levelElements = document.querySelectorAll('.level-item');
        const activeElement = levelElements[activeIndex] as HTMLElement;

        if (activeElement) {
          // Bölümün gerçek konumunu ve ekran ortasını hesapla
          const elementTop = activeElement.offsetTop;
          const windowHeight = window.innerHeight;
          const elementHeight = activeElement.offsetHeight;
          
          // Bölümü ekranın tam ortasına getirecek koordinat
          const centerPosition = elementTop - (windowHeight / 2) + (elementHeight / 2);

          // Hassas kaydırma yap
          this.content.scrollToPoint(0, centerPosition, 1000);
        }
      }
    }, 600); // Haritanın render olması için güvenli süre
  }

  async goToQuiz(level: any) {
    this.playClick();

    // CAN KONTROLÜ
    if (this.gameService.userStats.lives <= 0) {
      const alert = await this.alertCtrl.create({
        header: 'CANIN BİTTİ!',
        message: 'Can hakkınız bitmiştir. Yeni can gelene kadar beklemelisin!',
        buttons: ['TAMAM']
      });
      await alert.present();
      return; // Can yoksa oyuna sokma
    }

    // Can varsa ve kilitli değilse ilerle
    if (level && level.status !== 'locked') {
      setTimeout(() => {
        this.navCtrl.navigateForward(['/quiz'], {
          queryParams: {
            id: level.id,
            qCount: level.questionCount,
            qTime: level.timePerQuestion
          }
        });
      }, 120);
    }
  }

  ngOnDestroy() {
    if (this.timerRef)
      clearInterval(this.timerRef);
  }
}