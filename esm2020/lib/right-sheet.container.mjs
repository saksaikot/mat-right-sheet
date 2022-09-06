import { coerceArray } from '@angular/cdk/coercion';
import { Breakpoints } from '@angular/cdk/layout';
import { _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { BasePortalOutlet, CdkPortalOutlet, } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Optional, ViewChild, ViewEncapsulation, } from '@angular/core';
import { matRightSheetAnimations } from './right-sheet.animations';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/a11y";
import * as i2 from "@angular/cdk/layout";
import * as i3 from "./right-sheet.config";
import * as i4 from "@angular/cdk/portal";
// TODO(crisbeto): consolidate some logic between this, MatDialog and MatSnackBar
/**
 * Internal component that wraps user-provided bottom sheet content.
 * @docs-private
 */
// tslint:disable-next-line: component-class-suffix
export class MatRightSheetContainer extends BasePortalOutlet {
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
MatRightSheetContainer.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.0", ngImport: i0, type: MatRightSheetContainer, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i1.FocusTrapFactory }, { token: i1.InteractivityChecker }, { token: i0.NgZone }, { token: i2.BreakpointObserver }, { token: DOCUMENT, optional: true }, { token: i3.MatRightSheetConfig }], target: i0.ɵɵFactoryTarget.Component });
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
                }] }, { type: i3.MatRightSheetConfig }]; }, propDecorators: { _portalOutlet: [{
                type: ViewChild,
                args: [CdkPortalOutlet, { static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlnaHQtc2hlZXQuY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvcmlnaHQtc2hlZXQvc3JjL2xpYi9yaWdodC1zaGVldC5jb250YWluZXIudHMiLCIuLi8uLi8uLi8uLi9wcm9qZWN0cy9yaWdodC1zaGVldC9zcmMvbGliL3JpZ2h0LXNoZWV0LmNvbnRhaW5lci5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVVBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNwRCxPQUFPLEVBQXNCLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3RFLE9BQU8sRUFBRSxpQ0FBaUMsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxlQUFlLEdBQW9DLE1BQU0scUJBQXFCLENBQUM7QUFDMUcsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzNDLE9BQU8sRUFDTCx1QkFBdUIsRUFFdkIsU0FBUyxFQUlULFlBQVksRUFDWixNQUFNLEVBR04sUUFBUSxFQUNSLFNBQVMsRUFDVCxpQkFBaUIsR0FDbEIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sMEJBQTBCLENBQUM7Ozs7OztBQUduRSxpRkFBaUY7QUFFakY7OztHQUdHO0FBMEJILG1EQUFtRDtBQUNuRCxNQUFNLE9BQU8sc0JBQXVCLFNBQVEsZ0JBQWdCO0lBeUIxRCxZQUNtQixXQUFvQyxFQUNwQyxrQkFBcUMsRUFDckMsaUJBQW1DLEVBQ25DLHFCQUEyQyxFQUMzQyxPQUFlLEVBQ2hDLGtCQUFzQyxFQUNSLFFBQWE7SUFDM0M7O09BRUc7SUFDSSxnQkFBcUM7UUFFNUMsS0FBSyxFQUFFLENBQUM7UUFaUyxnQkFBVyxHQUFYLFdBQVcsQ0FBeUI7UUFDcEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtRQUNyQyxz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QUMsYUFBYSxDQUFDLEtBQUssRUFBRTtZQUN4QyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtnQkFDbEMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZFLENBQUMsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDOzttSEF0UFUsc0JBQXNCLHlNQWdDWCxRQUFRO3VHQWhDbkIsc0JBQXNCLHViQVV0QixlQUFlLHFGQzVFNUIsaURBQ0Esb2VEbURjLENBQUMsdUJBQXVCLENBQUMsZUFBZSxDQUFDOzJGQWMxQyxzQkFBc0I7a0JBMUJsQyxTQUFTOytCQUVFLDJCQUEyQixtQkFPcEIsdUJBQXVCLENBQUMsT0FBTyxpQkFFakMsaUJBQWlCLENBQUMsSUFBSSxjQUN6QixDQUFDLHVCQUF1QixDQUFDLGVBQWUsQ0FBQyxRQUUvQzt3QkFDSixLQUFLLEVBQUUsMkJBQTJCO3dCQUNsQyxRQUFRLEVBQUUsSUFBSTt3QkFDZCxJQUFJLEVBQUUsUUFBUTt3QkFDZCxZQUFZLEVBQUUsTUFBTTt3QkFDcEIsbUJBQW1CLEVBQUUsNkJBQTZCO3dCQUNsRCxVQUFVLEVBQUUsaUJBQWlCO3dCQUM3QixnQkFBZ0IsRUFBRSwyQkFBMkI7d0JBQzdDLGVBQWUsRUFBRSwwQkFBMEI7cUJBQzVDOzswQkFtQ0UsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxRQUFROzhFQXJCYixhQUFhO3NCQUQ3QixTQUFTO3VCQUFDLGVBQWUsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IEFuaW1hdGlvbkV2ZW50IH0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XHJcbmltcG9ydCB7IEZvY3VzVHJhcCwgRm9jdXNUcmFwRmFjdG9yeSwgSW50ZXJhY3Rpdml0eUNoZWNrZXIgfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XHJcbmltcG9ydCB7IGNvZXJjZUFycmF5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcclxuaW1wb3J0IHsgQnJlYWtwb2ludE9ic2VydmVyLCBCcmVha3BvaW50cyB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9sYXlvdXQnO1xyXG5pbXBvcnQgeyBfZ2V0Rm9jdXNlZEVsZW1lbnRQaWVyY2VTaGFkb3dEb20gfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xyXG5pbXBvcnQgeyBCYXNlUG9ydGFsT3V0bGV0LCBDZGtQb3J0YWxPdXRsZXQsIENvbXBvbmVudFBvcnRhbCwgVGVtcGxhdGVQb3J0YWwsIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XHJcbmltcG9ydCB7IERPQ1VNRU5UIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHtcclxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcclxuICBDaGFuZ2VEZXRlY3RvclJlZixcclxuICBDb21wb25lbnQsXHJcbiAgQ29tcG9uZW50UmVmLFxyXG4gIEVsZW1lbnRSZWYsXHJcbiAgRW1iZWRkZWRWaWV3UmVmLFxyXG4gIEV2ZW50RW1pdHRlcixcclxuICBJbmplY3QsXHJcbiAgTmdab25lLFxyXG4gIE9uRGVzdHJveSxcclxuICBPcHRpb25hbCxcclxuICBWaWV3Q2hpbGQsXHJcbiAgVmlld0VuY2Fwc3VsYXRpb24sXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBtYXRSaWdodFNoZWV0QW5pbWF0aW9ucyB9IGZyb20gJy4vcmlnaHQtc2hlZXQuYW5pbWF0aW9ucyc7XHJcbmltcG9ydCB7IE1hdFJpZ2h0U2hlZXRDb25maWcgfSBmcm9tICcuL3JpZ2h0LXNoZWV0LmNvbmZpZyc7XHJcblxyXG4vLyBUT0RPKGNyaXNiZXRvKTogY29uc29saWRhdGUgc29tZSBsb2dpYyBiZXR3ZWVuIHRoaXMsIE1hdERpYWxvZyBhbmQgTWF0U25hY2tCYXJcclxuXHJcbi8qKlxyXG4gKiBJbnRlcm5hbCBjb21wb25lbnQgdGhhdCB3cmFwcyB1c2VyLXByb3ZpZGVkIGJvdHRvbSBzaGVldCBjb250ZW50LlxyXG4gKiBAZG9jcy1wcml2YXRlXHJcbiAqL1xyXG5AQ29tcG9uZW50KHtcclxuICAvLyAgICBtb2R1bGVJZDogbW9kdWxlLmlkLFxyXG4gIHNlbGVjdG9yOiAnbWF0LXJpZ2h0LXNoZWV0LWNvbnRhaW5lcicsXHJcbiAgdGVtcGxhdGVVcmw6ICcuL3JpZ2h0LXNoZWV0LmNvbnRhaW5lci5odG1sJyxcclxuICBzdHlsZVVybHM6IFsnLi9yaWdodC1zaGVldC5jb250YWluZXIuc2NzcyddLFxyXG4gIC8vIEluIEl2eSBlbWJlZGRlZCB2aWV3cyB3aWxsIGJlIGNoYW5nZSBkZXRlY3RlZCBmcm9tIHRoZWlyIGRlY2xhcmF0aW9uIHBsYWNlLCByYXRoZXIgdGhhbiB3aGVyZVxyXG4gIC8vIHRoZXkgd2VyZSBzdGFtcGVkIG91dC4gVGhpcyBtZWFucyB0aGF0IHdlIGNhbid0IGhhdmUgdGhlIGJvdHRvbSBzaGVldCBjb250YWluZXIgYmUgT25QdXNoLFxyXG4gIC8vIGJlY2F1c2UgaXQgbWlnaHQgY2F1c2UgdGhlIHNoZWV0cyB0aGF0IHdlcmUgb3BlbmVkIGZyb20gYSB0ZW1wbGF0ZSBub3QgdG8gYmUgb3V0IG9mIGRhdGUuXHJcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnZhbGlkYXRlLWRlY29yYXRvcnNcclxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQsXHJcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiB1c2Utdmlldy1lbmNhcHN1bGF0aW9uXHJcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcclxuICBhbmltYXRpb25zOiBbbWF0UmlnaHRTaGVldEFuaW1hdGlvbnMucmlnaHRTaGVldFN0YXRlXSxcclxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IHVzZS1ob3N0LXByb3BlcnR5LWRlY29yYXRvclxyXG4gIGhvc3Q6IHtcclxuICAgIGNsYXNzOiAnbWF0LXJpZ2h0LXNoZWV0LWNvbnRhaW5lcicsXHJcbiAgICB0YWJpbmRleDogJy0xJyxcclxuICAgIHJvbGU6ICdkaWFsb2cnLFxyXG4gICAgJ2FyaWEtbW9kYWwnOiAndHJ1ZScsXHJcbiAgICAnW2F0dHIuYXJpYS1sYWJlbF0nOiAncmlnaHRTaGVldENvbmZpZz8uYXJpYUxhYmVsJyxcclxuICAgICdbQHN0YXRlXSc6ICdfYW5pbWF0aW9uU3RhdGUnLFxyXG4gICAgJyhAc3RhdGUuc3RhcnQpJzogJ19vbkFuaW1hdGlvblN0YXJ0KCRldmVudCknLFxyXG4gICAgJyhAc3RhdGUuZG9uZSknOiAnX29uQW5pbWF0aW9uRG9uZSgkZXZlbnQpJyxcclxuICB9LFxyXG59KVxyXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IGNvbXBvbmVudC1jbGFzcy1zdWZmaXhcclxuZXhwb3J0IGNsYXNzIE1hdFJpZ2h0U2hlZXRDb250YWluZXIgZXh0ZW5kcyBCYXNlUG9ydGFsT3V0bGV0XHJcbiAgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xyXG4gIC8qKiBFbWl0cyB3aGVuZXZlciB0aGUgc3RhdGUgb2YgdGhlIGFuaW1hdGlvbiBjaGFuZ2VzLiAqL1xyXG4gIHB1YmxpYyBfYW5pbWF0aW9uU3RhdGVDaGFuZ2VkID0gbmV3IEV2ZW50RW1pdHRlcjxBbmltYXRpb25FdmVudD4oKTtcclxuXHJcbiAgLyoqIFRoZSBzdGF0ZSBvZiB0aGUgYm90dG9tIHNoZWV0IGFuaW1hdGlvbnMuICovXHJcbiAgcHVibGljIF9hbmltYXRpb25TdGF0ZTogJ3ZvaWQnIHwgJ3Zpc2libGUnIHwgJ2hpZGRlbicgPSAndm9pZCc7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBfYnJlYWtwb2ludFN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xyXG5cclxuICAvKiogVGhlIHBvcnRhbCBvdXRsZXQgaW5zaWRlIG9mIHRoaXMgY29udGFpbmVyIGludG8gd2hpY2ggdGhlIGNvbnRlbnQgd2lsbCBiZSBsb2FkZWQuICovXHJcbiAgQFZpZXdDaGlsZChDZGtQb3J0YWxPdXRsZXQsIHtzdGF0aWM6IHRydWV9KVxyXG4gIHByaXZhdGUgcmVhZG9ubHkgX3BvcnRhbE91dGxldDogQ2RrUG9ydGFsT3V0bGV0O1xyXG5cclxuICAvKiogVGhlIGNsYXNzIHRoYXQgdHJhcHMgYW5kIG1hbmFnZXMgZm9jdXMgd2l0aGluIHRoZSBib3R0b20gc2hlZXQuICovXHJcbiAgcHJpdmF0ZSBfZm9jdXNUcmFwOiBGb2N1c1RyYXA7XHJcblxyXG4gIC8qKiBFbGVtZW50IHRoYXQgd2FzIGZvY3VzZWQgYmVmb3JlIHRoZSBib3R0b20gc2hlZXQgd2FzIG9wZW5lZC4gKi9cclxuICBwcml2YXRlIF9lbGVtZW50Rm9jdXNlZEJlZm9yZU9wZW5lZDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgLyoqIFNlcnZlci1zaWRlIHJlbmRlcmluZy1jb21wYXRpYmxlIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIGRvY3VtZW50IG9iamVjdC4gKi9cclxuICBwcml2YXRlIHJlYWRvbmx5IF9kb2N1bWVudDogRG9jdW1lbnQ7XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRoZSBjb21wb25lbnQgaGFzIGJlZW4gZGVzdHJveWVkLiAqL1xyXG4gIHByaXZhdGUgX2Rlc3Ryb3llZDogYm9vbGVhbjtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2ZvY3VzVHJhcEZhY3Rvcnk6IEZvY3VzVHJhcEZhY3RvcnksXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9pbnRlcmFjdGl2aXR5Q2hlY2tlcjogSW50ZXJhY3Rpdml0eUNoZWNrZXIsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9uZ1pvbmU6IE5nWm9uZSxcclxuICAgIGJyZWFrcG9pbnRPYnNlcnZlcjogQnJlYWtwb2ludE9ic2VydmVyLFxyXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChET0NVTUVOVCkgZG9jdW1lbnQ6IGFueSxcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHJpZ2h0IHNoZWV0IGNvbmZpZ3VyYXRpb24uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByaWdodFNoZWV0Q29uZmlnOiBNYXRSaWdodFNoZWV0Q29uZmlnLFxyXG4gICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICB0aGlzLl9kb2N1bWVudCA9IGRvY3VtZW50IGFzIERvY3VtZW50O1xyXG4gICAgdGhpcy5fYnJlYWtwb2ludFN1YnNjcmlwdGlvbiA9IGJyZWFrcG9pbnRPYnNlcnZlclxyXG4gICAgICAub2JzZXJ2ZShbXHJcbiAgICAgICAgQnJlYWtwb2ludHMuTWVkaXVtLFxyXG4gICAgICAgIEJyZWFrcG9pbnRzLkxhcmdlLFxyXG4gICAgICAgIEJyZWFrcG9pbnRzLlhMYXJnZSxcclxuICAgICAgXSlcclxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5fdG9nZ2xlQ2xhc3MoXHJcbiAgICAgICAgICAnbWF0LXJpZ2h0LXNoZWV0LWNvbnRhaW5lci1tZWRpdW0nLFxyXG4gICAgICAgICAgYnJlYWtwb2ludE9ic2VydmVyLmlzTWF0Y2hlZChCcmVha3BvaW50cy5NZWRpdW0pLFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdGhpcy5fdG9nZ2xlQ2xhc3MoXHJcbiAgICAgICAgICAnbWF0LXJpZ2h0LXNoZWV0LWNvbnRhaW5lci1sYXJnZScsXHJcbiAgICAgICAgICBicmVha3BvaW50T2JzZXJ2ZXIuaXNNYXRjaGVkKEJyZWFrcG9pbnRzLkxhcmdlKSxcclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMuX3RvZ2dsZUNsYXNzKFxyXG4gICAgICAgICAgJ21hdC1yaWdodC1zaGVldC1jb250YWluZXIteGxhcmdlJyxcclxuICAgICAgICAgIGJyZWFrcG9pbnRPYnNlcnZlci5pc01hdGNoZWQoQnJlYWtwb2ludHMuWExhcmdlKSxcclxuICAgICAgICApO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKiBBdHRhY2ggYSBjb21wb25lbnQgcG9ydGFsIGFzIGNvbnRlbnQgdG8gdGhpcyBib3R0b20gc2hlZXQgY29udGFpbmVyLiAqL1xyXG4gIHB1YmxpYyBhdHRhY2hDb21wb25lbnRQb3J0YWw8VD4oXHJcbiAgICBwb3J0YWw6IENvbXBvbmVudFBvcnRhbDxUPixcclxuICApOiBDb21wb25lbnRSZWY8VD4ge1xyXG4gICAgdGhpcy5fdmFsaWRhdGVQb3J0YWxBdHRhY2hlZCgpO1xyXG4gICAgdGhpcy5fc2V0UGFuZWxDbGFzcygpO1xyXG4gICAgdGhpcy5fc2F2ZVByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCgpO1xyXG4gICAgcmV0dXJuIHRoaXMuX3BvcnRhbE91dGxldC5hdHRhY2hDb21wb25lbnRQb3J0YWwocG9ydGFsKTtcclxuICB9XHJcblxyXG4gIC8qKiBBdHRhY2ggYSB0ZW1wbGF0ZSBwb3J0YWwgYXMgY29udGVudCB0byB0aGlzIGJvdHRvbSBzaGVldCBjb250YWluZXIuICovXHJcbiAgcHVibGljIGF0dGFjaFRlbXBsYXRlUG9ydGFsPEM+KFxyXG4gICAgcG9ydGFsOiBUZW1wbGF0ZVBvcnRhbDxDPixcclxuICApOiBFbWJlZGRlZFZpZXdSZWY8Qz4ge1xyXG4gICAgdGhpcy5fdmFsaWRhdGVQb3J0YWxBdHRhY2hlZCgpO1xyXG4gICAgdGhpcy5fc2V0UGFuZWxDbGFzcygpO1xyXG4gICAgdGhpcy5fc2F2ZVByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCgpO1xyXG4gICAgcmV0dXJuIHRoaXMuX3BvcnRhbE91dGxldC5hdHRhY2hUZW1wbGF0ZVBvcnRhbChwb3J0YWwpO1xyXG4gIH1cclxuXHJcbiAgLyoqIEJlZ2luIGFuaW1hdGlvbiBvZiBib3R0b20gc2hlZXQgZW50cmFuY2UgaW50byB2aWV3LiAqL1xyXG4gIHB1YmxpYyBlbnRlcigpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fZGVzdHJveWVkKSB7XHJcbiAgICAgIHRoaXMuX2FuaW1hdGlvblN0YXRlID0gJ3Zpc2libGUnO1xyXG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogQmVnaW4gYW5pbWF0aW9uIG9mIHRoZSBib3R0b20gc2hlZXQgZXhpdGluZyBmcm9tIHZpZXcuICovXHJcbiAgcHVibGljIGV4aXQoKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuX2Rlc3Ryb3llZCkge1xyXG4gICAgICB0aGlzLl9hbmltYXRpb25TdGF0ZSA9ICdoaWRkZW4nO1xyXG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBuZ09uRGVzdHJveSgpIHtcclxuICAgIHRoaXMuX2JyZWFrcG9pbnRTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgX29uQW5pbWF0aW9uRG9uZShldmVudDogQW5pbWF0aW9uRXZlbnQpIHtcclxuICAgIGlmIChldmVudC50b1N0YXRlID09PSAnaGlkZGVuJykge1xyXG4gICAgICB0aGlzLl9yZXN0b3JlRm9jdXMoKTtcclxuICAgIH0gZWxzZSBpZiAoZXZlbnQudG9TdGF0ZSA9PT0gJ3Zpc2libGUnKSB7XHJcbiAgICAgIHRoaXMuX3RyYXBGb2N1cygpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2FuaW1hdGlvblN0YXRlQ2hhbmdlZC5lbWl0KGV2ZW50KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBfb25BbmltYXRpb25TdGFydChldmVudDogQW5pbWF0aW9uRXZlbnQpIHtcclxuICAgIHRoaXMuX2FuaW1hdGlvblN0YXRlQ2hhbmdlZC5lbWl0KGV2ZW50KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX3RvZ2dsZUNsYXNzKGNzc0NsYXNzOiBzdHJpbmcsIGFkZDogYm9vbGVhbikge1xyXG4gICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoY3NzQ2xhc3MsIGFkZCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF92YWxpZGF0ZVBvcnRhbEF0dGFjaGVkKCkge1xyXG4gICAgaWYgKHRoaXMuX3BvcnRhbE91dGxldC5oYXNBdHRhY2hlZCgpKSB7XHJcbiAgICAgIHRocm93IEVycm9yKFxyXG4gICAgICAgICdBdHRlbXB0aW5nIHRvIGF0dGFjaCBib3R0b20gc2hlZXQgY29udGVudCBhZnRlciBjb250ZW50IGlzIGFscmVhZHkgYXR0YWNoZWQnLFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfc2V0UGFuZWxDbGFzcygpIHtcclxuICAgIGNvbnN0IGVsZW1lbnQ6IEhUTUxFbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xyXG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKC4uLmNvZXJjZUFycmF5KHRoaXMucmlnaHRTaGVldENvbmZpZy5wYW5lbENsYXNzIHx8IFtdKSk7XHJcbiAgfVxyXG5cclxuLyoqXHJcbiAgICogRm9jdXNlcyB0aGUgcHJvdmlkZWQgZWxlbWVudC4gSWYgdGhlIGVsZW1lbnQgaXMgbm90IGZvY3VzYWJsZSwgaXQgd2lsbCBhZGQgYSB0YWJJbmRleFxyXG4gICAqIGF0dHJpYnV0ZSB0byBmb3JjZWZ1bGx5IGZvY3VzIGl0LiBUaGUgYXR0cmlidXRlIGlzIHJlbW92ZWQgYWZ0ZXIgZm9jdXMgaXMgbW92ZWQuXHJcbiAgICogQHBhcmFtIGVsZW1lbnQgVGhlIGVsZW1lbnQgdG8gZm9jdXMuXHJcbiAgICovXHJcbiBwcml2YXRlIF9mb3JjZUZvY3VzKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBvcHRpb25zPzogRm9jdXNPcHRpb25zKSB7XHJcbiAgaWYgKCF0aGlzLl9pbnRlcmFjdGl2aXR5Q2hlY2tlci5pc0ZvY3VzYWJsZShlbGVtZW50KSkge1xyXG4gICAgZWxlbWVudC50YWJJbmRleCA9IC0xO1xyXG4gICAgLy8gVGhlIHRhYmluZGV4IGF0dHJpYnV0ZSBzaG91bGQgYmUgcmVtb3ZlZCB0byBhdm9pZCBuYXZpZ2F0aW5nIHRvIHRoYXQgZWxlbWVudCBhZ2FpblxyXG4gICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT4gZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4JykpO1xyXG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsICgpID0+IGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBlbGVtZW50LmZvY3VzKG9wdGlvbnMpO1xyXG59XHJcblxyXG4gIC8qKlxyXG4gICAqIEZvY3VzZXMgdGhlIGZpcnN0IGVsZW1lbnQgdGhhdCBtYXRjaGVzIHRoZSBnaXZlbiBzZWxlY3RvciB3aXRoaW4gdGhlIGZvY3VzIHRyYXAuXHJcbiAgICogQHBhcmFtIHNlbGVjdG9yIFRoZSBDU1Mgc2VsZWN0b3IgZm9yIHRoZSBlbGVtZW50IHRvIHNldCBmb2N1cyB0by5cclxuICAgKi9cclxuICAgcHJpdmF0ZSBfZm9jdXNCeUNzc1NlbGVjdG9yKHNlbGVjdG9yOiBzdHJpbmcsIG9wdGlvbnM/OiBGb2N1c09wdGlvbnMpIHtcclxuICAgIGxldCBlbGVtZW50VG9Gb2N1cyA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICBzZWxlY3RvcixcclxuICAgICkgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xyXG4gICAgaWYgKGVsZW1lbnRUb0ZvY3VzKSB7XHJcbiAgICAgIHRoaXMuX2ZvcmNlRm9jdXMoZWxlbWVudFRvRm9jdXMsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW92ZXMgdGhlIGZvY3VzIGluc2lkZSB0aGUgZm9jdXMgdHJhcC4gV2hlbiBhdXRvRm9jdXMgaXMgbm90IHNldCB0byAnYm90dG9tLXNoZWV0JyxcclxuICAgKiBpZiBmb2N1cyBjYW5ub3QgYmUgbW92ZWQgdGhlbiBmb2N1cyB3aWxsIGdvIHRvIHRoZSBib3R0b20gc2hlZXQgY29udGFpbmVyLlxyXG4gICAqL1xyXG4gICBwcml2YXRlIF90cmFwRm9jdXMoKSB7XHJcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xyXG5cclxuICAgIGlmICghdGhpcy5fZm9jdXNUcmFwKSB7XHJcbiAgICAgIHRoaXMuX2ZvY3VzVHJhcCA9IHRoaXMuX2ZvY3VzVHJhcEZhY3RvcnkuY3JlYXRlKGVsZW1lbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHdlcmUgdG8gYXR0ZW1wdCB0byBmb2N1cyBpbW1lZGlhdGVseSwgdGhlbiB0aGUgY29udGVudCBvZiB0aGUgYm90dG9tIHNoZWV0IHdvdWxkIG5vdFxyXG4gICAgLy8geWV0IGJlIHJlYWR5IGluIGluc3RhbmNlcyB3aGVyZSBjaGFuZ2UgZGV0ZWN0aW9uIGhhcyB0byBydW4gZmlyc3QuIFRvIGRlYWwgd2l0aCB0aGlzLFxyXG4gICAgLy8gd2Ugc2ltcGx5IHdhaXQgZm9yIHRoZSBtaWNyb3Rhc2sgcXVldWUgdG8gYmUgZW1wdHkgd2hlbiBzZXR0aW5nIGZvY3VzIHdoZW4gYXV0b0ZvY3VzXHJcbiAgICAvLyBpc24ndCBzZXQgdG8gYm90dG9tIHNoZWV0LiBJZiB0aGUgZWxlbWVudCBpbnNpZGUgdGhlIGJvdHRvbSBzaGVldCBjYW4ndCBiZSBmb2N1c2VkLFxyXG4gICAgLy8gdGhlbiB0aGUgY29udGFpbmVyIGlzIGZvY3VzZWQgc28gdGhlIHVzZXIgY2FuJ3QgdGFiIGludG8gb3RoZXIgZWxlbWVudHMgYmVoaW5kIGl0LlxyXG4gICAgc3dpdGNoICh0aGlzLnJpZ2h0U2hlZXRDb25maWcuYXV0b0ZvY3VzKSB7XHJcbiAgICAgIGNhc2UgZmFsc2U6XHJcbiAgICAgIGNhc2UgJ2RpYWxvZyc6XHJcbiAgICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IF9nZXRGb2N1c2VkRWxlbWVudFBpZXJjZVNoYWRvd0RvbSgpO1xyXG4gICAgICAgIC8vIEVuc3VyZSB0aGF0IGZvY3VzIGlzIG9uIHRoZSBib3R0b20gc2hlZXQgY29udGFpbmVyLiBJdCdzIHBvc3NpYmxlIHRoYXQgYSBkaWZmZXJlbnRcclxuICAgICAgICAvLyBjb21wb25lbnQgdHJpZWQgdG8gbW92ZSBmb2N1cyB3aGlsZSB0aGUgb3BlbiBhbmltYXRpb24gd2FzIHJ1bm5pbmcuIFNlZTpcclxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL2lzc3Vlcy8xNjIxNS4gTm90ZSB0aGF0IHdlIG9ubHkgd2FudCB0byBkbyB0aGlzXHJcbiAgICAgICAgLy8gaWYgdGhlIGZvY3VzIGlzbid0IGluc2lkZSB0aGUgYm90dG9tIHNoZWV0IGFscmVhZHksIGJlY2F1c2UgaXQncyBwb3NzaWJsZSB0aGF0IHRoZVxyXG4gICAgICAgIC8vIGNvbnN1bWVyIHNwZWNpZmllZCBgYXV0b0ZvY3VzYCBpbiBvcmRlciB0byBtb3ZlIGZvY3VzIHRoZW1zZWx2ZXMuXHJcbiAgICAgICAgaWYgKGFjdGl2ZUVsZW1lbnQgIT09IGVsZW1lbnQgJiYgIWVsZW1lbnQuY29udGFpbnMoYWN0aXZlRWxlbWVudCkpIHtcclxuICAgICAgICAgIGVsZW1lbnQuZm9jdXMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgdHJ1ZTpcclxuICAgICAgY2FzZSAnZmlyc3QtdGFiYmFibGUnOlxyXG4gICAgICAgIHRoaXMuX2ZvY3VzVHJhcC5mb2N1c0luaXRpYWxFbGVtZW50V2hlblJlYWR5KCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2ZpcnN0LWhlYWRpbmcnOlxyXG4gICAgICAgIHRoaXMuX2ZvY3VzQnlDc3NTZWxlY3RvcignaDEsIGgyLCBoMywgaDQsIGg1LCBoNiwgW3JvbGU9XCJoZWFkaW5nXCJdJyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhpcy5fZm9jdXNCeUNzc1NlbGVjdG9yKHRoaXMucmlnaHRTaGVldENvbmZpZy5hdXRvRm9jdXMhKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBSZXN0b3JlcyBmb2N1cyB0byB0aGUgZWxlbWVudCB0aGF0IHdhcyBmb2N1c2VkIGJlZm9yZSB0aGUgYm90dG9tIHNoZWV0IHdhcyBvcGVuZWQuICovXHJcbiAgcHJpdmF0ZSBfcmVzdG9yZUZvY3VzKCkge1xyXG4gICAgY29uc3QgdG9Gb2N1cyA9IHRoaXMuX2VsZW1lbnRGb2N1c2VkQmVmb3JlT3BlbmVkO1xyXG5cclxuICAgIC8vIFdlIG5lZWQgdGhlIGV4dHJhIGNoZWNrLCBiZWNhdXNlIElFIGNhbiBzZXQgdGhlIGBhY3RpdmVFbGVtZW50YCB0byBudWxsIGluIHNvbWUgY2FzZXMuXHJcbiAgICBpZiAoXHJcbiAgICAgIHRoaXMucmlnaHRTaGVldENvbmZpZy5yZXN0b3JlRm9jdXMgJiZcclxuICAgICAgdG9Gb2N1cyAmJlxyXG4gICAgICB0eXBlb2YgdG9Gb2N1cy5mb2N1cyA9PT0gJ2Z1bmN0aW9uJ1xyXG4gICAgKSB7XHJcbiAgICAgIGNvbnN0IGFjdGl2ZUVsZW1lbnQgPSB0aGlzLl9kb2N1bWVudC5hY3RpdmVFbGVtZW50O1xyXG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xyXG5cclxuICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgZm9jdXMgaXMgc3RpbGwgaW5zaWRlIHRoZSBib3R0b20gc2hlZXQgb3IgaXMgb24gdGhlIGJvZHkgKHVzdWFsbHkgYmVjYXVzZSBhXHJcbiAgICAgIC8vIG5vbi1mb2N1c2FibGUgZWxlbWVudCBsaWtlIHRoZSBiYWNrZHJvcCB3YXMgY2xpY2tlZCkgYmVmb3JlIG1vdmluZyBpdC4gSXQncyBwb3NzaWJsZSB0aGF0XHJcbiAgICAgIC8vIHRoZSBjb25zdW1lciBtb3ZlZCBpdCB0aGVtc2VsdmVzIGJlZm9yZSB0aGUgYW5pbWF0aW9uIHdhcyBkb25lLCBpbiB3aGljaCBjYXNlIHdlIHNob3VsZG4ndFxyXG4gICAgICAvLyBkbyBhbnl0aGluZy5cclxuICAgICAgaWYgKCFhY3RpdmVFbGVtZW50IHx8IGFjdGl2ZUVsZW1lbnQgPT09IHRoaXMuX2RvY3VtZW50LmJvZHkgfHwgYWN0aXZlRWxlbWVudCA9PT0gZWxlbWVudCB8fFxyXG4gICAgICAgIGVsZW1lbnQuY29udGFpbnMoYWN0aXZlRWxlbWVudCkpIHtcclxuICAgICAgICB0b0ZvY3VzLmZvY3VzKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5fZm9jdXNUcmFwKSB7XHJcbiAgICAgIHRoaXMuX2ZvY3VzVHJhcC5kZXN0cm95KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogU2F2ZXMgYSByZWZlcmVuY2UgdG8gdGhlIGVsZW1lbnQgdGhhdCB3YXMgZm9jdXNlZCBiZWZvcmUgdGhlIGJvdHRvbSBzaGVldCB3YXMgb3BlbmVkLiAqL1xyXG4gIHByaXZhdGUgX3NhdmVQcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQoKSB7XHJcbiAgICB0aGlzLl9lbGVtZW50Rm9jdXNlZEJlZm9yZU9wZW5lZCA9IHRoaXMuX2RvY3VtZW50XHJcbiAgICAgIC5hY3RpdmVFbGVtZW50IGFzIEhUTUxFbGVtZW50O1xyXG5cclxuICAgIC8vIFRoZSBgZm9jdXNgIG1ldGhvZCBpc24ndCBhdmFpbGFibGUgZHVyaW5nIHNlcnZlci1zaWRlIHJlbmRlcmluZy5cclxuICAgIGlmICh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZm9jdXMpIHtcclxuICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5mb2N1cygpKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsIjxuZy10ZW1wbGF0ZSBjZGtQb3J0YWxPdXRsZXQ+PC9uZy10ZW1wbGF0ZT5cclxuIl19