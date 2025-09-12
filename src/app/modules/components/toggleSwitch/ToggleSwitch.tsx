import React, { useState } from 'react';
import css from './ToggleSwitch.module.css';

interface ToggleSwitchProps {
  customId: string;
  defaultValue: boolean;
  setValue;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ customId, setValue, defaultValue }) => {
  const [currentValue, setCurrentValue] = useState(defaultValue);
  function handleChange(e) {
    let isChecked = e.target.checked;
    setCurrentValue(isChecked);
    setValue(isChecked);
  }
  return (
    <div className={css["toggle-switch"]}>
      <input type="checkbox" className={css.checkbox} id={customId} checked={currentValue}
        onChange={e => handleChange(e)} />
      <label className={css.label} htmlFor={customId}>
        <span className={css[currentValue?"on":"off"]}></span>
        <span className={css.switch}></span>
      </label>
    </div>
  );
};

export default ToggleSwitch;
