import { Overlay } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import { Location } from '@angular/common';
import { InjectionToken, Injector, OnDestroy, TemplateRef } from '@angular/core';
import { MatRightSheetConfig } from './right-sheet.config';
import { MatRightSheetRef } from './right-sheet.ref';
import * as i0 from "@angular/core";
/** Injection token that can be used to specify default bottom sheet options. */
export declare const MAT_RIGHT_SHEET_DEFAULT_OPTIONS: InjectionToken<MatRightSheetConfig<any>>;
/**
 * Service to trigger Material Design right sheets.
 */
export declare class MatRightSheet implements OnDestroy {
    private readonly _overlay;
    private readonly _injector;
    private readonly _parentRightSheet;
    private readonly _location?;
    private readonly _defaultOptions?;
    private _rightSheetRefAtThisLevel;
    /** Reference to the currently opened bottom sheet. */
    get _openedRightSheetRef(): MatRightSheetRef<any> | null;
    set _openedRightSheetRef(value: MatRightSheetRef<any> | null);
    constructor(_overlay: Overlay, _injector: Injector, _parentRightSheet: MatRightSheet, _location?: Location, _defaultOptions?: MatRightSheetConfig);
    open<T, D = any, R = any>(component: ComponentType<T>, config?: MatRightSheetConfig<D>): MatRightSheetRef<T, R>;
    open<T, D = any, R = any>(template: TemplateRef<T>, config?: MatRightSheetConfig<D>): MatRightSheetRef<T, R>;
    /**
     * Dismisses the currently-visible bottom sheet.
     */
    dismiss(): void;
    ngOnDestroy(): void;
    /**
     * Attaches the bottom sheet container component to the overlay.
     */
    private _attachContainer;
    /**
     * Creates a new overlay and places it in the correct location.
     * @param config The user-specified bottom sheet config.
     */
    private _createOverlay;
    /**
     * Creates an injector to be used inside of a bottom sheet component.
     * @param config Config that was used to create the bottom sheet.
     * @param rightSheetRef Reference to the bottom sheet.
     */
    private _createInjector;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatRightSheet, [null, null, { optional: true; skipSelf: true; }, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MatRightSheet>;
}
