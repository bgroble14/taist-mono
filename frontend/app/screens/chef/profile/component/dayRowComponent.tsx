import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import StyledCheckBox from '../../../../components/styledCheckBox';
import { getFormattedTimeA } from '../../../../utils/validations';
import { styles } from '../styles';

type Props = {day: any; onDayChanged: (newDay: any) => void};

export const DayRowComponent = ({day, onDayChanged}: Props) => {
  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);

  const startDT = moment().startOf('day').toDate();
  const endDT = moment().endOf('day').toDate();

  const startTime = moment().startOf('day').toDate();
  const endTime = moment().endOf('day').toDate();
  if (day.start) {
    const t = day.start as Date;
    startTime.setHours(t.getHours());
    startTime.setMinutes(t.getMinutes());
  }
  if (day.end) {
    const t = day.end as Date;
    endTime.setHours(t.getHours());
    endTime.setMinutes(t.getMinutes());
  }

  return (
    <View style={styles.row} key={`drc_${day.id}`}>
      <View style={styles.col_days}>
        <StyledCheckBox
          label={day.day}
          value={day.checked}
          onPress={() => onDayChanged({...day, checked: !day.checked})}
        />
      </View>
      <View style={styles.col_start}>
        <TouchableOpacity
          style={styles.timeBox}
          onPress={() => setOpenStartPicker(true)}
          disabled={day?.checked != true}>
          <Text style={styles.text}>
            {day.checked ? getFormattedTimeA(day.start) : ''}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.col_end}>
        <TouchableOpacity
          style={styles.timeBox}
          onPress={() => setOpenEndPicker(true)}
          disabled={day?.checked != true}>
          <Text style={styles.text}>
            {day.checked ? getFormattedTimeA(day.end) : ''}
          </Text>
        </TouchableOpacity>
      </View>
      {openStartPicker && (
        <DateTimePicker
          mode="time"
          value={startTime}
          onChange={(event, date) => {
            setOpenStartPicker(false);
            if (date) {
              var newDay = {...day, start: date};
              onDayChanged(newDay);
            }
          }}
        />
      )}
      {openEndPicker && (
        <DateTimePicker
          mode="time"
          value={endTime}
          onChange={(event, date) => {
            setOpenEndPicker(false);
            if (date) {
              var newDay = {...day, end: date};
              onDayChanged(newDay);
            }
          }}
        />
      )}
    </View>
  );
};
