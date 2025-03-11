import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartRenderDataComponent } from './chart-render-data.component';

describe('ChartRenderDataComponent', () => {
  let component: ChartRenderDataComponent;
  let fixture: ComponentFixture<ChartRenderDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartRenderDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartRenderDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
