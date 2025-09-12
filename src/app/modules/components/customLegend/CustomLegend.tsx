// Legend.tsx
import React from 'react';
import { LegendItem } from '../../../models/global/globalGeneric';

interface LegendProps {
    items: LegendItem[];
}
const Legend: React.FC<LegendProps> = ({ items }) => {
    return (
        <div>
            <h2>Legend</h2>
            <ul>
                {items.map((item, index) => (
                    <li key={index} style={{ color: item.color }}>
                        <span style={{ width: '16px', height: '16px', backgroundColor: item.color, display: 'inline-block', marginRight: '8px' }}></span>
                        {item.description}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Legend;
