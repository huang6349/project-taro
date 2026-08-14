import { createContext } from 'react';

/** 面板激活状态 Context：null = 非面板场景；boolean = SysTabs 面板激活态（由 SysTabs 面板注入） */
export const PanelActiveContext = createContext<boolean | null>(null);
