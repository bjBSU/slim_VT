import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartRenderComponent } from './chart-render.component';

describe('ChartRenderComponent', () => {
  let component: ChartRenderComponent;
  let fixture: ComponentFixture<ChartRenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartRenderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
