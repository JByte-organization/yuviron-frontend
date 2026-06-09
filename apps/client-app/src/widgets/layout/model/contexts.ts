import { createContext, useContext } from 'react';

// ══════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════
export const SIDEBAR_MIN_WIDTH  = 240;
export const SIDEBAR_MAX_WIDTH  = 480;
export const SIDEBAR_DEFAULT    = 260;
export const SIDEBAR_ICON_WIDTH = 68;
export const DESKTOP_BREAKPOINT = 992;

// ══════════════════════════════════════════════════════════
// LEFT SIDEBAR CONTEXT
// ══════════════════════════════════════════════════════════
export interface SidebarContextValue {
    collapsed:    boolean;
    setCollapsed: (v: boolean) => void;
    sidebarWidth: number;
}

export const SidebarContext = createContext<SidebarContextValue>({
    collapsed:    false,
    setCollapsed: () => {},
    sidebarWidth: SIDEBAR_DEFAULT,
});

export const useSidebar = () => useContext(SidebarContext);

// ══════════════════════════════════════════════════════════
// RIGHT SIDEBAR CONTEXT
// ══════════════════════════════════════════════════════════
export interface RightSidebarContextValue {
    isOpen:     boolean;
    userClosed: boolean;
    open:       () => void;
    close:      () => void;
}

export const RightSidebarContext = createContext<RightSidebarContextValue>({
    isOpen:     false,
    userClosed: false,
    open:  () => {},
    close: () => {},
});

export const useRightSidebar = () => useContext(RightSidebarContext);