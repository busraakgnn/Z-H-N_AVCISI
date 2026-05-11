import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizPage } from './quiz.page';
import { IonicModule } from '@ionic/angular';
import { GameService } from '../../game.service'; // Yol kontrolü: app klasöründeki servis
import { CommonModule } from '@angular/common';

describe('QuizPage', () => {
  let component: QuizPage;
  let fixture: ComponentFixture<QuizPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Standalone bileşen olduğu için imports kısmına ekliyoruz
      imports: [QuizPage, IonicModule.forRoot(), CommonModule],
      // Bileşenin kullandığı servisleri buraya ekliyoruz
      providers: [GameService]
    }).compileComponents();

    fixture = TestBed.createComponent(QuizPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});