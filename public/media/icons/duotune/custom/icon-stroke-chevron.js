import React from "react";
import "./svg.css";

const IconStrokeArrow = ({direction}) => {
    return (

        <svg
            className={direction}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.59957 2.9316C7.82086 2.7103 8.17966 2.7103 8.40095 2.9316L12.401 6.9316C12.6223 7.15289 12.6223 7.51169 12.401 7.73299C12.1797 7.95428 11.8209 7.95428 11.5996 7.73299L8.56693 4.70035L8.56693 12.6656C8.56693 12.9786 8.31322 13.2323 8.00026 13.2323C7.6873 13.2323 7.43359 12.9786 7.43359 12.6656L7.43359 4.70035L4.40095 7.73299C4.17966 7.95428 3.82086 7.95428 3.59957 7.73299C3.37827 7.51169 3.37827 7.1529 3.59957 6.9316L7.59957 2.9316Z"
                fill="#6B7280"
            />
        </svg>
    );
};

export default IconStrokeArrow;