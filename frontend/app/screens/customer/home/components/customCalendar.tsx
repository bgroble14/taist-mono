import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import moment from 'moment';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

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

  const handleTodayPress = () => {
    const today = moment();
    if (today.isBetween(minDate, maxDate, 'day', '[]')) {
      onDateSelect(today);
    }
  };

  const isToday = moment().isSame(selectedDate, 'day');

  // Swipe gesture for week navigation
  const translateX = useSharedValue(0);
  const SWIPE_THRESHOLD = 50;

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Only activate after 10px horizontal movement
    .onUpdate((e) => {
      translateX.value = e.translationX * 0.5; // Dampen the movement
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        runOnJS(navigateWeek)('next');
      } else if (e.translationX > SWIPE_THRESHOLD) {
        runOnJS(navigateWeek)('prev');
      }
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    });

  const animatedWeekStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Month/Year Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateWeek('prev')}
        >
          <FontAwesomeIcon icon={faChevronLeft} size={16} color="#fa4616" />
        </TouchableOpacity>
        
        <View style={styles.centerContent}>
          <Text style={styles.monthYearText}>{monthYearText}</Text>
          {!isToday && (
            <TouchableOpacity 
              style={styles.todayButton}
              onPress={handleTodayPress}
            >
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateWeek('next')}
        >
          <FontAwesomeIcon icon={faChevronRight} size={16} color="#fa4616" />
        </TouchableOpacity>
      </View>

      {/* Week Strip - Swipeable */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.weekContainer, animatedWeekStyle]}>
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
        </Animated.View>
      </GestureDetector>
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
  centerContent: {
    alignItems: 'center',
    gap: 6,
  },
  monthYearText: {
    color: '#1a1a1a', // Dark text
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  todayButton: {
    backgroundColor: '#fa4616',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  navButton: {
    padding: 8,
  },
  weekContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    justifyContent: 'space-between',
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
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#fa4616',
    shadowColor: '#fa4616',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#fa4616', // Red text when selected
  },
  dayNumber: {
    color: '#1a1a1a', // Dark text
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedDayNumber: {
    color: '#fa4616', // Red text when selected
  },
  disabledText: {
    color: '#cccccc', // Light gray for disabled
  },
});

export default CustomCalendar;
