import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '../../game.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.page.html',
  styleUrls: ['./quiz.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class QuizPage implements OnInit, OnDestroy {

  levelId = 1;

  questions: any[] = [];

  currentQuestion: any;

  currentIndex = 0;

  totalQuestions = 7;

  remainingTime = 45;

  timerInterval: any;

  tickAudio: HTMLAudioElement | null = null;

  lockAudio =
    new Audio('assets/sounds/kilitsesi.wav');

  isAnswered = false;

  selectedOption: string | null = null;

  hiddenOptions: string[] = [];

  wrongCount = 0;

  usedJokerInLevel = false;

  usedJokerInCurrentQuestion = false;

  constructor(
    private route: ActivatedRoute,
    public gameService: GameService,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) {}

  // TIKLAMA SESİ
  playClick() {

    const click =
      new Audio('assets/sounds/tıklama.mp3');

    click.volume = 0.7;

    click.play().catch(() => {});
  }

  // GENEL SES
  playSound(file: string) {

    const audio =
      new Audio(`assets/sounds/${file}`);

    audio.volume = 0.5;

    audio.play().catch(() => {});
  }

  // SON 10 SANİYE SESİ
  playTickSound() {

    this.stopTickSound();

    this.tickAudio =
      new Audio('assets/sounds/soru zaman sesi.wav');

    this.tickAudio.volume = 0.5;

    this.tickAudio.loop = true;

    this.tickAudio.play().catch(() => {});
  }

  stopTickSound() {

    if (this.tickAudio) {

      this.tickAudio.pause();

      this.tickAudio.currentTime = 0;

      this.tickAudio = null;
    }
  }

  async ngOnInit() {

    this.lockAudio.load();

    this.route.queryParams.subscribe(async params => {

      this.levelId =
        +params['id'] || 1;

      this.questions =
        await this.gameService.getQuestionsForLevel(
          this.levelId,
          this.totalQuestions
        );

      this.currentIndex = 0;

      this.loadCurrentQuestion();
    });
  }

  // SORU YÜKLE
  loadCurrentQuestion() {

    this.stopTimer();

    this.stopTickSound();

    this.currentQuestion =
      this.questions[this.currentIndex];

    this.isAnswered = false;

    this.selectedOption = null;

    this.hiddenOptions = [];

    this.remainingTime = 45;

    this.usedJokerInCurrentQuestion = false;

    this.startTimer();
  }

  // TIMER
  startTimer() {

    this.stopTimer();

    let tickStarted = false;

    this.timerInterval =
      setInterval(() => {

      if (this.remainingTime > 0) {

        this.remainingTime--;

        if (
          this.remainingTime <= 10 &&
          !tickStarted
        ) {

          tickStarted = true;

          this.playTickSound();
        }

      } else {

        this.stopTimer();

        this.stopTickSound();

        this.checkAnswer('SÜRE');
      }

    }, 1000);
  }

  stopTimer() {

    if (this.timerInterval) {

      clearInterval(
        this.timerInterval
      );

      this.timerInterval = null;
    }
  }

  // CEVAP KONTROL
  async checkAnswer(option: string) {

    if (this.isAnswered) return;

    this.stopTickSound();

    this.playClick();

    this.isAnswered = true;

    this.selectedOption = option;

    this.stopTimer();

    const correct =
      option === this.currentQuestion.cevap;

    if (!correct) {

      this.playSound(
        'yanlışcevap.wav'
      );

      this.wrongCount++;

      if (this.wrongCount >= 3) {

        this.gameService.loseLife();

        return this.gameOver();
      }

    } else {

      this.playSound(
        'dogrucevap.mp3'
      );

      if (
        !this.usedJokerInCurrentQuestion
      ) {

        this.gameService.addGold(10);
      }
    }

    setTimeout(() => {

      this.nextQuestion();

    }, 1200);
  }

  // SONRAKİ SORU
  async nextQuestion() {

    if (
      this.currentIndex <
      this.questions.length - 1
    ) {

      this.currentIndex++;

      this.loadCurrentQuestion();

    } else {

      this.finishLevel();
    }
  }

  // LEVEL BİTİR
  async finishLevel() {

    this.stopTimer();

    this.stopTickSound();

    this.playSound('kazanma.wav');

    // LEVEL TAMAMLANDI
    this.gameService.completeLevel(
      this.levelId
    );

    // ALTIN
    const reward =
      (!this.usedJokerInLevel && this.wrongCount === 0)
        ? 100
        : 50;

    this.gameService.addGold(
      reward
    );

    // HER 3 LEVELDE JOKER VER
    if (this.levelId % 3 === 0) {

      this.gameService.userStats.jokers.fiftyFifty++;

      this.gameService.userStats.jokers.audience++;

      this.gameService.userStats.jokers.pass++;

      // KAYDET
      localStorage.setItem(
        'userStats',
        JSON.stringify(this.gameService.userStats)
      );
    }

    const alert =
      await this.alertCtrl.create({

      header: 'BÖLÜM TAMAMLANDI',

      message:
        this.levelId % 3 === 0
          ? `💰 ${reward} altın kazandınız!

🎁 +1 Tüm Jokerler!`
          : `💰 ${reward} altın kazandınız!`,

      backdropDismiss: false,

      buttons: [

        {
          text: 'TEKRAR OYNA',

          handler: async () => {

            this.playClick();

            this.questions =
              await this.gameService.getQuestionsForLevel(
                this.levelId,
                this.totalQuestions
              );

            this.currentIndex = 0;

            this.wrongCount = 0;

            this.usedJokerInLevel = false;

            this.loadCurrentQuestion();
          }
        },

        {
          text: 'BÖLÜMLERE DÖN',

          handler: () => {

            // TIKLAMA SESİ
            this.playClick();

            setTimeout(() => {

              // KİLİT SESİ
              this.lockAudio.currentTime = 0;

              this.lockAudio.play().catch(() => {});

            }, 300);

            this.navCtrl.navigateRoot(
              '/map'
            );
          }
        }
      ]
    });

    await alert.present();
  }

  // %50
  useFiftyFifty() {

    if (
      this.isAnswered ||
      this.gameService.userStats.jokers.fiftyFifty <= 0
    ) return;

    this.playClick();

    this.gameService.userStats.jokers.fiftyFifty--;

    this.usedJokerInLevel = true;

    this.usedJokerInCurrentQuestion = true;

    const correct =
      this.currentQuestion.cevap;

    const wrongs =
      this.currentQuestion.secenekler.filter(
        (x: string) => x !== correct
      );

    this.hiddenOptions =
      wrongs
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
  }

  // SEYİRCİ
  async useAudienceJoker() {

    if (
      this.isAnswered ||
      this.gameService.userStats.jokers.audience <= 0
    ) return;

    this.playClick();

    this.gameService.userStats.jokers.audience--;

    this.usedJokerInLevel = true;

    this.usedJokerInCurrentQuestion = true;

    const alert =
      await this.alertCtrl.create({

      header: 'SEYİRCİ',

      message:
        `Seyirciler "${this.currentQuestion.cevap}" cevabını öneriyor.`,

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
  }

  // PAS
  usePassJoker() {

    if (
      this.isAnswered ||
      this.gameService.userStats.jokers.pass <= 0
    ) return;

    this.playClick();

    this.gameService.userStats.jokers.pass--;

    this.usedJokerInLevel = true;

    this.usedJokerInCurrentQuestion = true;

    this.nextQuestion();
  }

  // ŞIK CSS
  getOptionClass(option: string) {

    if (
      this.hiddenOptions.includes(option)
    )
      return 'hidden-option';

    if (!this.isAnswered)
      return '';

    if (
      option === this.currentQuestion.cevap
    )
      return 'correct-anim';

    if (
      option === this.selectedOption
    )
      return 'wrong-anim';

    return 'fade-option';
  }

  // TIMER CSS
  getTimerClass() {

    return this.remainingTime <= 10
      ? 'low-time'
      : '';
  }

  // GAME OVER
  async gameOver() {

    this.stopTickSound();

    this.playSound('kaybetme.wav');

    const alert =
      await this.alertCtrl.create({

      header: 'OYUN BİTTİ',

      message:
        '3 yanlış yaptınız.',

      backdropDismiss: false,

      buttons: [
        {
          text: 'HARİTAYA DÖN',

          handler: () => {

            this.playClick();

            this.navCtrl.navigateRoot(
              '/map'
            );
          }
        }
      ]
    });

    await alert.present();
  }

  ngOnDestroy() {

    this.stopTimer();

    this.stopTickSound();
  }
}