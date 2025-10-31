'use client';

import React, { useState } from 'react';
import axios from 'axios';

interface Props {
    onChange?: (value?: string) => void;
}

export const AdressInput: React.FC<Props> = ({ onChange }) => {
    const [inputValue, setInputValue] = useState<string>('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchSuggestions = async (query: string) => {
        if (!query) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.get('/api/address', {
                params: { q: query },
            });

            const data = response.data;

            const formattedSuggestions = data.map((item: any) => {
                const street = item.address.road || '';
                const houseNumber = item.address.house_number || '';
                const suburb = item.address.suburb || '';
                const city = item.address.city || '';
                const country = item.address.country || '';

                return `${street} ${houseNumber}, ${suburb}, ${city}, ${country}`;
            });

            setSuggestions(formattedSuggestions);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setInputValue(value);
        fetchSuggestions(value);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
        onChange?.(suggestion);
        setSuggestions([]);
    };

    return (
        <div className="relative">
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                className="h-10 w-full rounded-md border px-3 py-2 focus:outline-none focus:border-inherit"
                placeholder="Enter address"
            />

            {isLoading && <div className="absolute top-full left-0 w-full bg-white">Loading...</div>}

            {suggestions.length > 0 && (
                <ul className="absolute top-full left-0 w-full bg-white border mt-1 max-h-60 overflow-y-auto z-10">
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-200"
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
