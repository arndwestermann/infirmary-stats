import {
	AfterContentInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	Inject,
	Input,
	OnChanges,
	OnDestroy,
	Output,
	PLATFORM_ID,
	SimpleChanges,
	ViewChild,
} from '@angular/core';
import { NgClass, NgStyle, isPlatformBrowser } from '@angular/common';

import { DrawerComponent } from './drawer.component';
import { CloseDrawerDirective } from './close-drawer.directive';

// Thanks to https://github.com/arkon/ng-sidebar

// Based on https://github.com/angular/material2/tree/master/src/lib/sidenav
@Component({
	selector: 'drawer-container',
	standalone: true,
	imports: [NgClass, NgStyle, CloseDrawerDirective],
	template: `
		@if (showBackdrop) {
		<div aria-hidden="true" class="drawer__backdrop" [ngClass]="backdropClass" (click)="_onBackdropClicked()"></div>
		}

		<ng-content select="drawer,[drawer]"></ng-content>
		<div #drawerContent class="drawer__content" [class.drawer__content--animate]="animate" [ngClass]="contentClass" [ngStyle]="_getContentStyle()">
			<ng-content select="[drawer-content]"></ng-content>
		</div>
	`,
	styles: [
		`
			:host {
				box-sizing: border-box;
				display: block;
				position: relative;
				height: 100%;
				width: 100%;
				overflow: hidden;
			}

			.drawer__backdrop {
				position: absolute;
				top: 0;
				bottom: 0;
				left: 0;
				right: 0;
				background: #000;
				opacity: 0.75;
				pointer-events: auto;
				z-index: 1;
			}

			.drawer__content {
				-webkit-overflow-scrolling: touch;
				overflow: auto;
				position: absolute;
				top: 0;
				bottom: 0;
				left: 0;
				right: 0;
			}

			.drawer__content--animate {
				-webkit-transition: -webkit-transform 0.3s cubic-bezier(0, 0, 0.3, 1), padding 0.3s cubic-bezier(0, 0, 0.3, 1);
				transition: transform 0.3s cubic-bezier(0, 0, 0.3, 1), padding 0.3s cubic-bezier(0, 0, 0.3, 1);
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerContainerComponent implements AfterContentInit, OnChanges, OnDestroy {
	// TODO: Refactor to signals approach
	@Input() animate: boolean = true;

	@Input() allowDrawerBackdropControl: boolean = true;
	@Input() showBackdrop: boolean = false;
	@Output() showBackdropChange = new EventEmitter<boolean>();
	@Output() backdropClicked = new EventEmitter<null>();

	@Input() contentClass: string = '';
	@Input() backdropClass: string = '';

	@ViewChild('drawerContent', { static: true }) private drawerContent!: ElementRef;

	private _drawers: Array<DrawerComponent> = [];

	private resizeObserver!: ResizeObserver;

	private _isBrowser: boolean;

	constructor(
		private _ref: ChangeDetectorRef,
		// eslint-disable-next-line @typescript-eslint/ban-types
		@Inject(PLATFORM_ID) platformId: Object
	) {
		this._isBrowser = isPlatformBrowser(platformId);

		this.resizeObserver = new ResizeObserver(() => {
			this._markForCheck();
		});
	}

	ngAfterContentInit(): void {
		if (!this._isBrowser) {
			return;
		}

		this._onToggle();
		this.resizeObserver.observe(this.drawerContent.nativeElement);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (!this._isBrowser) {
			return;
		}

		if (changes['showBackdrop']) {
			this.showBackdropChange.emit(changes['showBackdrop'].currentValue);
		}
	}

	ngOnDestroy(): void {
		if (!this._isBrowser) {
			return;
		}

		this._unsubscribe();
	}

	/**
	 * @internal
	 *
	 * Adds a drawer to the container's list of drawers.
	 *
	 * @param drawer {DrawerComponent} A drawer within the container to register.
	 */
	_addDrawer(drawer: DrawerComponent) {
		this._drawers.push(drawer);
		this._subscribe(drawer);
	}

	/**
	 * @internal
	 *
	 * Removes a drawer from the container's list of drawers.
	 *
	 * @param drawer {DrawerComponent} The drawer to remove.
	 */
	_removeDrawer(drawer: DrawerComponent) {
		const index = this._drawers.indexOf(drawer);
		if (index !== -1) {
			this._drawers.splice(index, 1);
		}
	}

	/**
	 * @internal
	 *
	 * Computes `margin` value to push page contents to accommodate open drawers as needed.
	 *
	 * @return {CSSStyleDeclaration} margin styles for the page content.
	 */
	_getContentStyle(): CSSStyleDeclaration {
		let left = 0,
			right = 0,
			top = 0,
			bottom = 0;

		let transformStyle: string = '';
		let heightStyle: string = '';
		let widthStyle: string = '';

		for (const drawer of this._drawers) {
			// Slide mode: we need to translate the entire container
			if (drawer._isModeSlide) {
				if (drawer.opened) {
					const transformDir: string = drawer._isLeftOrRight ? 'X' : 'Y';
					const transformAmt: string = `${drawer._isLeftOrTop ? '' : '-'}${drawer._isLeftOrRight ? drawer._width : drawer._height}`;

					transformStyle = `translate${transformDir}(${transformAmt}px)`;
				}
			}

			// Create a space for the drawer
			if ((drawer._isModePush && drawer.opened) || drawer.dock) {
				let paddingAmt: number = 0;

				if (drawer._isModeSlide && drawer.opened) {
					if (drawer._isLeftOrRight) {
						widthStyle = '100%';
					} else {
						heightStyle = '100%';
					}
				} else {
					if (drawer._isDocked || (drawer._isModeOver && drawer.dock)) {
						paddingAmt = drawer._dockedSize;
					} else {
						paddingAmt = drawer._isLeftOrRight ? drawer._width : drawer._height;
					}
				}

				switch (drawer.position) {
					case 'left':
						left = Math.max(left, paddingAmt);
						break;

					case 'right':
						right = Math.max(right, paddingAmt);
						break;

					case 'top':
						top = Math.max(top, paddingAmt);
						break;

					case 'bottom':
						bottom = Math.max(bottom, paddingAmt);
						break;
				}
			}
		}

		return {
			padding: `${top}px ${right}px ${bottom}px ${left}px`,
			webkitTransform: transformStyle,
			transform: transformStyle,
			height: heightStyle,
			width: widthStyle,
		} as CSSStyleDeclaration;
	}

	/**
	 * @internal
	 *
	 * Closes drawers when the backdrop is clicked, if they have the
	 * `closeOnClickBackdrop` option set.
	 */
	_onBackdropClicked(): void {
		let backdropClicked = false;
		for (const drawer of this._drawers) {
			if (drawer.opened && drawer.showBackdrop && drawer.closeOnClickBackdrop) {
				drawer.close();
				backdropClicked = true;
			}
		}

		if (backdropClicked) {
			this.backdropClicked.emit();
		}
	}

	/**
	 * Subscribes from a drawer events to react properly.
	 */
	private _subscribe(drawer: DrawerComponent): void {
		drawer.openStart.subscribe(() => this._onToggle());
		drawer.openEnd.subscribe(() => this._markForCheck());

		drawer.closeStart.subscribe(() => this._onToggle());
		drawer.closeEnd.subscribe(() => this._markForCheck());

		drawer.modeChange.subscribe(() => this._markForCheck());
		drawer.positionChange.subscribe(() => this._markForCheck());

		drawer._onRerender.subscribe(() => this._markForCheck());
	}

	/**
	 * Unsubscribes from all drawers.
	 */
	private _unsubscribe(): void {
		for (const drawer of this._drawers) {
			drawer.openStart.unsubscribe();
			drawer.openEnd.unsubscribe();

			drawer.closeStart.unsubscribe();
			drawer.closeEnd.unsubscribe();

			drawer.modeChange.unsubscribe();
			drawer.positionChange.unsubscribe();

			drawer._onRerender.unsubscribe();
		}
	}

	/**
	 * Check if we should show the backdrop when a drawer is toggled.
	 */
	private _onToggle(): void {
		if (this._drawers.length > 0 && this.allowDrawerBackdropControl) {
			// Show backdrop if a single open drawer has it set
			const hasOpen = this._drawers.some((drawer) => drawer.opened && drawer.showBackdrop);

			this.showBackdrop = hasOpen;
			this.showBackdropChange.emit(hasOpen);
		}

		setTimeout(() => {
			this._markForCheck();
		});
	}

	/**
	 * Triggers change detection to recompute styles.
	 */
	private _markForCheck(): void {
		this._ref.markForCheck();
	}
}
