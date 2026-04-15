import dayjs from 'dayjs';

export const useCalendar = (currentMonth: dayjs.Dayjs) => {
  const startOfMonth = currentMonth.startOf('month');
  const endOfMonth = currentMonth.endOf('month');

  const startDate = startOfMonth.startOf('week');
  const endDate = endOfMonth.endOf('week');

  const days = [];
  let date = startDate;

  while (date.isBefore(endDate) || date.isSame(endDate)) {
    days.push(date);
    date = date.add(1, 'day');
  }

  return days;
};
