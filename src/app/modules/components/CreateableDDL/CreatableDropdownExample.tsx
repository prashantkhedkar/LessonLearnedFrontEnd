import React, { useState } from 'react';
import CreatableDropdownList, { CommonOption } from '../CreateableDDL/CreatableDropdownList';

const CreatableDropdownExample: React.FC = () => {

    // Initial options
    const [options, setOptions] = useState<CommonOption[]>([
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
        { label: 'Orange', value: 'orange' },
        { label: 'Pineapple', value: 'pineapple' },
    ]);

    const [selectedOption, setSelectedOption] = useState<CommonOption | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (value: CommonOption | CommonOption[] | null) => {
        if (Array.isArray(value)) {
            setSelectedOption(value[0] || null);
            console.log('Selected value:', value[0] || null);
        } else {
            setSelectedOption(value);
            console.log('Selected value:', value);
        }
    };

    const handleCreateOption = (inputValue: string) => {
        setIsLoading(true);
        setTimeout(() => {
            const newOption = { label: inputValue, value: inputValue.toLowerCase().replace(/\W/g, '') };
            setOptions(prev => [...prev, newOption]);
            setSelectedOption(newOption);
            setIsLoading(false);
            console.log('New option created:', newOption);
        }, 1500);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h3>Creatable Dropdown Example</h3>
            

            <div style={{ marginBottom: '20px' }}>
                <label>Select or Add a Fruit:</label>
                <CreatableDropdownList
                    options={options}
                    value={selectedOption}
                    onChange={handleChange}
                    onCreateOption={handleCreateOption}
                    placeholder="Select or add a new status..."
                    isClearable={true}
                    isDisabled={isLoading}
                    isMulti={false}
                    isLoading={isLoading}
                    isRtl={true}
                />
            </div>


            {selectedOption && (
                <div>
                    <strong>Selected Value:</strong> {selectedOption.label}
                </div>
            )}

            <div style={{ marginTop: '20px' }}>
                <h4>Usage Instructions:</h4>
                <ul>
                    <li>Type to search existing options</li>
                    <li>Type a new value and press Enter or click "Add [value]" to create new options</li>
                    <li>New options are automatically saved to localStorage</li>
                    <li>Clear the selection using the X button</li>
                </ul>
            </div>
        </div>
    );
};

export default CreatableDropdownExample;
