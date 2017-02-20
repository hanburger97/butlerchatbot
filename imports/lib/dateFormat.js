import moment from 'moment' 

moment.locale('fr');

export function getShortFormat(date) {
  return moment(date).format('DD-MM-YYYY')
}
