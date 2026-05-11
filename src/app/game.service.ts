import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  public userStats = {

    nickname: '',

    lives: 5,

    maxLives: 5,

    gold: 100,

    lastLifeUpdate: Date.now(),

    // 15 DAKİKA
    nextLifeTime: 900,

    completedLevels: 0,

    jokers: {
      fiftyFifty: 3,
      audience: 3,
      pass: 3
    }
  };

  private lifeInterval: any;

  constructor(private http: HttpClient) {

    this.startLifeTimer();
  }

  // CAN TIMER
  startLifeTimer() {

    this.lifeInterval = setInterval(() => {

      if (
        this.userStats.lives <
        this.userStats.maxLives
      ) {

        if (this.userStats.nextLifeTime > 0) {

          this.userStats.nextLifeTime--;

        } else {

          // CAN EKLE
          this.userStats.lives++;

          // SON GÜNCELLEME
          this.userStats.lastLifeUpdate =
            Date.now();

          this.saveGame();

          if (
            this.userStats.lives <
            this.userStats.maxLives
          ) {

            // 15 DK RESET
            this.userStats.nextLifeTime = 900;
          }
        }

      } else {

        this.userStats.nextLifeTime = 900;
      }

    }, 1000);
  }

  stopLifeTimer() {

    if (this.lifeInterval) {

      clearInterval(this.lifeInterval);

      this.lifeInterval = null;
    }
  }

  // SAVE
  saveGame() {

    if (!this.userStats.nickname) return;

    localStorage.setItem(

      `zihin_avcisi_${this.userStats.nickname}`,

      JSON.stringify(this.userStats)
    );
  }

  // LOAD
  loadGame(name: string) {

    const save =
      localStorage.getItem(
        `zihin_avcisi_${name}`
      );

    if (save) {

      this.userStats = JSON.parse(save);

      // ŞU ANKİ ZAMAN
      const now =
        Date.now();

      // GEÇEN SÜRE
      const passedSeconds =
        Math.floor(
          (now - this.userStats.lastLifeUpdate) / 1000
        );

      // CAN EKSİKSE
      if (
        this.userStats.lives <
        this.userStats.maxLives
      ) {

        // KAZANILAN CAN
        const gainedLives =
          Math.floor(
            passedSeconds / 900
          );

        if (gainedLives > 0) {

          this.userStats.lives =
            Math.min(
              this.userStats.lives + gainedLives,
              this.userStats.maxLives
            );
        }

        // KALAN SÜRE
        const remain =
          passedSeconds % 900;

        this.userStats.nextLifeTime =
          900 - remain;

      } else {

        this.userStats.nextLifeTime = 900;
      }

    } else {

      this.userStats = {

        nickname: name,

        lives: 5,

        maxLives: 5,

        gold: 100,

        lastLifeUpdate: Date.now(),

        nextLifeTime: 900,

        completedLevels: 0,

        jokers: {
          fiftyFifty: 3,
          audience: 3,
          pass: 3
        }
      };
    }

    this.saveGame();
  }

  // SKOR EKLE
  addHighScore(
    nickname: string,
    gold: number
  ) {

    let scores = [];

    try {

      scores = JSON.parse(
        localStorage.getItem(
          'zihin_avcisi_scores'
        ) || '[]'
      );

    } catch {

      scores = [];
    }

    const existingIndex =
      scores.findIndex(
        (s: any) => s.name === nickname
      );

    if (existingIndex > -1) {

      if (gold > scores[existingIndex].points) {

        scores[existingIndex].points = gold;
      }

    } else {

      scores.push({
        name: nickname,
        points: gold
      });
    }

    scores.sort(
      (a: any, b: any) =>
        b.points - a.points
    );

    scores = scores.slice(0, 10);

    localStorage.setItem(
      'zihin_avcisi_scores',
      JSON.stringify(scores)
    );
  }

  // SKOR GETİR
  getHighScores() {

    try {

      return JSON.parse(
        localStorage.getItem(
          'zihin_avcisi_scores'
        ) || '[]'
      );

    } catch {

      return [];
    }
  }

  // SORULAR
  async getQuestionsForLevel(
    levelId: number,
    count: number
  ) {

    try {

      const data: any =
        await firstValueFrom(
          this.http.get(
            'assets/data/questions.json'
          )
        );

      // LEVEL HAVUZU
      let pool: any[] =
        levelId <= 20
          ? data.easy
          : (
              levelId <= 40
                ? data.medium
                : data.hard
            );

      // KULLANILANLAR
      const usedQuestions: string[] =
        JSON.parse(
          localStorage.getItem(
            'usedQuestions'
          ) || '[]'
        );

      // AYNI SORULARI ÇIKAR
      let available: any[] =
        pool.filter(
          (q: any) =>
            !usedQuestions.includes(
              q.soru
            )
        );

      // YETERSİZSE RESET
      if (available.length < count) {

        localStorage.removeItem(
          'usedQuestions'
        );

        available = [...pool];
      }

      // RANDOM
      const shuffled: any[] =
        [...available];

      for (
        let i = shuffled.length - 1;
        i > 0;
        i--
      ) {

        const j =
          Math.floor(
            Math.random() * (i + 1)
          );

        [
          shuffled[i],
          shuffled[j]
        ] = [
          shuffled[j],
          shuffled[i]
        ];
      }

      // SORU SEÇ
      const selected: any[] =
        shuffled.slice(0, count);

      // KAYDET
      const updatedUsed: string[] = [

        ...usedQuestions,

        ...selected.map(
          (q: any) => q.soru
        )
      ];

      localStorage.setItem(

        'usedQuestions',

        JSON.stringify(updatedUsed)
      );

      return selected;

    } catch (error) {

      console.error(
        'Soru yükleme hatası!',
        error
      );

      return [];
    }
  }

  // MAP
  getMapData() {

    let levels = [];

    for (let i = 1; i <= 50; i++) {

      let qCount =
        i <= 20 ? 7 : 10;

      let qTime =
        i <= 20
          ? 45
          : (
              i <= 40
                ? 30
                : 20
            );

      levels.push({

        id: i,

        status:
          i <= (
            this.userStats.completedLevels + 1
          )
            ? (
                i ===
                this.userStats.completedLevels + 1
                  ? 'active'
                  : 'completed'
              )
            : 'locked',

        questionCount: qCount,

        timePerQuestion: qTime
      });
    }

    return levels;
  }

  // CAN AZALT
  loseLife() {

    if (this.userStats.lives > 0) {

      this.userStats.lives--;

      // ZAMANI BAŞLAT
      this.userStats.lastLifeUpdate =
        Date.now();

      // 15 DK
      this.userStats.nextLifeTime = 900;

      this.saveGame();
    }
  }

  // ALTIN
  addGold(amt: number) {

    this.userStats.gold += amt;

    this.addHighScore(
      this.userStats.nickname || 'AVCI',
      this.userStats.gold
    );

    this.saveGame();
  }

  // İSİM
  setNickname(name: string) {

    this.loadGame(name);

    this.saveGame();
  }

  // LEVEL TAMAMLAMA
  completeLevel(id: number) {

    if (
      id >
      this.userStats.completedLevels
    ) {

      this.userStats.completedLevels = id;

      // LEVEL KAYDET
      localStorage.setItem(
        'currentLevel',
        id.toString()
      );

      this.saveGame();
    }
  }
}