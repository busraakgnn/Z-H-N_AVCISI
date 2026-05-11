import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GameService {
  private activeUser: any = null;

  // Nickname ile giriş yap veya yeni kayıt oluştur
  login(nickname: string) {
    const data = localStorage.getItem('zihin_avcısı_users');
    const users = data ? JSON.parse(data) : {};
    
    if (users[nickname]) {
      this.activeUser = users[nickname]; // Varsa veriyi yükle
    } else {
      this.activeUser = { // Yoksa yeni kullanıcı oluştur
        nickname: nickname,
        lives: 3,
        gold: 150,
        currentLevel: 1,
        lastUpdate: Date.now()
      };
      this.save();
    }
    return this.activeUser;
  }

  // Quiz sayfasındaki altın ekleme hatasını çözer
  addGold(amount: number) {
    if (this.activeUser) {
      this.activeUser.gold += amount;
      this.save();
    }
  }

  save() {
    if (!this.activeUser) return;
    const users = JSON.parse(localStorage.getItem('zihin_avcısı_users') || '{}');
    users[this.activeUser.nickname] = this.activeUser;
    localStorage.setItem('zihin_avcısı_users', JSON.stringify(users));
  }

  getStats() { return this.activeUser; }

  // Haritadaki kilitli/açık seviyeleri belirler
  getMapData() {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      status: (i + 1) <= (this.activeUser?.currentLevel || 1) ? 'unlocked' : 'locked'
    }));
  }
}