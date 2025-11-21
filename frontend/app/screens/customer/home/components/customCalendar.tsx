import moment from 'moment';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CustomCalendarProps {
  selectedDate: moment.Moment;
  onDateSelect: (date: moment.Moment) => void;
  minDate: moment.Moment;
  maxDate: moment.Moment;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
}) => {
  // Generate week dates around the selected date
  const weekDates = useMemo(() => {
    const startOfWeek = selectedDate.clone().startOf('week');
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(startOfWeek.clone().add(i, 'days'));
    }
    return dates;
  }, [selectedDate]);

  // Get month/year display text
  const monthYearText = useMemo(() => {
    const currentMonth = selectedDate.format('MMMM YYYY');
    const weekStart = weekDates[0];
    const weekEnd = weekDates[6];
    
    if (weekStart.month() !== weekEnd.month()) {
      return `${weekStart.format('MMMM')} / ${weekEnd.format('MMMM YYYY')}`;
    }
    return currentMonth;
  }, [selectedDate, weekDates]);

  const handleDayPress = (date: moment.Moment) => {
    if (date.isBetween(minDate, maxDate, 'day', '[]')) {
      onDateSelect(date);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = selectedDate.clone().add(direction === 'next' ? 7 : -7, 'days');
    if (newDate.isBetween(minDate, maxDate, 'day', '[]')) {
      onDateSelect(newDate);
    }
  };

  const isDateDisabled = (date: moment.Moment) => {
    return !date.isBetween(minDate, maxDate, 'day', '[]');
  };

  const isDateSelected = (date: moment.Moment) => {
    return date.isSame(selectedDate, 'day');
  };

  return (
    <View style={styles.container}>
      {/* Month/Year Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateWeek('prev')}
        >
          <Text style={styles.navButtonText}>{'<'}</Text>
        </TouchableOpacity>
        
        <Text style={styles.monthYearText}>{monthYearText}</Text>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateWeek('next')}
        >
          <Text style={styles.navButtonText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Week Strip */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekContainer}
      >
        {weekDates.map((date, index) => {
          const isSelected = isDateSelected(date);
          const isDisabled = isDateDisabled(date);
          const dayName = date.format('ddd').toUpperCase();
          const dayNumber = date.format('D');

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayContainer,
                isSelected && styles.selectedDayContainer,
                isDisabled && styles.disabledDayContainer,
              ]}
              onPress={() => handleDayPress(date)}
              disabled={isDisabled}
            >
              <Text style={[
                styles.dayName,
                isSelected && styles.selectedDayName,
                isDisabled && styles.disabledText,
              ]}>
                {dayName}
              </Text>
              <Text style={[
                styles.dayNumber,
                isSelected && styles.selectedDayNumber,
                isDisabled && styles.disabledText,
              ]}>
                {dayNumber}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5', // Light gray card background
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  monthYearText: {
    color: '#1a1a1a', // Dark text
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    color: '#fa4616', // Orange arrows
    fontSize: 20,
    fontWeight: 'bold',
  },
  weekContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    justifyContent: 'space-between',
    width: '100%',
  },
  dayContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    minWidth: 48,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  selectedDayContainer: {
    backgroundColor: '#fa4616', // Orange background when selected
  },
  disabledDayContainer: {
    opacity: 0.4,
  },
  dayName: {
    color: '#666666', // Gray text
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedDayName: {
    color: '#ffffff', // White text when selected
  },
  dayNumber: {
    color: '#1a1a1a', // Dark text
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedDayNumber: {
    color: '#ffffff', // White text when selected
  },
  disabledText: {
    color: '#cccccc', // Light gray for disabled
  },
});

export default CustomCalendar;
