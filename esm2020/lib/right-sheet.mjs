/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector, TemplatePortal, } from '@angular/cdk/portal';
import { Inject, Injectable, InjectionToken, Optional, SkipSelf, TemplateRef, } from '@angular/core';
import { of as observableOf } from 'rxjs';
import { MAT_RIGHT_SHEET_DATA, MatRightSheetConfig } from './right-sheet.config';
import { MatRightSheetContainer } from './right-sheet.container';
import { MatRightSheetModule } from './right-sheet.module';
import { MatRightSheetRef } from './right-sheet.ref';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
import * as i2 from "@angular/common";
import * as i3 from "./right-sheet.config";
/** Injection token that can be used to specify default bottom sheet options. */
export const MAT_RIGHT_SHEET_DEFAULT_OPTIONS = new InjectionToken('mat-right-sheet-default-options');
/**
 * Service to trigger Material Design right sheets.
 */
export class MatRightSheet {
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
                change: observableOf(),
            });
        }
        return new PortalInjector(userInjector || this._injector, injectionTokens);
    }
}
MatRightSheet.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.0", ngImport: i0, type: MatRightSheet, deps: [{ token: i1.Overlay }, { token: i0.Injector }, { token: MatRightSheet, optional: true, skipSelf: true }, { token: i2.Location, optional: true }, { token: MAT_RIGHT_SHEET_DEFAULT_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
MatRightSheet.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.0", ngImport: i0, type: MatRightSheet, providedIn: MatRightSheetModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.0", ngImport: i0, type: MatRightSheet, decorators: [{
            type: Injectable,
            args: [{ providedIn: MatRightSheetModule }]
        }], ctorParameters: function () { return [{ type: i1.Overlay }, { type: i0.Injector }, { type: MatRightSheet, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }] }, { type: i2.Location, decorators: [{
                    type: Optional
                }] }, { type: i3.MatRightSheetConfig, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlnaHQtc2hlZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9yaWdodC1zaGVldC9zcmMvbGliL3JpZ2h0LXNoZWV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNuRCxPQUFPLEVBQVcsYUFBYSxFQUFjLE1BQU0sc0JBQXNCLENBQUM7QUFDMUUsT0FBTyxFQUFFLGVBQWUsRUFBaUIsY0FBYyxFQUFFLGNBQWMsR0FBRyxNQUFNLHFCQUFxQixDQUFDO0FBRXRHLE9BQU8sRUFBZ0IsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQXVCLFFBQVEsRUFBRSxRQUFRLEVBQUUsV0FBVyxHQUFHLE1BQU0sZUFBZSxDQUFDO0FBQ3hJLE9BQU8sRUFBRSxFQUFFLElBQUksWUFBWSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzFDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2pGLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQzNELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG1CQUFtQixDQUFDOzs7OztBQUVyRCxnRkFBZ0Y7QUFDaEYsTUFBTSxDQUFDLE1BQU0sK0JBQStCLEdBQUcsSUFBSSxjQUFjLENBQXNCLGlDQUFpQyxDQUFDLENBQUM7QUFFMUg7O0dBRUc7QUFFSCxNQUFNLE9BQU8sYUFBYTtJQW1CeEIsWUFDbUIsUUFBaUIsRUFDakIsU0FBbUIsRUFHbkIsaUJBQWdDLEVBQ3BCLFNBQW9CLEVBR2hDLGVBQXFDO1FBUnJDLGFBQVEsR0FBUixRQUFRLENBQVM7UUFDakIsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUduQixzQkFBaUIsR0FBakIs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QUFhLHFGQUd6QywrQkFBK0I7OEdBM0I5QixhQUFhLGNBREQsbUJBQW1COzJGQUMvQixhQUFhO2tCQUR6QixVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLG1CQUFtQixFQUFDO3VHQXlCTCxhQUFhOzBCQUZoRCxRQUFROzswQkFDUixRQUFROzswQkFFUixRQUFROzswQkFDUixRQUFROzswQkFDUixNQUFNOzJCQUFDLCtCQUErQjs7QUE4SzNDOzs7OztHQUtHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FDM0IsUUFBNkIsRUFDN0IsTUFBNEI7SUFFNUIsT0FBTyxFQUFDLEdBQUcsUUFBUSxFQUFFLEdBQUcsTUFBTSxFQUFDLENBQUM7QUFDbEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgRGlyZWN0aW9uYWxpdHkgfSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XHJcbmltcG9ydCB7IE92ZXJsYXksIE92ZXJsYXlDb25maWcsIE92ZXJsYXlSZWYgfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XHJcbmltcG9ydCB7IENvbXBvbmVudFBvcnRhbCwgQ29tcG9uZW50VHlwZSwgUG9ydGFsSW5qZWN0b3IsIFRlbXBsYXRlUG9ydGFsLCB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xyXG5pbXBvcnQgeyBMb2NhdGlvbiB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IENvbXBvbmVudFJlZiwgSW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgSW5qZWN0b3IsIE9uRGVzdHJveSwgT3B0aW9uYWwsIFNraXBTZWxmLCBUZW1wbGF0ZVJlZiwgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgb2YgYXMgb2JzZXJ2YWJsZU9mIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IE1BVF9SSUdIVF9TSEVFVF9EQVRBLCBNYXRSaWdodFNoZWV0Q29uZmlnIH0gZnJvbSAnLi9yaWdodC1zaGVldC5jb25maWcnO1xyXG5pbXBvcnQgeyBNYXRSaWdodFNoZWV0Q29udGFpbmVyIH0gZnJvbSAnLi9yaWdodC1zaGVldC5jb250YWluZXInO1xyXG5pbXBvcnQgeyBNYXRSaWdodFNoZWV0TW9kdWxlIH0gZnJvbSAnLi9yaWdodC1zaGVldC5tb2R1bGUnO1xyXG5pbXBvcnQgeyBNYXRSaWdodFNoZWV0UmVmIH0gZnJvbSAnLi9yaWdodC1zaGVldC5yZWYnO1xyXG5cclxuLyoqIEluamVjdGlvbiB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHNwZWNpZnkgZGVmYXVsdCBib3R0b20gc2hlZXQgb3B0aW9ucy4gKi9cclxuZXhwb3J0IGNvbnN0IE1BVF9SSUdIVF9TSEVFVF9ERUZBVUxUX09QVElPTlMgPSBuZXcgSW5qZWN0aW9uVG9rZW48TWF0UmlnaHRTaGVldENvbmZpZz4oJ21hdC1yaWdodC1zaGVldC1kZWZhdWx0LW9wdGlvbnMnKTtcclxuXHJcbi8qKlxyXG4gKiBTZXJ2aWNlIHRvIHRyaWdnZXIgTWF0ZXJpYWwgRGVzaWduIHJpZ2h0IHNoZWV0cy5cclxuICovXHJcbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiBNYXRSaWdodFNoZWV0TW9kdWxlfSlcclxuZXhwb3J0IGNsYXNzIE1hdFJpZ2h0U2hlZXQgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xyXG4gIHByaXZhdGUgX3JpZ2h0U2hlZXRSZWZBdFRoaXNMZXZlbDogTWF0UmlnaHRTaGVldFJlZjxhbnk+IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnRseSBvcGVuZWQgYm90dG9tIHNoZWV0LiAqL1xyXG4gIGdldCBfb3BlbmVkUmlnaHRTaGVldFJlZigpOiBNYXRSaWdodFNoZWV0UmVmPGFueT4gfCBudWxsIHtcclxuICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuX3BhcmVudFJpZ2h0U2hlZXQ7XHJcbiAgICByZXR1cm4gcGFyZW50XHJcbiAgICAgID8gcGFyZW50Ll9vcGVuZWRSaWdodFNoZWV0UmVmXHJcbiAgICAgIDogdGhpcy5fcmlnaHRTaGVldFJlZkF0VGhpc0xldmVsO1xyXG4gIH1cclxuXHJcbiAgc2V0IF9vcGVuZWRSaWdodFNoZWV0UmVmKHZhbHVlOiBNYXRSaWdodFNoZWV0UmVmPGFueT4gfCBudWxsKSB7XHJcbiAgICBpZiAodGhpcy5fcGFyZW50UmlnaHRTaGVldCkge1xyXG4gICAgICB0aGlzLl9wYXJlbnRSaWdodFNoZWV0Ll9vcGVuZWRSaWdodFNoZWV0UmVmID0gdmFsdWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLl9yaWdodFNoZWV0UmVmQXRUaGlzTGV2ZWwgPSB2YWx1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBfb3ZlcmxheTogT3ZlcmxheSxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2luamVjdG9yOiBJbmplY3RvcixcclxuICAgIEBPcHRpb25hbCgpXHJcbiAgICBAU2tpcFNlbGYoKVxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBfcGFyZW50UmlnaHRTaGVldDogTWF0UmlnaHRTaGVldCxcclxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgX2xvY2F0aW9uPzogTG9jYXRpb24sXHJcbiAgICBAT3B0aW9uYWwoKVxyXG4gICAgQEluamVjdChNQVRfUklHSFRfU0hFRVRfREVGQVVMVF9PUFRJT05TKVxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZGVmYXVsdE9wdGlvbnM/OiBNYXRSaWdodFNoZWV0Q29uZmlnLFxyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG9wZW48VCwgRCA9IGFueSwgUiA9IGFueT4oXHJcbiAgICBjb21wb25lbnQ6IENvbXBvbmVudFR5cGU8VD4sXHJcbiAgICBjb25maWc/OiBNYXRSaWdodFNoZWV0Q29uZmlnPEQ+LFxyXG4gICk6IE1hdFJpZ2h0U2hlZXRSZWY8VCwgUj47XHJcbiAgcHVibGljIG9wZW48VCwgRCA9IGFueSwgUiA9IGFueT4oXHJcbiAgICB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8VD4sXHJcbiAgICBjb25maWc/OiBNYXRSaWdodFNoZWV0Q29uZmlnPEQ+LFxyXG4gICk6IE1hdFJpZ2h0U2hlZXRSZWY8VCwgUj47XHJcbiAgcHVibGljIG9wZW48VCwgRCA9IGFueSwgUiA9IGFueT4oXHJcbiAgICBjb21wb25lbnRPclRlbXBsYXRlUmVmOiBDb21wb25lbnRUeXBlPFQ+IHwgVGVtcGxhdGVSZWY8VD4sXHJcbiAgICBjb25maWc/OiBNYXRSaWdodFNoZWV0Q29uZmlnPEQ+LFxyXG4gICk6IE1hdFJpZ2h0U2hlZXRSZWY8VCwgUj4ge1xyXG4gICAgY29uc3QgX2NvbmZpZyA9IF9hcHBseUNvbmZpZ0RlZmF1bHRzKFxyXG4gICAgICB0aGlzLl9kZWZhdWx0T3B0aW9ucyB8fCBuZXcgTWF0UmlnaHRTaGVldENvbmZpZygpLFxyXG4gICAgICBjb25maWcsXHJcbiAgICApO1xyXG4gICAgY29uc3Qgb3ZlcmxheVJlZiA9IHRoaXMuX2NyZWF0ZU92ZXJsYXkoX2NvbmZpZyk7XHJcbiAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLl9hdHRhY2hDb250YWluZXIob3ZlcmxheVJlZiwgX2NvbmZpZyk7XHJcbiAgICBjb25zdCByZWYgPSBuZXcgTWF0UmlnaHRTaGVldFJlZjxULCBSPihcclxuICAgICAgY29udGFpbmVyLFxyXG4gICAgICBvdmVybGF5UmVmLFxyXG4gICAgICB0aGlzLl9sb2NhdGlvbixcclxuICAgICk7XHJcblxyXG4gICAgaWYgKGNvbXBvbmVudE9yVGVtcGxhdGVSZWYgaW5zdGFuY2VvZiBUZW1wbGF0ZVJlZikge1xyXG4gICAgICBjb250YWluZXIuYXR0YWNoVGVtcGxhdGVQb3J0YWwoXHJcbiAgICAgICAgbmV3IFRlbXBsYXRlUG9ydGFsPFQ+KGNvbXBvbmVudE9yVGVtcGxhdGVSZWYsIG51bGwhLCB7XHJcbiAgICAgICAgICAkaW1wbGljaXQ6IF9jb25maWcuZGF0YSxcclxuICAgICAgICAgIHJpZ2h0U2hlZXRSZWY6IHJlZixcclxuICAgICAgICB9IGFzIGFueSksXHJcbiAgICAgICk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBwb3J0YWwgPSBuZXcgQ29tcG9uZW50UG9ydGFsKFxyXG4gICAgICAgIGNvbXBvbmVudE9yVGVtcGxhdGVSZWYsXHJcbiAgICAgICAgdW5kZWZpbmVkLFxyXG4gICAgICAgIHRoaXMuX2NyZWF0ZUluamVjdG9yKF9jb25maWcsIHJlZiksXHJcbiAgICAgICk7XHJcbiAgICAgIGNvbnN0IGNvbnRlbnRSZWYgPSBjb250YWluZXIuYXR0YWNoQ29tcG9uZW50UG9ydGFsKHBvcnRhbCk7XHJcbiAgICAgIHJlZi5pbnN0YW5jZSA9IGNvbnRlbnRSZWYuaW5zdGFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgYm90dG9tIHNoZWV0IGlzIGRpc21pc3NlZCwgY2xlYXIgdGhlIHJlZmVyZW5jZSB0byBpdC5cclxuICAgIHJlZi5hZnRlckRpc21pc3NlZCgpLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgIC8vIENsZWFyIHRoZSBib3R0b20gc2hlZXQgcmVmIGlmIGl0IGhhc24ndCBhbHJlYWR5IGJlZW4gcmVwbGFjZWQgYnkgYSBuZXdlciBvbmUuXHJcbiAgICAgIGlmICh0aGlzLl9vcGVuZWRSaWdodFNoZWV0UmVmID09IHJlZikge1xyXG4gICAgICAgIHRoaXMuX29wZW5lZFJpZ2h0U2hlZXRSZWYgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAodGhpcy5fb3BlbmVkUmlnaHRTaGVldFJlZikge1xyXG4gICAgICAvLyBJZiBhIGJvdHRvbSBzaGVldCBpcyBhbHJlYWR5IGluIHZpZXcsIGRpc21pc3MgaXQgYW5kIGVudGVyIHRoZVxyXG4gICAgICAvLyBuZXcgYm90dG9tIHNoZWV0IGFmdGVyIGV4aXQgYW5pbWF0aW9uIGlzIGNvbXBsZXRlLlxyXG4gICAgICB0aGlzLl9vcGVuZWRSaWdodFNoZWV0UmVmXHJcbiAgICAgICAgLmFmdGVyRGlzbWlzc2VkKClcclxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHJlZi5jb250YWluZXJJbnN0YW5jZS5lbnRlcigpKTtcclxuICAgICAgdGhpcy5fb3BlbmVkUmlnaHRTaGVldFJlZi5kaXNtaXNzKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBJZiBubyBib3R0b20gc2hlZXQgaXMgaW4gdmlldywgZW50ZXIgdGhlIG5ldyBib3R0b20gc2hlZXQuXHJcbiAgICAgIHJlZi5jb250YWluZXJJbnN0YW5jZS5lbnRlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX29wZW5lZFJpZ2h0U2hlZXRSZWYgPSByZWY7XHJcblxyXG4gICAgcmV0dXJuIHJlZjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpc21pc3NlcyB0aGUgY3VycmVudGx5LXZpc2libGUgYm90dG9tIHNoZWV0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBkaXNtaXNzKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuX29wZW5lZFJpZ2h0U2hlZXRSZWYpIHtcclxuICAgICAgdGhpcy5fb3BlbmVkUmlnaHRTaGVldFJlZi5kaXNtaXNzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICBpZiAodGhpcy5fcmlnaHRTaGVldFJlZkF0VGhpc0xldmVsKSB7XHJcbiAgICAgIHRoaXMuX3JpZ2h0U2hlZXRSZWZBdFRoaXNMZXZlbC5kaXNtaXNzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBdHRhY2hlcyB0aGUgYm90dG9tIHNoZWV0IGNvbnRhaW5lciBjb21wb25lbnQgdG8gdGhlIG92ZXJsYXkuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfYXR0YWNoQ29udGFpbmVyKFxyXG4gICAgb3ZlcmxheVJlZjogT3ZlcmxheVJlZixcclxuICAgIGNvbmZpZzogTWF0UmlnaHRTaGVldENvbmZpZyxcclxuICApOiBNYXRSaWdodFNoZWV0Q29udGFpbmVyIHtcclxuICAgIGNvbnN0IHVzZXJJbmplY3RvciA9XHJcbiAgICAgIGNvbmZpZyAmJlxyXG4gICAgICBjb25maWcudmlld0NvbnRhaW5lclJlZiAmJlxyXG4gICAgICBjb25maWcudmlld0NvbnRhaW5lclJlZi5pbmplY3RvcjtcclxuICAgIGNvbnN0IGluamVjdG9yID0gbmV3IFBvcnRhbEluamVjdG9yKFxyXG4gICAgICB1c2VySW5qZWN0b3IgfHwgdGhpcy5faW5qZWN0b3IsXHJcbiAgICAgIG5ldyBXZWFrTWFwKFtbTWF0UmlnaHRTaGVldENvbmZpZywgY29uZmlnXV0pLFxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBjb250YWluZXJQb3J0YWwgPSBuZXcgQ29tcG9uZW50UG9ydGFsKFxyXG4gICAgICBNYXRSaWdodFNoZWV0Q29udGFpbmVyLFxyXG4gICAgICBjb25maWcudmlld0NvbnRhaW5lclJlZixcclxuICAgICAgaW5qZWN0b3IsXHJcbiAgICApO1xyXG4gICAgY29uc3QgY29udGFpbmVyUmVmOiBDb21wb25lbnRSZWY8TWF0UmlnaHRTaGVldENvbnRhaW5lcj4gPSBvdmVybGF5UmVmLmF0dGFjaChjb250YWluZXJQb3J0YWwpO1xyXG4gICAgcmV0dXJuIGNvbnRhaW5lclJlZi5pbnN0YW5jZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgb3ZlcmxheSBhbmQgcGxhY2VzIGl0IGluIHRoZSBjb3JyZWN0IGxvY2F0aW9uLlxyXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIHVzZXItc3BlY2lmaWVkIGJvdHRvbSBzaGVldCBjb25maWcuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfY3JlYXRlT3ZlcmxheShjb25maWc6IE1hdFJpZ2h0U2hlZXRDb25maWcpOiBPdmVybGF5UmVmIHtcclxuICAgIGNvbnN0IG92ZXJsYXlDb25maWcgPSBuZXcgT3ZlcmxheUNvbmZpZyh7XHJcbiAgICAgIGRpcmVjdGlvbjogY29uZmlnLmRpcmVjdGlvbixcclxuICAgICAgaGFzQmFja2Ryb3A6IGNvbmZpZy5oYXNCYWNrZHJvcCxcclxuICAgICAgZGlzcG9zZU9uTmF2aWdhdGlvbjogY29uZmlnLmNsb3NlT25OYXZpZ2F0aW9uLFxyXG4gICAgICB3aWR0aDogY29uZmlnLndpZHRoIHx8ICc0MjBweCcsXHJcbiAgICAgIGhlaWdodDogJzEwMHZoJyxcclxuICAgICAgc2Nyb2xsU3RyYXRlZ3k6IGNvbmZpZy5zY3JvbGxTdHJhdGVneSB8fCB0aGlzLl9vdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXMuYmxvY2soKSxcclxuICAgICAgcG9zaXRpb25TdHJhdGVneTogdGhpcy5fb3ZlcmxheVxyXG4gICAgICAgIC5wb3NpdGlvbigpXHJcbiAgICAgICAgLmdsb2JhbCgpXHJcbiAgICAgICAgLnRvcCgnMHB4JylcclxuICAgICAgICAucmlnaHQoJzBweCcpXHJcbiAgICAgICAgLmJvdHRvbSgnMHB4JyksXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoY29uZmlnLmJhY2tkcm9wQ2xhc3MpIHtcclxuICAgICAgb3ZlcmxheUNvbmZpZy5iYWNrZHJvcENsYXNzID0gY29uZmlnLmJhY2tkcm9wQ2xhc3M7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXkuY3JlYXRlKG92ZXJsYXlDb25maWcpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhbiBpbmplY3RvciB0byBiZSB1c2VkIGluc2lkZSBvZiBhIGJvdHRvbSBzaGVldCBjb21wb25lbnQuXHJcbiAgICogQHBhcmFtIGNvbmZpZyBDb25maWcgdGhhdCB3YXMgdXNlZCB0byBjcmVhdGUgdGhlIGJvdHRvbSBzaGVldC5cclxuICAgKiBAcGFyYW0gcmlnaHRTaGVldFJlZiBSZWZlcmVuY2UgdG8gdGhlIGJvdHRvbSBzaGVldC5cclxuICAgKi9cclxuICBwcml2YXRlIF9jcmVhdGVJbmplY3RvcjxUPihcclxuICAgIGNvbmZpZzogTWF0UmlnaHRTaGVldENvbmZpZyxcclxuICAgIHJpZ2h0U2hlZXRSZWY6IE1hdFJpZ2h0U2hlZXRSZWY8VD4sXHJcbiAgKTogUG9ydGFsSW5qZWN0b3Ige1xyXG4gICAgY29uc3QgdXNlckluamVjdG9yID1cclxuICAgICAgY29uZmlnICYmXHJcbiAgICAgIGNvbmZpZy52aWV3Q29udGFpbmVyUmVmICYmXHJcbiAgICAgIGNvbmZpZy52aWV3Q29udGFpbmVyUmVmLmluamVjdG9yO1xyXG4gICAgY29uc3QgaW5qZWN0aW9uVG9rZW5zID0gbmV3IFdlYWtNYXA8YW55LCBhbnk+KFtcclxuICAgICAgW01hdFJpZ2h0U2hlZXRSZWYsIHJpZ2h0U2hlZXRSZWZdLFxyXG4gICAgICBbTUFUX1JJR0hUX1NIRUVUX0RBVEEsIGNvbmZpZy5kYXRhXSxcclxuICAgIF0pO1xyXG5cclxuICAgIGlmIChcclxuICAgICAgY29uZmlnLmRpcmVjdGlvbiAmJlxyXG4gICAgICAoIXVzZXJJbmplY3RvciB8fFxyXG4gICAgICAgICF1c2VySW5qZWN0b3IuZ2V0PERpcmVjdGlvbmFsaXR5IHwgbnVsbD4oRGlyZWN0aW9uYWxpdHksIG51bGwpKVxyXG4gICAgKSB7XHJcbiAgICAgIGluamVjdGlvblRva2Vucy5zZXQoRGlyZWN0aW9uYWxpdHksIHtcclxuICAgICAgICB2YWx1ZTogY29uZmlnLmRpcmVjdGlvbixcclxuICAgICAgICBjaGFuZ2U6IG9ic2VydmFibGVPZigpLFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IFBvcnRhbEluamVjdG9yKFxyXG4gICAgICB1c2VySW5qZWN0b3IgfHwgdGhpcy5faW5qZWN0b3IsXHJcbiAgICAgIGluamVjdGlvblRva2VucyxcclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQXBwbGllcyBkZWZhdWx0IG9wdGlvbnMgdG8gdGhlIGJvdHRvbSBzaGVldCBjb25maWcuXHJcbiAqIEBwYXJhbSBkZWZhdWx0cyBPYmplY3QgY29udGFpbmluZyB0aGUgZGVmYXVsdCB2YWx1ZXMgdG8gd2hpY2ggdG8gZmFsbCBiYWNrLlxyXG4gKiBAcGFyYW0gY29uZmlnIFRoZSBjb25maWd1cmF0aW9uIHRvIHdoaWNoIHRoZSBkZWZhdWx0cyB3aWxsIGJlIGFwcGxpZWQuXHJcbiAqIEByZXR1cm5zIFRoZSBuZXcgY29uZmlndXJhdGlvbiBvYmplY3Qgd2l0aCBkZWZhdWx0cyBhcHBsaWVkLlxyXG4gKi9cclxuZnVuY3Rpb24gX2FwcGx5Q29uZmlnRGVmYXVsdHMoXHJcbiAgZGVmYXVsdHM6IE1hdFJpZ2h0U2hlZXRDb25maWcsXHJcbiAgY29uZmlnPzogTWF0UmlnaHRTaGVldENvbmZpZyxcclxuKTogTWF0UmlnaHRTaGVldENvbmZpZyB7XHJcbiAgcmV0dXJuIHsuLi5kZWZhdWx0cywgLi4uY29uZmlnfTtcclxufVxyXG4iXX0=