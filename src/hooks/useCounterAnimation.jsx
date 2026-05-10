import { useEffect, useState } from 'react';

function useCounterAnimation(targetValue, duration) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const increment = targetValue / (duration / 10);

        const counter = setInterval(() => {
            start += increment;
            if (start >= targetValue) {
                setCount(targetValue);
                clearInterval(counter);
            } else {
                setCount(start);
            }
        }, 10);

        return () => clearInterval(counter);
    }, [targetValue, duration]);

    return Math.floor(count * 100) / 100; 
}

export default useCounterAnimation;
