// CalendarHeatMap.tsx
import React from 'react';
import { Calendar } from 'react-native-calendars';
import { getColorForTotalSets } from '../../utils/helpers';

interface CalendarHeatMapProps {
    markedDates: Record<string, number>; // Number of sets per day
}
  
const CalendarHeatMap: React.FC<CalendarHeatMapProps> = ({ markedDates }) => {
    const formattedMarkedDates = Object.keys(markedDates).reduce((acc, date) => {
        const totalSets = markedDates[date] || 0;
        acc[date] = {
            customStyles: {
                container: {
                    backgroundColor: getColorForTotalSets(totalSets),
                    borderRadius: 4, 
                },
                text: {
                    color: '#000',
                    fontWeight: 'bold',
                },
            },
        };
        return acc;
    }, {} as Record<string, any>);

    return (
      <Calendar
        markingType="custom"
        markedDates={formattedMarkedDates}
        theme={{
          calendarBackground: '#fff',
          textSectionTitleColor: '#b6c1cd',
          dayTextColor: '#2d4150',
          monthTextColor: '#2d4150',
          arrowColor: '#2d4150',
          todayTextColor: '#FF5722',
        }}
      />
    );
};
  
export default CalendarHeatMap;
