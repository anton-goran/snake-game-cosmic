import '@testing-library/jest-dom';

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: any) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { }, // Deprecated
        removeListener: () => { }, // Deprecated
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => false,
    }),
});

class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}

window.ResizeObserver = ResizeObserver;
