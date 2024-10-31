import { useState } from 'preact/hooks';

export function useForceUpdate() {
    const [value, setValue] = useState(0);
    return () => {
        setValue((value) => value + 1);
    };
}
