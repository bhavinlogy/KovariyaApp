import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function YearPicker({ currentYear, onSelectYear }: { currentYear: number, onSelectYear: (year: number) => void }) {
    const years = Array.from({ length: 50 }, (_, i) => currentYear - 25 + i);

    return (
        <FlatList
            data={years}
            keyExtractor={(item) => item.toString()}
            numColumns={3}
            renderItem={({ item }) => {
                const isSelected = item === currentYear;

                return (
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            padding: 16,
                            alignItems: 'center',
                        }}
                        onPress={() => onSelectYear(item)}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                color: isSelected ? '#6C5CE7' : '#000',
                                fontWeight: isSelected ? 'bold' : 'normal',
                            }}
                        >
                            {item}
                        </Text>
                    </TouchableOpacity>
                );
            }}
        />
    );
}