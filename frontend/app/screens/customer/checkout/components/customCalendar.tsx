import moment from 'moment';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CustomCalendarProps {
  selectedDate: moment.Moment;
  onDateSelect: (date: moment.Moment) => void;
  minDate: moment.Moment;
  maxDate: moment.Moment;
  datesWhitelist?: (date: moment.Moment) => boolean;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  datesWhitelist,
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
    if (isDateSelectable(date)) {
      onDateSelect(date);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = selectedDate.clone().add(direction === 'next' ? 7 : -7, 'days');
    if (newDate.isBetween(minDate, maxDate, 'day', '[]')) {
      // Find the next selectable date in the new week
      const startOfWeek = newDate.clone().startOf('week');
      for (let i = 0; i < 7; i++) {
        const checkDate = startOfWeek.clone().add(i, 'days');
        if (isDateSelectable(checkDate)) {
          onDateSelect(checkDate);
          break;
        }
      }
    }
  };

  const isDateSelectable = (date: moment.Moment) => {
    const inRange = date.isBetween(minDate, maxDate, 'day', '[]');
    const whitelisted = datesWhitelist ? datesWhitelist(date) : true;
    return inRange && whitelisted;
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
          const isSelectable = isDateSelectable(date);
          const dayName = date.format('ddd').toUpperCase();
          const dayNumber = date.format('D');

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayContainer,
                isSelected && styles.selectedDayContainer,
                !isSelectable && styles.disabledDayContainer,
              ]}
              onPress={() => handleDayPress(date)}
              disabled={!isSelectable}
            >
              <Text style={[
                styles.dayName,
                isSelected && styles.selectedDayName,
                !isSelectable && styles.disabledText,
              ]}>
                {dayName}
              </Text>
              <Text style={[
                styles.dayNumber,
                isSelected && styles.selectedDayNumber,
                !isSelectable && styles.disabledText,
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
    backgroundColor: 'transparent',
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  monthYearText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    width: '100%',
  },
  dayContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 45,
    borderRadius: 8,
  },
  selectedDayContainer: {
    backgroundColor: '#ffffff',
  },
  disabledDayContainer: {
    opacity: 0.5,
  },
  dayName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedDayName: {
    color: '#fa4616',
  },
  dayNumber: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedDayNumber: {
    color: '#fa4616',
  },
  disabledText: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
});

export default CustomCalendar;
