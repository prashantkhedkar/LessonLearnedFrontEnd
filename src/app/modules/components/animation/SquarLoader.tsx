import { useEffect, useState } from "react";

export default function SquarLoader() {
    const [loadCount, setLoadCount] = useState<any>('block');
    useEffect(() => {

        setTimeout(() => {
            setLoadCount('none');

        }, 5000);

    }, []);

    return (


        <div className="loading" >
            {/* style={{display:loadCount}} */}
            <span className="loading__dot"></span>
            <span className="loading__dot"></span>
            <span className="loading__dot"></span>
        </div>
    )
}