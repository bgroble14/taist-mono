import moment from 'moment-timezone';

export const userNotFound = 'User not found!';
export const itsYours = "It's yours!";

export const emailValidation = (email: string = '', message?: string) => {
  const re =
    /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

  if (email == undefined) {
    return 'Please enter valid email';
  }

  if (!re.test(email)) {
    return 'Please enter valid email';
  }

  if (message) {
    return message;
  }

  return '';
};

export const nameValidation = (name: string = '', message?: string) => {
  const re = /^[0-9a-zA-Z ]+$/;

  if (name == undefined) {
    return 'Please enter valid name';
  }

  if (name.indexOf(' ') < 0) {
    return 'Please enter full name';
  }

  if (!re.test(name)) {
    return 'Please enter valid name';
  }

  if (message) {
    return message;
  }

  return '';
};

export const passwordValidation = (password: string = '') => {
  if (password == undefined) {
    return 'Password must be at least 4 characters';
  }

  if (password.length < 4) {
    return 'Password must be at least 4 characters';
  }

  return '';
};

export const confirmPasswordValidation = (
  password: string = '',
  confirmPassword: string = '',
) => {
  if (confirmPassword) {
    if (confirmPassword.length < 8) {
      return 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
  }

  return '';
};

export const getFormattedPhoneNumber = (number: string = '') => {
  return `+${number.replace(/[^0-9]/g, '')}`;
};

export const getNumberWithoutSymbol = (number: string = '') => {
  return number.replace(/[^0-9]/g, '');
};

export const getLastStrings = (text: string = '', num: number) => {
  return text.substr(text.length - num);
};

export const getValidDate = (date: any) => {
  let validDate: any = null;

  if (typeof date === 'number' || typeof date === 'string') {
    validDate = new Date(date);
  } else if (typeof date === 'object') {
    validDate = date;
  } else {
    validDate = new Date();
  }

  return validDate;
};

export const getTimeFromString = (time: string) => {
  const date = `${moment().format('YYYY-MM-DD')}T${time}:00`;
  return new Date(date);
};

export const getFormattedDate = (date: any) => {
  if (date === undefined || date === null) return '';
  return moment(date).format('MMM DD, YYYY');
};

export const getFormattedDateTime = (date: any) => {
  if (date === undefined || date === null) return '';
  return moment(date).format('MMM DD, YYYY hh:mm A');
};

export const getFormattedDateCut = (date: any) => {
  if (date === undefined || date === null) return '';
  return moment(date).format('MM/DD/YY');
};

export const getFormattedTimeA = (date: any) => {
  if (date === undefined || date === null) return '';
  return moment(date).format('hh:mm A');
};

export const getFormattedTime = (date: any) => {
  if (date === undefined || date === null) return '';
  return moment(date).format('HH:mm');
};

export const getFormattedMilitaryTime = (date: any) => {
  if (date === undefined || date === null) return '';
  return moment(date).format('HHmm');
};

export const getDateStartTime = (date: any) => {
  if (date === undefined || date === null) return 0;
  const formattedString = moment(date).format('YYYY-MM-DD');
  return moment(formattedString).toDate().getTime();
};

/**
 * Format date/time in a specific timezone
 * @param date - Unix timestamp in milliseconds or Date object
 * @param timezone - IANA timezone identifier (e.g., 'America/Chicago')
 * @returns Formatted string like "Dec 24, 2024 02:00 PM"
 */
export const getFormattedDateTimeInTimezone = (date: any, timezone?: string) => {
  if (date === undefined || date === null) return '';

  if (timezone) {
    return moment(date).tz(timezone).format('MMM DD, YYYY hh:mm A');
  }
  // Fallback to device timezone if no timezone specified
  return moment(date).format('MMM DD, YYYY hh:mm A');
};

/**
 * Format just the date in a specific timezone
 * @param date - Unix timestamp in milliseconds or Date object
 * @param timezone - IANA timezone identifier (e.g., 'America/Chicago')
 * @returns Formatted string like "Dec 24, 2024"
 */
export const getFormattedDateInTimezone = (date: any, timezone?: string) => {
  if (date === undefined || date === null) return '';

  if (timezone) {
    return moment(date).tz(timezone).format('MMM DD, YYYY');
  }
  return moment(date).format('MMM DD, YYYY');
};

/**
 * Format just the time in a specific timezone
 * @param date - Unix timestamp in milliseconds or Date object
 * @param timezone - IANA timezone identifier (e.g., 'America/Chicago')
 * @returns Formatted string like "02:00 PM"
 */
export const getFormattedTimeInTimezone = (date: any, timezone?: string) => {
  if (date === undefined || date === null) return '';

  if (timezone) {
    return moment(date).tz(timezone).format('hh:mm A');
  }
  return moment(date).format('hh:mm A');
};

export const getArrayFromStringWithBreak = (value: string) => {
  if (!value) {
    return [];
  }

  return value.split('\n');
};

export default {
  emailValidation,
  nameValidation,
  passwordValidation,
  confirmPasswordValidation,
  getFormatedPhoneNumber: getFormattedPhoneNumber,
  getValidDate,
  getArrayFromStringWithBreak,
};
