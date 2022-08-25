import { Options as NormalizeUrlOptions } from 'normalize-url';
import Quill from 'quill';
declare global {
    interface Window {
        Quill?: typeof Quill;
    }
}
export declare type MagicUrlOptions = {
    globalRegularExpression: RegExp;
    urlRegularExpression: RegExp;
    globalMailRegularExpression: RegExp;
    mailRegularExpression: RegExp;
    normalizeRegularExpression: RegExp;
    normalizeUrlOptions: NormalizeUrlOptions;
};
export declare type Normalizer = (stringToNormalize: string) => string;
export default class MagicUrl {
    quill: Quill;
    options: MagicUrlOptions;
    urlNormalizer: Normalizer;
    mailNormalizer: Normalizer;
    constructor(quill: Quill, options?: Partial<MagicUrlOptions>);
    registerPasteListener(): void;
    registerTypeListener(): void;
    registerBlurListener(): void;
    checkTextForUrl(triggeredByInlineWhitespace?: boolean): void;
    handleMatches(leafIndex: number, text: string, matches: RegExpMatchArray, normalizer: Normalizer): void;
    updateText(index: number, string: string, normalizer: Normalizer): void;
    normalize(url: string): string;
}
