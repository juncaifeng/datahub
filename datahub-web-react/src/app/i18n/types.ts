import { Locale } from 'antd/lib/locale-provider';

export type SupportedLanguage = 'en' | 'de' | 'zh-CN';

export type LocaleConfig = {
    lang: SupportedLanguage;
    label: string;
    antd: Locale;
    dayjs: string;
};
