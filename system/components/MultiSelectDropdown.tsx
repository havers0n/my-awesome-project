
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDownIcon, XIcon } from './icons';

interface Option {
    id: string;
    name: string;
}

interface MultiSelectDropdownProps {
    options: Option[];
    selectedIds: string[];
    onChange: (selectedIds: string[]) => void;
    placeholder?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
    options,
    selectedIds,
    onChange,
    placeholder = "Выберите товары...",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOptions = useMemo(() => {
        return options.filter(opt => selectedIds.includes(opt.id));
    }, [options, selectedIds]);

    const handleToggle = () => setIsOpen(prev => !prev);

    const handleSelect = (id: string) => {
        const newSelectedIds = selectedIds.includes(id)
            ? selectedIds.filter(selectedId => selectedId !== id)
            : [...selectedIds, id];
        onChange(newSelectedIds);
    };

    const handleRemove = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newSelectedIds = selectedIds.filter(selectedId => selectedId !== id);
        onChange(newSelectedIds);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div
                onClick={handleToggle}
                className="w-full mt-1 bg-white border border-gray-300 rounded-md p-2 flex items-center justify-between cursor-pointer"
            >
                <div className="flex flex-wrap gap-1">
                    {selectedOptions.length > 0 ? (
                        selectedOptions.map(option => (
                            <span key={option.id} className="flex items-center gap-1 bg-amber-100 text-amber-800 text-sm font-medium px-2 py-0.5 rounded">
                                {option.name}
                                <button onClick={(e) => handleRemove(e, option.id)} className="hover:bg-amber-200 rounded-full">
                                    <XIcon className="w-3 h-3"/>
                                </button>
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-500">{placeholder}</span>
                    )}
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <ul className="py-1">
                        {options.map(option => (
                            <li
                                key={option.id}
                                onClick={() => handleSelect(option.id)}
                                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(option.id)}
                                    readOnly
                                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                />
                                <span className="ml-3">{option.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;
