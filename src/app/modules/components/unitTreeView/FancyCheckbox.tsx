import React from "react";
import "./FancyCheckbox.css";

const FancyCheckbox = ({ label, checked, onChange }) => {
  return (
    <label className="fancy-checkbox">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="checkmark"></span>
      {label}
    </label>
  );
};

export default FancyCheckbox;

// <FancyCheckbox
//     label=""
//     checked={isSelected}
//     onChange={(e) => {
//         e.stopPropagation();
//         handleSelectNode({
//             element,
//             isSelected: !isSelected,
//             isBranch,
//         });
//     }}
// />
