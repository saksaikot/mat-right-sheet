import * as i1$1 from '@angular/cdk/overlay';
import { OverlayModule, OverlayConfig } from '@angular/cdk/overlay';
import * as i4 from '@angular/cdk/portal';
import { BasePortalOutlet, CdkPortalOutlet, PortalModule, TemplatePortal, ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import * as i2$1 from '@angular/common';
import { DOCUMENT, CommonModule } from '@angular/common';
import * as i0 from '@angular/core';
import { InjectionToken, EventEmitter, Component, ChangeDetectionStrategy, ViewEncapsulation, Optional, Inject, ViewChild, NgModule, TemplateRef, Injectable, SkipSelf } from '@angular/core';
import { AnimationDurations, AnimationCurves, MatCommonModule } from '@angular/material/core';
import { coerceArray } from '@angular/cdk/coercion';
import * as i2 from '@angular/cdk/layout';
import { Breakpoints } from '@angular/cdk/layout';
import { _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { trigger, state, style, transition, animate } from '@angular/animations';
import * as i1 from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { Subject, merge, of } from 'rxjs';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { filter, take } from 'rxjs/operators';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Animations used by the Material bottom sheet. */
const matRightSheetAnimations = {
    /** Animation that shows and hides a bottom sheet. */
    rightSheetState: trigger('state', [
        state('void, hidden', style({ transform: 'translateX(100%)' })),
        state('visible', style({ transform: 'translateX(0%)' })),
        transition('visible => void, visible => hidden', animate(`${AnimationDurations.COMPLEX} ${AnimationCurves.ACCELERATION_CURVE}`)),
        transition('void => visible', animate(`${AnimationDurations.EXITING} ${AnimationCurves.DECELERATION_CURVE}`)),
    ]),
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Injection token that can be used to access the data that was passed in to a bottom sheet. */
const MAT_RIGHT_SHEET_DATA = new InjectionToken('MatRightSheetData');
/**
 * Configuration used when opening a right sheet.
 */
class MatRightSheetConfig {
    constructor() {
        /** Data being injected into the child component. */
        this.data = null;
        /** Whether the bottom sheet has a backdrop. */
        this.hasBackdrop = true;
        /** Whether the user can use escape or clicking outside to close the bottom sheet. */
        this.disableClose = false;
        /** Aria label to assign to the bottom sheet element. */
        this.ariaLabel = null;
        /**
         * Whether the bottom sheet should close when the user goes backwards/forwards in history.
         * Note that this usually doesn't include clicking on links (unless the user is using
         * the `HashLocationStrategy`).
         */
        this.closeOnNavigation = true;
        // Note that this is set to 'dialog' by default, because while the a11y recommendations
        // are to focus the first focusable element, doing so prevents screen readers from reading out the
        // rest of the bottom sheet content.
        /**
         * Where the bottom sheet should focus on open.
         * @breaking-change 14.0.0 Remove boolean option from autoFocus. Use string or
         * AutoFocusTarget instead.
         */
        this.autoFocus = 'dialog';
        /**
         * Whether the bottom sheet should restore focus to the
         * previously-focused element, after it's closed.
         */
        this.restoreFocus = true;
    }
}

// TODO(crisbeto): consolidate some logic between this, MatDialog and MatSnackBar
/**
 * Internal component that wraps user-provided bottom sheet content.
 * @docs-private
 */
// tslint:disable-next-line: component-class-suffix
class MatRightSheetContainer extends BasePortalOutlet {
    constructor(_elementRef, _changeDetectorRef, _focusTrapFactory, _interactivityChecker, _ngZone, breakpointObserver, document, 
    /**
     * The right sheet configuration.
     */
    rightSheetConfig) {
        super();
        this._elementRef = _elementRef;
        this._changeDetectorRef = _changeDetectorRef;
        this._focusTrapFactory = _focusTrapFactory;
        this._interactivityChecker = _interactivityChecker;
        this._ngZone = _ngZone;
        this.rightSheetConfig = rightSheetConfig;
        /** Emits whenever the state of the animation changes. */
        this._animationStateChanged = new EventEmitter();
        /** The state of the bottom sheet animations. */
        this._animationState = 'void';
        /** Element that was focused before the bottom sheet was opened. */
        this._elementFocusedBeforeOpened = null;
        this._document = document;
        this._breakpointSubscription = breakpointObserver
            .observe([
            Breakpoints.Medium,
            Breakpoints.Large,
            Breakpoints.XLarge,
        ])
            .subscribe(() => {
            this._toggleClass('mat-right-sheet-container-medium', breakpointObserver.isMatched(Breakpoints.Medium));
            this._toggleClass('mat-right-sheet-container-large', breakpointObserver.isMatched(Breakpoints.Large));
            this._toggleClass('mat-right-sheet-container-xlarge', breakpointObserver.isMatched(Breakpoints.XLarge));
        });
    }
    /** Attach a component portal as content to this bottom sheet container. */
    attachComponentPortal(portal) {
        this._validatePortalAttached();
        this._setPanelClass();
        this._savePreviouslyFocusedElement();
        return this._portalOutlet.attachComponentPortal(portal);
    }
    /** Attach a template portal as content to this bottom sheet container. */
    attachTemplatePortal(portal) {
        this._validatePortalAttached();
        this._setPanelClass();
        this._savePreviouslyFocusedElement();
        return this._portalOutlet.attachTemplatePortal(portal);
    }
    /** Begin animation of bottom sheet entrance into view. */
    enter() {
        if (!this._destroyed) {
            this._animationState = 'visible';
            this._changeDetectorRef.detectChanges();
        }
    }
    /** Begin animation of the bottom sheet exiting from view. */
    exit() {
        if (!this._destroyed) {
            this._animationState = 'hidden';
            this._changeDetectorRef.markForCheck();
        }
    }
    ngOnDestroy() {
        this._breakpointSubscription.unsubscribe();
        this._destroyed = true;
    }
    _onAnimationDone(event) {
        if (event.toState === 'hidden') {
            this._restoreFocus();
        }
        else if (event.toState === 'visible') {
            this._trapFocus();
        }
        this._animationStateChanged.emit(event);
    }
    _onAnimationStart(event) {
        this._animationStateChanged.emit(event);
    }
    _toggleClass(cssClass, add) {
        this._elementRef.nativeElement.classList.toggle(cssClass, add);
    }
    _validatePortalAttached() {
        if (this._portalOutlet.hasAttached()) {
            throw Error('Attempting to attach bottom sheet content after content is already attached');
        }
    }
    _setPanelClass() {
        const element = this._elementRef.nativeElement;
        element.classList.add(...coerceArray(this.rightSheetConfig.panelClass || []));
    }
    /**
       * Focuses the provided element. If the element is not focusable, it will add a tabIndex
       * attribute to forcefully focus it. The attribute is removed after focus is moved.
       * @param element The element to focus.
       */
    _forceFocus(element, options) {
        if (!this._interactivityChecker.isFocusable(element)) {
            element.tabIndex = -1;
            // The tabindex attribute should be removed to avoid navigating to that element again
            this._ngZone.runOutsideAngular(() => {
                element.addEventListener('blur', () => element.removeAttribute('tabindex'));
                element.addEventListener('mousedown', () => element.removeAttribute('tabindex'));
            });
        }
        element.focus(options);
    }
    /**
     * Focuses the first element that matches the given selector within the focus trap.
     * @param selector The CSS selector for the element to set focus to.
     */
    _focusByCssSelector(selector, options) {
        let elementToFocus = this._elementRef.nativeElement.querySelector(selector);
        if (elementToFocus) {
            this._forceFocus(elementToFocus, options);
        }
    }
    /**
     * Moves the focus inside the focus trap. When autoFocus is not set to 'bottom-sheet',
     * if focus cannot be moved then focus will go to the bottom sheet container.
     */
    _trapFocus() {
        const element = this._elementRef.nativeElement;
        if (!this._focusTrap) {
            this._focusTrap = this._focusTrapFactory.create(element);
        }
        // If were to attempt to focus immediately, then the content of the bottom sheet would not
        // yet be ready in instances where change detection has to run first. To deal with this,
        // we simply wait for the microtask queue to be empty when setting focus when autoFocus
        // isn't set to bottom sheet. If the element inside the bottom sheet can't be focused,
        // then the container is focused so the user can't tab into other elements behind it.
        switch (this.rightSheetConfig.autoFocus) {
            case false:
            case 'dialog':
                const activeElement = _getFocusedElementPierceShadowDom();
                // Ensure that focus is on the bottom sheet container. It's possible that a different
                // component tried to move focus while the open animation was running. See:
                // https://github.com/angular/components/issues/16215. Note that we only want to do this
                // if the focus isn't inside the bottom sheet already, because it's possible that the
                // consumer specified `autoFocus` in order to move focus themselves.
                if (activeElement !== element && !element.contains(activeElement)) {
                    element.focus();
                }
                break;
            case true:
            case 'first-tabbable':
                this._focusTrap.focusInitialElementWhenReady();
                break;
            case 'first-heading':
                this._focusByCssSelector('h1, h2, h3, h4, h5, h6, [role="heading"]');
                break;
            default:
                this._focusByCssSelector(this.rightSheetConfig.autoFocus);
                break;
        }
    }
    /** Restores focus to the element that was focused before the bottom sheet was opened. */
    _restoreFocus() {
        const toFocus = this._elementFocusedBeforeOpened;
        // We need the extra check, because IE can set the `activeElement` to null in some cases.
        if (this.rightSheetConfig.restoreFocus &&
            toFocus &&
            typeof toFocus.focus === 'function') {
            const activeElement = this._document.activeElement;
            const element = this._elementRef.nativeElement;
            // Make sure that focus is still inside the bottom sheet or is on the body (usually because a
            // non-focusable element like the backdrop was clicked) before moving it. It's possible that
            // the consumer moved it themselves before the animation was done, in which case we shouldn't
            // do anything.
            if (!activeElement || activeElement === this._document.body || activeElement === element ||
                element.contains(activeElement)) {
                toFocus.focus();
            }
        }
        if (this._focusTrap) {
            this._focusTrap.destroy();
        }
    }
    /** Saves a reference to the element that was focused before the bottom sheet was opened. */
    _savePreviouslyFocusedElement() {
        this._elementFocusedBeforeOpened = this._document
            .activeElement;
        // The `focus` method isn't available during server-side rendering.
        if (this._elementRef.nativeElement.focus) {
            this._ngZone.runOutsideAngular(() => {
                Promise.resolve().then(() => this._elementRef.nativeElement.focus());
            });
        }
    }
}
MatRightSheetContainer.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.0", ngImport: i0, type: MatRightSheetContainer, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i1.FocusTrapFactory }, { token: i1.InteractivityChecker }, { token: i0.NgZone }, { token: i2.BreakpointObserver }, { token: DOCUMENT, optional: true }, { token: MatRightSheetConfig }], target: i0.ɵɵFactoryTarget.Component });
MatRightSheetContainer.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.0", type: MatRightSheetContainer, selector: "mat-right-sheet-container", host: { attributes: { "tabindex": "-1", "role": "dialog", "aria-modal": "true" }, listeners: { "@state.start": "_onAnimationStart($event)", "@state.done": "_onAnimationDone($event)" }, properties: { "attr.aria-label": "rightSheetConfig?.ariaLabel", "@state": "_animationState" }, classAttribute: "mat-right-sheet-container" }, viewQueries: [{ propertyName: "_portalOutlet", first: true, predicate: CdkPortalOutlet, descendants: true, static: true }], usesInheritance: true, ngImport: i0, template: "<ng-template cdkPortalOutlet></ng-template>\r\n", styles: [".mat-right-sheet-container{padding:8px 16px;height:100%;width:100%;box-sizing:border-box;display:block;outline:0;overflow:auto}.cdk-high-contrast-active .mat-right-sheet-container{outline:1px solid}.cdk-high-contrast-active :host .mat-right-sheet-container{outline:1px solid}\n"], dependencies: [{ kind: "directive", type: i4.CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }], animations: [matRightSheetAnimations.rightSheetState], changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.0", ngImport: i0, type: MatRightSheetContainer, decorators: [{
            type: Component,
            args: [{ selector: 'mat-right-sheet-container', changeDetection: ChangeDetectionStrategy.Default, encapsulation: ViewEncapsulation.None, animations: [matRightSheetAnimations.rightSheetState], host: {
                        class: 'mat-right-sheet-container',
                        tabindex: '-1',
                        role: 'dialog',
                        'aria-modal': 'true',
                        '[attr.aria-label]': 'rightSheetConfig?.ariaLabel',
                        '[@state]': '_animationState',
                        '(@state.start)': '_onAnimationStart($event)',
                        '(@state.done)': '_onAnimationDone($event)',
                    }, template: "<ng-template cdkPortalOutlet></ng-template>\r\n", styles: [".mat-right-sheet-container{padding:8px 16px;height:100%;width:100%;box-sizing:border-box;display:block;outline:0;overflow:auto}.cdk-high-contrast-active .mat-right-sheet-container{outline:1px solid}.cdk-high-contrast-active :host .mat-right-sheet-container{outline:1px solid}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i1.FocusTrapFactory }, { type: i1.InteractivityChecker }, { type: i0.NgZone }, { type: i2.BreakpointObserver }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: MatRightSheetConfig }]; }, propDecorators: { _portalOutlet: [{
                type: ViewChild,
                args: [CdkPortalOutlet, { static: true }]
            }] } });

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class MatRightSheetModule {
}
MatRightSheetModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.0", ngImport: i0, type: MatRightSheetModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MatRightSheetModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.0", ngImport: i0, type: MatRightSheetModule, declarations: [MatRightSheetContainer], imports: [CommonModule, OverlayModule, MatCommonModule, PortalModule], exports: [MatRightSheetContainer, MatCommonModule] });
MatRightSheetModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.0", ngImport: i0, type: MatRightSheetModule, imports: [CommonModule, OverlayModule, MatCommonModule, PortalModule, MatCommonModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.0", ngImport: i0, type: MatRightSheetModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, OverlayModule, MatCommonModule, PortalModule],
                    exports: [MatRightSheetContainer, MatCommonModule],
                    declarations: [MatRightSheetContainer]
                }]
        }] });

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Reference to a bottom sheet dispatched from the bottom sheet service.
 */
class MatRightSheetRef {
    constructor(containerInstance, _overlayRef, 
    // @breaking-change 8.0.0 `_location` parameter to be removed.
    _location) {
        this._overlayRef = _overlayRef;
        /** Subject for notifying the user that the bottom sheet has been dismissed. */
        this._afterDismissed = new Subject();
        /** Subject for notifying the user that the bottom sheet has opened and appeared. */
        this._afterOpened = new Subject();
        this.containerInstance = containerInstance;
        this.disableClose = containerInstance.rightSheetConfig.disableClose;
        // Emit when opening animation completes
        containerInstance._animationStateChanged
            .pipe(filter((event) => event.phaseName === 'done' &&
            event.toState === 'visible'), take(1))
            .subscribe(() => {
            this._afterOpened.next();
            this._afterOpened.complete();
        });
        // Dispose overlay when closing animation is complete
        containerInstance._animationStateChanged
            .pipe(filter((event) => event.phaseName === 'done' &&
            event.toState === 'hidden'), take(1))
            .subscribe(() => {
            this._overlayRef.dispose();
            this._afterDismissed.next(this._result);
            this._afterDismissed.complete();
        });
        merge(_overlayRef.backdropClick(), _overlayRef
            .keydownEvents()
            .pipe(filter((event) => event.keyCode === ESCAPE))).subscribe(() => {
            if (!this.disableClose &&
                (event.type !== 'keydown' || !hasModifierKey(event))) {
                event.preventDefault();
                this.dismiss();
            }
        });
    }
    /**
     * Dismisses the bottom sheet.
     * @param result Data to be passed back to the bottom sheet opener.
     */
    dismiss(result) {
        if (!this._afterDismissed.closed) {
            // Transition the backdrop in parallel to the bottom sheet.
            this.containerInstance._animationStateChanged
                .pipe(filter((event) => event.phaseName === 'start'), take(1))
                .subscribe(() => this._overlayRef.detachBackdrop());
            this._result = result;
            this.containerInstance.exit();
        }
    }
    /** Gets an observable that is notified when the bottom sheet is finished closing. */
    afterDismissed() {
        return this._afterDismissed.asObservable();
    }
    /** Gets an observable that is notified when the bottom sheet has opened and appeared. */
    afterOpened() {
        return this._afterOpened.asObservable();
    }
    /**
     * Gets an observable that emits when the overlay's backdrop has been clicked.
     */
    backdropClick() {
        return this._overlayRef.backdropClick();
    }
    /**
     * Gets an observable that emits when keydown events are targeted on the overlay.
     */
    keydownEvents() {
        return this._overlayRef.keydownEvents();
    }
    updateWidth(width) {
        this._overlayRef.updateSize({ width });
    }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Injection token that can be used to specify default bottom sheet options. */
const MAT_RIGHT_SHEET_DEFAULT_OPTIONS = new InjectionToken('mat-right-sheet-default-options');
/**
 * Service to trigger Material Design right sheets.
 */
class MatRightSheet {
    constructor(_overlay, _injector, _parentRightSheet, _location, _defaultOptions) {
        this._overlay = _overlay;
        this._injector = _injector;
        this._parentRightSheet = _parentRightSheet;
        this._location = _location;
        this._defaultOptions = _defaultOptions;
        this._rightSheetRefAtThisLevel = null;
    }
    /** Reference to the currently opened bottom sheet. */
    get _openedRightSheetRef() {
        const parent = this._parentRightSheet;
        return parent
            ? parent._openedRightSheetRef
            : this._rightSheetRefAtThisLevel;
    }
    set _openedRightSheetRef(value) {
        if (this._parentRightSheet) {
            this._parentRightSheet._openedRightSheetRef = value;
        }
        else {
            this._rightSheetRefAtThisLevel = value;
        }
    }
    open(componentOrTemplateRef, config) {
        const _config = _applyConfigDefaults(this._defaultOptions || new MatRightSheetConfig(), config);
        const overlayRef = this._createOverlay(_config);
        const container = this._attachContainer(overlayRef, _config);
        const ref = new MatRightSheetRef(container, overlayRef, this._location);
        if (componentOrTemplateRef instanceof TemplateRef) {
            container.attachTemplatePortal(new TemplatePortal(componentOrTemplateRef, null, {
                $implicit: _config.data,
                rightSheetRef: ref,
            }));
        }
        else {
            const portal = new ComponentPortal(componentOrTemplateRef, undefined, this._createInjector(_config, ref));
            const contentRef = container.attachComponentPortal(portal);
            ref.instance = contentRef.instance;
        }
        // When the bottom sheet is dismissed, clear the reference to it.
        ref.afterDismissed().subscribe(() => {
            // Clear the bottom sheet ref if it hasn't already been replaced by a newer one.
            if (this._openedRightSheetRef == ref) {
                this._openedRightSheetRef = null;
            }
        });
        if (this._openedRightSheetRef) {
            // If a bottom sheet is already in view, dismiss it and enter the
            // new bottom sheet after exit animation is complete.
            this._openedRightSheetRef
                .afterDismissed()
                .subscribe(() => ref.containerInstance.enter());
            this._openedRightSheetRef.dismiss();
        }
        else {
            // If no bottom sheet is in view, enter the new bottom sheet.
            ref.containerInstance.enter();
        }
        this._openedRightSheetRef = ref;
        return ref;
    }
    /**
     * Dismisses the currently-visible bottom sheet.
     */
    dismiss() {
        if (this._openedRightSheetRef) {
            this._openedRightSheetRef.dismiss();
        }
    }
    ngOnDestroy() {
        if (this._rightSheetRefAtThisLevel) {
            this._rightSheetRefAtThisLevel.dismiss();
        }
    }
    /**
     * Attaches the bottom sheet container component to the overlay.
     */
    _attachContainer(overlayRef, config) {
        const userInjector = config &&
            config.viewContainerRef &&
            config.viewContainerRef.injector;
        const injector = new PortalInjector(userInjector || this._injector, new WeakMap([[MatRightSheetConfig, config]]));
        const containerPortal = new ComponentPortal(MatRightSheetContainer, config.viewContainerRef, injector);
        const containerRef = overlayRef.attach(containerPortal);
        return containerRef.instance;
    }
    /**
     * Creates a new overlay and places it in the correct location.
     * @param config The user-specified bottom sheet config.
     */
    _createOverlay(config) {
        const overlayConfig = new OverlayConfig({
            direction: config.direction,
            hasBackdrop: config.hasBackdrop,
            disposeOnNavigation: config.closeOnNavigation,
            width: config.width || '420px',
            height: '100vh',
            scrollStrategy: config.scrollStrategy || this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay
                .position()
                .global()
                .top('0px')
                .right('0px')
                .bottom('0px'),
        });
        if (config.backdropClass) {
            overlayConfig.backdropClass = config.backdropClass;
        }
        return this._overlay.create(overlayConfig);
    }
    /**
     * Creates an injector to be used inside of a bottom sheet component.
     * @param config Config that was used to create the bottom sheet.
     * @param rightSheetRef Reference to the bottom sheet.
     */
    _createInjector(config, rightSheetRef) {
        const userInjector = config &&
            config.viewContainerRef &&
            config.viewContainerRef.injector;
        const injectionTokens = new WeakMap([
            [MatRightSheetRef, rightSheetRef],
            [MAT_RIGHT_SHEET_DATA, config.data],
        ]);
        if (config.direction &&
            (!userInjector ||
                !userInjector.get(Directionality, null))) {
            injectionTokens.set(Directionality, {
                value: config.direction,
                change: of(),
            });
        }
        return new PortalInjector(userInjector || this._injector, injectionTokens);
    }
}
MatRightSheet.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.0", ngImport: i0, type: MatRightSheet, deps: [{ token: i1$1.Overlay }, { token: i0.Injector }, { token: MatRightSheet, optional: true, skipSelf: true }, { token: i2$1.Location, optional: true }, { token: MAT_RIGHT_SHEET_DEFAULT_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
MatRightSheet.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.0", ngImport: i0, type: MatRightSheet, providedIn: MatRightSheetModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.0", ngImport: i0, type: MatRightSheet, decorators: [{
            type: Injectable,
            args: [{ providedIn: MatRightSheetModule }]
        }], ctorParameters: function () { return [{ type: i1$1.Overlay }, { type: i0.Injector }, { type: MatRightSheet, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }] }, { type: i2$1.Location, decorators: [{
                    type: Optional
                }] }, { type: MatRightSheetConfig, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_RIGHT_SHEET_DEFAULT_OPTIONS]
                }] }]; } });
/**
 * Applies default options to the bottom sheet config.
 * @param defaults Object containing the default values to which to fall back.
 * @param config The configuration to which the defaults will be applied.
 * @returns The new configuration object with defaults applied.
 */
function _applyConfigDefaults(defaults, config) {
    return { ...defaults, ...config };
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Generated bundle index. Do not edit.
 */

export { MAT_RIGHT_SHEET_DATA, MAT_RIGHT_SHEET_DEFAULT_OPTIONS, MatRightSheet, MatRightSheetConfig, MatRightSheetContainer, MatRightSheetModule, MatRightSheetRef, matRightSheetAnimations };
//# sourceMappingURL=mat-right-sheet.mjs.map
