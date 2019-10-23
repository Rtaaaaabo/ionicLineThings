import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutTabPage } from './about-tab.page';

describe('AboutTabPage', () => {
  let component: AboutTabPage;
  let fixture: ComponentFixture<AboutTabPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AboutTabPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutTabPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
