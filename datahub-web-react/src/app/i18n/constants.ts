import { SelectOption } from '@components';
import deDE from 'antd/lib/locale/de_DE';
import enUS from 'antd/lib/locale/en_US';

import zhCN from 'antd/lib/locale/zh_CN';

import { LocaleConfig, SupportedLanguage } from '@app/i18n/types';

export const EN_LOCALE_CONFIG: LocaleConfig = {
    lang: 'en',
    antd: enUS,
    dayjs: 'en',
    label: 'English',
};

export const DE_LOCALE_CONFIG: LocaleConfig = {
    lang: 'de',
    antd: deDE,
    dayjs: 'de',
    label: 'Deutsch',
};

export const ZH_CN_LOCALE_CONFIG: LocaleConfig = {
    lang: 'zh-CN',
    antd: zhCN,
    dayjs: 'zh-cn',
    label: '简体中文',
};

export const LOCALE_MAP: Record<SupportedLanguage, LocaleConfig> = {
    en: EN_LOCALE_CONFIG,
    de: DE_LOCALE_CONFIG,
    'zh-CN': ZH_CN_LOCALE_CONFIG,
};

export const LANGUAGE_OPTIONS: SelectOption[] = [EN_LOCALE_CONFIG, DE_LOCALE_CONFIG, ZH_CN_LOCALE_CONFIG].map((localeConfig) => ({
    value: localeConfig.lang,
    label: localeConfig.label,
}));

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
