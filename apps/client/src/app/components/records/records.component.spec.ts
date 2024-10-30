import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecordsComponent } from './records.component';
import { STORAGE_TOKEN } from '../../shared/services';

describe('RecordsComponent', () => {
	let component: RecordsComponent;
	let fixture: ComponentFixture<RecordsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [RecordsComponent],
			providers: [{ provide: STORAGE_TOKEN, useValue: localStorage }],
		}).compileComponents();

		fixture = TestBed.createComponent(RecordsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
