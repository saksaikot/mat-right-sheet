/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationEvent } from '@angular/animations';
import { FocusTrapFactory, InteractivityChecker } from '@angular/cdk/a11y';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BasePortalOutlet, ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { ChangeDetectorRef, ComponentRef, ElementRef, EmbeddedViewRef, EventEmitter, NgZone, OnDestroy } from '@angular/core';
import { MatRightSheetConfig } from './right-sheet.config';
import * as i0 from "@angular/core";
/**
 * Internal component that wraps user-provided bottom sheet content.
 * @docs-private
 */
export declare class MatRightSheetContainer extends BasePortalOutlet implements OnDestroy {
    private readonly _elementRef;
    private readonly _changeDetectorRef;
    private readonly _focusTrapFactory;
    private readonly _interactivityChecker;
    private readonly _ngZone;
    /**
     * The right sheet configuration.
     */
    rightSheetConfig: MatRightSheetConfig;
    /** Emits whenever the state of the animation changes. */
    _animationStateChanged: EventEmitter<AnimationEvent>;
    /** The state of the bottom sheet animations. */
    _animationState: 'void' | 'visible' | 'hidden';
    private readonly _breakpointSubscription;
    /** The portal outlet inside of this container into which the content will be loaded. */
    private readonly _portalOutlet;
    /** The class that traps and manages focus within the bottom sheet. */
    private _focusTrap;
    /** Element that was focused before the bottom sheet was opened. */
    private _elementFocusedBeforeOpened;
    /** Server-side rendering-compatible reference to the global document object. */
    private readonly _document;
    /** Whether the component has been destroyed. */
    private _destroyed;
    constructor(_elementRef: ElementRef<HTMLElement>, _changeDetectorRef: ChangeDetectorRef, _focusTrapFactory: FocusTrapFactory, _interactivityChecker: InteractivityChecker, _ngZone: NgZone, breakpointObserver: BreakpointObserver, document: any, 
    /**
     * The right sheet configuration.
     */
    rightSheetConfig: MatRightSheetConfig);
    /** Attach a component portal as content to this bottom sheet container. */
    attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T>;
    /** Attach a template portal as content to this bottom sheet container. */
    attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C>;
    /** Begin animation of bottom sheet entrance into view. */
    enter(): void;
    /** Begin animation of the bottom sheet exiting from view. */
    exit(): void;
    ngOnDestroy(): void;
    _onAnimationDone(event: AnimationEvent): void;
    _onAnimationStart(event: AnimationEvent): void;
    private _toggleClass;
    private _validatePortalAttached;
    private _setPanelClass;
    /**
       * Focuses the provided element. If the element is not focusable, it will add a tabIndex
       * attribute to forcefully focus it. The attribute is removed after focus is moved.
       * @param element The element to focus.
       */
    private _forceFocus;
    /**
     * Focuses the first element that matches the given selector within the focus trap.
     * @param selector The CSS selector for the element to set focus to.
     */
    private _focusByCssSelector;
    /**
     * Moves the focus inside the focus trap. When autoFocus is not set to 'bottom-sheet',
     * if focus cannot be moved then focus will go to the bottom sheet container.
     */
    private _trapFocus;
    /** Restores focus to the element that was focused before the bottom sheet was opened. */
    private _restoreFocus;
    /** Saves a reference to the element that was focused before the bottom sheet was opened. */
    private _savePreviouslyFocusedElement;
    static ??fac: i0.????FactoryDeclaration<MatRightSheetContainer, [null, null, null, null, null, null, { optional: true; }, null]>;
    static ??cmp: i0.????ComponentDeclaration<MatRightSheetContainer, "mat-right-sheet-container", never, {}, {}, never, never, false>;
}
