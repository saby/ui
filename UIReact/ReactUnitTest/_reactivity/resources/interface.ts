export interface IViewModelData {
    displayValue: string;
    value: string;
    oldValue: string;
    changeValue: (newValue: string) => boolean;
}
